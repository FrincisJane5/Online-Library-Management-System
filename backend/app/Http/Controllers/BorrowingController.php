<?php

namespace App\Http\Controllers;

use App\Mail\OverdueReminderMail;
use App\Models\ActivityLog;
use App\Models\BorrowingRecord;
use App\Services\BorrowingService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class BorrowingController extends Controller
{
    public function __construct(private BorrowingService $service) {}

    public function index()
    {
        return response()->json(BorrowingRecord::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'student_name'   => 'required|string|max:255',
            'id_number'      => 'required|string|max:50',
            'email'          => 'required|email|regex:/^[a-zA-Z0-9._%+\-]+@gmail\.com$/i',
            'contact_number' => 'required|string|max:50',
            'book_title'     => 'required|string|max:255',
            'borrow_date'    => 'required|date',
            'due_date'       => 'required|date|after_or_equal:borrow_date',
        ]);

        if (!$this->service->checkAttendance($data['id_number'])) {
            return response()->json([
                'message' => 'Borrowing not allowed. Student has no attendance record for today.',
                'error'   => 'no_attendance',
            ], 422);
        }

        $record = $this->service->borrow(
            $data,
            $request->header('X-User-Name', 'Staff'),
            $request->header('X-User-Role', 'staff')
        );

        return response()->json($record, 201);
    }

    public function returnBook(Request $request, BorrowingRecord $borrowing)
    {
        $record = $this->service->return(
            $borrowing,
            $request->input('action'),
            $request->header('X-User-Name', 'Staff'),
            $request->header('X-User-Role', 'staff')
        );

        return response()->json($record);
    }

    public function fines()
    {
        $records = BorrowingRecord::latest()->get()
            ->map(fn($r) => [
                'id'               => $r->id,
                'studentName'      => $r->student_name,
                'studentEmail'     => $r->email,
                'bookTitle'        => $r->book_title,
                'dateBorrowed'     => $r->borrow_date,
                'dueDate'          => $r->due_date,
                'daysOverdue'      => max(0, Carbon::parse($r->due_date)->diffInDays(Carbon::today(), false)),
                'fineAmount'       => (float) $r->fine_amount,
                'status'           => $r->fine_status,
                'action'           => $r->action,
                'lastNotification' => $r->last_notification_at
                    ? Carbon::parse($r->last_notification_at)->format('Y-m-d H:i')
                    : 'Never',
            ])
            ->filter(fn($r) => $r['daysOverdue'] > 0 || $r['fineAmount'] > 0)
            ->values();

        return response()->json($records);
    }

    public function markPaid(Request $request, BorrowingRecord $borrowing)
    {
        $borrowing->update(['fine_status' => 'paid']);
        ActivityLog::create([
            'action'      => 'Fine',
            'description' => "Fine marked as paid for {$borrowing->student_name}",
            'user_name'   => $request->header('X-User-Name', 'Staff'),
            'user_role'   => $request->header('X-User-Role', 'staff'),
        ]);
        return response()->json(['message' => 'Fine marked as paid']);
    }

    public function sendReminder(BorrowingRecord $borrowing)
    {
        if ($borrowing->email) {
            Mail::to($borrowing->email)->send(new OverdueReminderMail($borrowing));
        }

        $borrowing->update(['last_notification_at' => now()]);

        ActivityLog::create([
            'action'      => 'Notification',
            'description' => "Overdue reminder sent to {$borrowing->student_name} for \"{$borrowing->book_title}\"",
        ]);

        return response()->json([
            'message' => $borrowing->email
                ? "Reminder sent to {$borrowing->email}"
                : 'Notification logged (no email on record)',
        ]);
    }
}
