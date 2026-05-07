<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\Book;
use App\Models\BorrowingRecord;
use App\Models\LibrarySetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class BorrowingService
{
    public function checkAttendance(string $idNumber): bool
    {
        return Attendance::where('id_number', $idNumber)
            ->whereDate('created_at', Carbon::today())
            ->exists();
    }

    public function borrow(array $data, string $userName = 'Staff', string $userRole = 'staff'): BorrowingRecord
    {
        return DB::transaction(function () use ($data, $userName, $userRole) {
            $book = Book::where('title', $data['book_title'])->lockForUpdate()->first();
            if ($book) {
                abort_if($book->available <= 0, 422, 'Book is not available.');
                $book->decrement('available');
                $book->increment('borrowed');
                if ($book->available <= 0) $book->update(['status' => 'Borrowed']);
            }

            $record = BorrowingRecord::create([
                ...$data,
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

            if ($record->book_title) {
                $book = Book::where('title', $record->book_title)->first();
                if ($book) {
                    $book->decrement('borrowed');
                    match ($action) {
                        'damaged' => $book->increment('damaged'),
                        'lost'    => $book->increment('lost'),
                        default   => tap($book->increment('available'), fn() =>
                            $book->available > 0 && $book->update(['status' => 'Available'])
                        ),
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
