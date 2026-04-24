<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\BorrowingRecord;
use App\Models\LibrarySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class BorrowingController extends Controller
{
    public function index()
    {
        return response()->json(BorrowingRecord::query()->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_name' => 'required|string|max:255',
            'id_number' => 'required|string|max:50',
            'email' => 'nullable|email',
            'contact_number' => 'nullable|string|max:50',
            'book_title' => 'required|string|max:255',
            'borrow_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:borrow_date',
        ]);

        $record = BorrowingRecord::create([
            ...$validated,
            'status' => 'Borrowed',
            'fine_amount' => 0,
            'fine_status' => 'Unpaid',
        ]);

        ActivityLog::create([
            'action' => 'Borrowing',
            'description' => $record->student_name . ' borrowed "' . $record->book_title . '"',
        ]);

        return response()->json($record, 201);
    }

    public function returnBook(BorrowingRecord $borrowing)
    {
        if ($borrowing->status === 'Returned') {
            return response()->json($borrowing);
        }

        $settings = LibrarySetting::query()->first();
        $fineRate = (float) ($settings?->fine_rate ?? 5);
        $due = Carbon::parse($borrowing->due_date);
        $today = Carbon::today();
        $daysOverdue = max(0, $due->diffInDays($today, false));
        $fineAmount = $daysOverdue * $fineRate;

        $borrowing->update([
            'status' => 'Returned',
            'return_date' => $today->toDateString(),
            'fine_amount' => $fineAmount,
            'fine_status' => $fineAmount > 0 ? 'Unpaid' : 'Paid',
        ]);

        ActivityLog::create([
            'action' => 'Returning',
            'description' => $borrowing->student_name . ' returned "' . $borrowing->book_title . '"',
        ]);

        return response()->json($borrowing->fresh());
    }

    public function fines()
    {
        $records = BorrowingRecord::query()->latest()->get()->map(function (BorrowingRecord $record) {
            $due = Carbon::parse($record->due_date);
            $daysOverdue = max(0, $due->diffInDays(Carbon::today(), false));
            return [
                'id' => $record->id,
                'studentName' => $record->student_name,
                'bookTitle' => $record->book_title,
                'dateBorrowed' => $record->borrow_date,
                'dueDate' => $record->due_date,
                'daysOverdue' => $daysOverdue,
                'fineAmount' => (float) $record->fine_amount,
                'status' => $record->fine_status,
                'lastNotification' => $record->last_notification_at ? Carbon::parse($record->last_notification_at)->format('Y-m-d H:i') : 'Never',
            ];
        })->filter(function (array $record) {
            return $record['daysOverdue'] > 0 || $record['fineAmount'] > 0;
        })->values();

        return response()->json($records);
    }

    public function markPaid(BorrowingRecord $borrowing)
    {
        $borrowing->update(['fine_status' => 'Paid']);
        ActivityLog::create([
            'action' => 'Fines',
            'description' => 'Fine marked as paid for ' . $borrowing->student_name,
        ]);
        return response()->json(['message' => 'Fine marked as paid']);
    }

    public function sendReminders()
    {
        $now = now();
        BorrowingRecord::query()
            ->where('fine_status', 'Unpaid')
            ->where('fine_amount', '>', 0)
            ->update(['last_notification_at' => $now]);

        ActivityLog::create([
            'action' => 'Fines',
            'description' => 'Overdue reminders sent',
        ]);

        return response()->json(['message' => 'Reminders sent']);
    }
}
