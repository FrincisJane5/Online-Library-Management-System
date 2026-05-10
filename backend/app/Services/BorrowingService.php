<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Book;
use App\Models\BorrowingRecord;
use App\Models\LibrarySetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class BorrowingService
{
    /** Build the reminder email message for a borrowing record. */
    public function buildReminderMessage(BorrowingRecord $record): string
    {
        $daysOverdue = max(0, Carbon::parse($record->due_date)->diffInDays(Carbon::today(), false));
        $type        = $record->fine_amount > 0 ? 'Fine Reminder' : 'Overdue';
        $msg         = "Dear {$record->student_name},\n\nYour borrowed book \"{$record->book_title}\"";
        if ($record->call_number) $msg .= " (Call No: {$record->call_number})";
        $msg .= $type === 'Fine Reminder'
            ? " is {$daysOverdue} day(s) overdue. Fine: ₱" . number_format($record->fine_amount, 2) . ". Please return and settle at the library."
            : " is {$daysOverdue} day(s) overdue (due: {$record->due_date}). Please return immediately.";
        return $msg . "\n\n— Legacy College of Compostela Library";
    }

    /** Determine notification type from a borrowing record. */
    public function notificationType(BorrowingRecord $record): string
    {
        return $record->fine_amount > 0 ? 'Fine Reminder' : 'Overdue';
    }

    public function borrow(array $data, string $userName = 'Staff', string $userRole = 'staff'): BorrowingRecord
    {
        return DB::transaction(function () use ($data, $userName, $userRole) {
            // Look up by call_number first, fall back to any available copy of same title
            $book = null;
            if (!empty($data['call_number'])) {
                $book = Book::where('call_number', $data['call_number'])
                    ->where('available', '>', 0)
                    ->lockForUpdate()->first();
            }
            if (!$book && !empty($data['book_title'])) {
                $book = Book::where('title', $data['book_title'])
                    ->where('available', '>', 0)
                    ->lockForUpdate()->first();
            }

            if (!$book) {
                abort(422, 'No available copy of this book found.');
            }
            $book->decrement('available');
            $book->increment('borrowed');
            if ($book->available <= 0) $book->update(['status' => 'Borrowed']);

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

    public function return(BorrowingRecord $record, ?string $action, string $userName = 'Staff', string $userRole = 'staff'): BorrowingRecord
    {
        if ($record->status === 'returned') return $record;

        return DB::transaction(function () use ($record, $action, $userName, $userRole) {
            $settings    = LibrarySetting::first();
            $fineRate    = (float) ($settings?->fine_rate ?? 5);
            $daysOverdue = max(0, Carbon::parse($record->due_date)->diffInDays(Carbon::today(), false));
            $fine        = $daysOverdue * $fineRate;

            if ($action === 'damaged') $fine += (float) ($settings?->damaged_fine ?? 100);
            if ($action === 'lost')    $fine += (float) ($settings?->lost_fine    ?? 500);

            $record->update([
                'status'      => 'returned',
                'action'      => $action,
                'return_date' => Carbon::today()->toDateString(),
                'fine_amount' => $fine,
                'fine_status' => $fine > 0 ? 'unpaid' : 'paid',
            ]);

            if ($record->book_title || $record->call_number) {
                $book = null;
                if ($record->call_number) {
                    $book = Book::where('call_number', $record->call_number)->first();
                }
                if (!$book && $record->book_title) {
                    $book = Book::where('title', $record->book_title)->first();
                }
                if ($book) {
                    $book->decrement('borrowed');
                    match ($action) {
                        'damaged' => (function() use ($book) {
                            $book->increment('damaged');
                            $book->update(['status' => 'Damaged']);
                        })(),
                        'lost' => (function() use ($book) {
                            $book->increment('lost');
                            $book->update(['status' => 'Lost']);
                        })(),
                        default => (function() use ($book) {
                            $book->increment('available');
                            $book->update(['status' => 'Available']);
                        })(),
                    };
                }
            }

            $desc = "{$record->student_name} returned \"{$record->book_title}\"";
            if ($action) $desc .= ' [' . strtoupper($action) . ']';

            ActivityLog::create([
                'action'      => 'Return',
                'description' => $desc,
                'user_name'   => $userName,
                'user_role'   => $userRole,
            ]);

            return $record->fresh();
        });
    }
}
