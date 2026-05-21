<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Book;
use App\Models\BorrowingRecord;
use App\Models\LibrarySetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * BorrowingService — contains all business logic for borrowing and returning books.
 * Extracted from the controller to keep transactions, fine calculations,
 * and book copy management in one testable place.
 */
class BorrowingService
{
    /**
     * Build the reminder email message body for a borrowing record.
     * Used by both the manual reminder and the scheduled bulk reminder command.
     */
    public function buildReminderMessage(BorrowingRecord $record): string
    {
        $daysOverdue = max(0, Carbon::parse($record->due_date)->diffInDays(Carbon::today(), false));
        $type        = $record->fine_amount > 0 ? 'Fine Reminder' : 'Overdue';

        // Start with the greeting and book info
        $msg = "Dear {$record->student_name},\n\nYour borrowed book \"{$record->book_title}\"";
        if ($record->call_number) $msg .= " (Call No: {$record->call_number})";

        // Append different text depending on whether a fine has already been assessed
        $msg .= $type === 'Fine Reminder'
            ? " is {$daysOverdue} day(s) overdue. Fine: ₱" . number_format($record->fine_amount, 2) . ". Please return and settle at the library."
            : " is {$daysOverdue} day(s) overdue (due: {$record->due_date}). Please return immediately.";

        return $msg . "\n\n— Legacy College of Compostela Library";
    }

    /**
     * Determine the notification type label based on whether a fine exists.
     * Returns "Fine Reminder" if a fine has been assessed, otherwise "Overdue".
     */
    public function notificationType(BorrowingRecord $record): string
    {
        return $record->fine_amount > 0 ? 'Fine Reminder' : 'Overdue';
    }

    /**
     * Process a new book borrow transaction.
     * Finds an available copy, decrements its count, and creates the borrow record.
     * Wrapped in a DB transaction to prevent race conditions on concurrent borrows.
     */
    public function borrow(array $data, string $userName = 'Staff', string $userRole = 'staff'): BorrowingRecord
    {
        return DB::transaction(function () use ($data, $userName, $userRole) {
            // Try to find a copy by call_number first, then fall back to title
            $book = null;
            if (!empty($data['call_number'])) {
                $book = Book::where('call_number', $data['call_number'])
                    ->where('available', '>', 0)
                    ->lockForUpdate() // Prevent concurrent borrows of the same copy
                    ->first();
            }
            if (!$book && !empty($data['book_title'])) {
                $book = Book::where('title', $data['book_title'])
                    ->where('available', '>', 0)
                    ->lockForUpdate()
                    ->first();
            }

            if (!$book) {
                abort(422, 'No available copy of this book found.');
            }

            // Decrement available count and increment borrowed count
            $book->decrement('available');
            $book->increment('borrowed');

            // Mark the book as Borrowed if no copies remain on the shelf
            if ($book->available <= 0) $book->update(['status' => 'Borrowed']);

            // Create the borrow record with a snapshot of book and student info
            $record = BorrowingRecord::create([
                ...$data,
                'book_id'     => $book->id,
                'student_id'  => \App\Models\Student::where('student_id_number', $data['id_number'] ?? '')->value('id'),
                'book_title'  => $book->title ?? $data['book_title'],
                'call_number' => $book->call_number ?? $data['call_number'] ?? null,
                'status'      => 'borrowed',
                'fine_amount' => 0,
                'fine_status' => 'unpaid',
            ]);

            ActivityLog::create([
                'action'      => 'Borrow',
                'description' => "{$record->student_name} borrowed \"{$record->book_title}\"",
                'user_name'   => $userName,
                'user_role'   => $userRole,
            ]);

            return $record;
        });
    }

    /**
     * Process a book return transaction.
     * Calculates overdue and damage/loss fines, updates book copy counts,
     * and saves the return details. Idempotent — returns early if already returned.
     */
    public function return(BorrowingRecord $record, ?string $action, string $userName = 'Staff', string $userRole = 'staff', ?string $description = null): BorrowingRecord
    {
        // Guard: do nothing if the book was already returned
        if ($record->status === 'returned') return $record;

        return DB::transaction(function () use ($record, $action, $userName, $userRole, $description) {
            $settings    = LibrarySetting::first();
            $fineRate    = (float) ($settings?->fine_rate ?? 5);
            $daysOverdue = max(0, Carbon::parse($record->due_date)->diffInDays(Carbon::today(), false));

            // Base fine: days overdue × daily fine rate
            $fine = $daysOverdue * $fineRate;

            // Add one-time penalty for damaged or lost books
            if ($action === 'damaged') $fine += (float) ($settings?->damaged_fine ?? 100);
            if ($action === 'lost')    $fine += (float) ($settings?->lost_fine    ?? 500);

            // Save the return details
            $record->update([
                'status'      => 'returned',
                'action'      => $action,
                'description' => $description,          // Optional damage/loss description
                'return_date' => Carbon::today()->toDateString(),
                'fine_amount' => $fine,
                'fine_status' => $fine > 0 ? 'unpaid' : 'paid',
            ]);

            // Update the book's copy counts based on the return condition
            if ($record->book_title || $record->call_number) {
                $book = null;
                if ($record->call_number) {
                    $book = Book::where('call_number', $record->call_number)->first();
                }
                if (!$book && $record->book_title) {
                    $book = Book::where('title', $record->book_title)->first();
                }
                if ($book) {
                    $book->decrement('borrowed'); // One fewer copy is checked out
                    match ($action) {
                        // Damaged: move copy from borrowed to damaged, mark book status
                        'damaged' => (function() use ($book) {
                            $book->increment('damaged');
                            $book->update(['status' => 'Damaged']);
                        })(),
                        // Lost: move copy from borrowed to lost, mark book status
                        'lost' => (function() use ($book) {
                            $book->increment('lost');
                            $book->update(['status' => 'Lost']);
                        })(),
                        // Normal return: copy goes back to available
                        default => (function() use ($book) {
                            $book->increment('available');
                            $book->update(['status' => 'Available']);
                        })(),
                    };
                }
            }

            // Build activity log description, appending condition if damaged/lost
            $desc = "{$record->student_name} returned \"{$record->book_title}\"";
            if ($action) $desc .= ' [' . strtoupper($action) . ']';

            ActivityLog::create([
                'action'      => 'Return',
                'description' => $desc,
                'user_name'   => $userName,
                'user_role'   => $userRole,
            ]);

            return $record->fresh(); // Return the updated record from the DB
        });
    }
}
