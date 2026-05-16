<?php

namespace App\Http\Controllers;

use App\Mail\BorrowConfirmationMail;
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
        return response()->json(
            BorrowingRecord::with('book')->latest()->get()->map(fn($r) => [
                'id'             => $r->id,
                'student_name'   => $r->student_name,
                'email'          => $r->email,
                'contact_number' => $r->contact_number,
                'course'         => $r->course,
                'year'           => $r->year,
                'academic_year'  => $r->academic_year,
                'semester'       => $r->semester,
                'book_title'     => $r->book_title,
                'call_number'    => $r->call_number,
                'borrow_date'    => $r->borrow_date,
                'due_date'       => $r->due_date,
                'return_date'    => $r->return_date,
                'status'         => $r->status,
                'action'         => $r->action,
                'fine_amount'    => $r->fine_amount,
                'fine_status'    => $r->fine_status,
                'book'           => $r->book ? [
                    'id'         => $r->book->id,
                    'call_number'=> $r->book->call_number,
                    'title'      => $r->book->title,
                    'author'     => $r->book->author,
                    'publisher'  => $r->book->publisher,
                    'year'       => $r->book->year,
                    'available'  => $r->book->available,
                    'status'     => $r->book->status,
                ] : null,
            ])
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'student_name'   => 'required|string|max:255',
            'email'          => 'required|email',
            'contact_number' => 'required|string|max:50',
            'course'         => 'nullable|string|max:100',
            'year'           => 'nullable|string|max:50',
            'academic_year'  => 'nullable|string|max:20',
            'semester'       => 'nullable|string|max:50',
            'book_title'     => 'required|string|max:255',
            'call_number'    => 'nullable|string|max:100',
            'borrow_date'    => 'required|date',
            'due_date'       => 'required|date|after_or_equal:borrow_date',
        ]);

        $record = $this->service->borrow(
            $data,
            $request->header('X-User-Name', 'Staff'),
            $request->header('X-User-Role', 'staff')
        );

        // Send confirmation email to student
        try {
            Mail::to($record->email)->send(new BorrowConfirmationMail($record));
        } catch (\Throwable $e) {
            // Don't fail the request if mail fails
        }

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
        $fineRate = (float) (\App\Models\LibrarySetting::first()?->fine_rate ?? 5);

        $records = BorrowingRecord::latest()->get()
            ->map(function ($r) use ($fineRate) {
                $daysOverdue = max(0, Carbon::parse($r->due_date)->diffInDays(Carbon::today(), false));

                // For still-borrowed overdue books, compute the running fine automatically
                $fineAmount = $r->status === 'borrowed' && $daysOverdue > 0
                    ? $daysOverdue * $fineRate
                    : (float) $r->fine_amount;

                // Persist the auto-calculated fine so it stays up to date
                if ($r->status === 'borrowed' && $daysOverdue > 0 && $fineAmount !== (float) $r->fine_amount) {
                    $r->update(['fine_amount' => $fineAmount, 'fine_status' => 'unpaid']);
                }

                return [
                    'id'               => $r->id,
                    'studentName'      => $r->student_name,
                    'studentEmail'     => $r->email,
                    'studentPhone'     => $r->contact_number,
                    'callNumber'       => $r->call_number,
                    'bookTitle'        => $r->book_title,
                    'dateBorrowed'     => $r->borrow_date,
                    'dueDate'          => $r->due_date,
                    'daysOverdue'      => $daysOverdue,
                    'fineAmount'       => $fineAmount,
                    'status'           => $r->fine_status,
                    'action'           => $r->action,
                    'lastNotification' => $r->last_notification_at
                        ? Carbon::parse($r->last_notification_at)->format('Y-m-d H:i')
                        : 'Never',
                ];
            })
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

    public function markUnpaid(Request $request, BorrowingRecord $borrowing)
    {
        $borrowing->update(['fine_status' => 'unpaid']);
        ActivityLog::create([
            'action'      => 'Fine',
            'description' => "Fine marked as unpaid for {$borrowing->student_name}",
            'user_name'   => $request->header('X-User-Name', 'Staff'),
            'user_role'   => $request->header('X-User-Role', 'staff'),
        ]);
        return response()->json(['message' => 'Fine marked as unpaid']);
    }

    public function sendReminder(Request $request, BorrowingRecord $borrowing)
    {
        $type    = $this->service->notificationType($borrowing);
        $message = $this->service->buildReminderMessage($borrowing);

        $status = 'Failed';
        $sentAt = null;
        if ($borrowing->email) {
            try {
                Mail::to($borrowing->email)->send(new OverdueReminderMail($borrowing));
                $status = 'Sent';
                $sentAt = now();
            } catch (\Throwable) {}
        }

        $borrowing->update(['last_notification_at' => now()]);

        \App\Models\NotificationLog::create([
            'borrowing_record_id' => $borrowing->id,
            'student_name'        => $borrowing->student_name,
            'student_email'       => $borrowing->email,
            'call_number'         => $borrowing->call_number,
            'book_title'          => $borrowing->book_title,
            'type'                => $type,
            'message'             => $message,
            'status'              => $status,
            'sent_at'             => $sentAt,
        ]);

        ActivityLog::create([
            'action'      => 'Notification',
            'description' => "Reminder ({$type}) sent to {$borrowing->student_name} for \"{$borrowing->book_title}\"",
            'user_name'   => $request->header('X-User-Name', 'Staff'),
            'user_role'   => $request->header('X-User-Role', 'staff'),
        ]);

        return response()->json(['message' => $status === 'Sent' ? "Reminder sent to {$borrowing->email}" : 'Notification logged (mail failed or no email)']);
    }

    public function sendReminders(Request $request)
    {
        $overdue = BorrowingRecord::where('status', 'borrowed')
            ->where('due_date', '<', Carbon::today()->toDateString())
            ->get();

        $sent = 0;
        foreach ($overdue as $record) {
            $type    = $this->service->notificationType($record);
            $message = $this->service->buildReminderMessage($record);

            $status = 'Failed';
            $sentAt = null;
            if ($record->email) {
                try {
                    Mail::to($record->email)->send(new OverdueReminderMail($record));
                    $status = 'Sent';
                    $sentAt = now();
                    $sent++;
                } catch (\Throwable) {}
            }

            $record->update(['last_notification_at' => now()]);

            \App\Models\NotificationLog::create([
                'borrowing_record_id' => $record->id,
                'student_name'        => $record->student_name,
                'student_email'       => $record->email,
                'call_number'         => $record->call_number,
                'book_title'          => $record->book_title,
                'type'                => $type,
                'message'             => $message,
                'status'              => $status,
                'sent_at'             => $sentAt,
            ]);
        }

        ActivityLog::create([
            'action'      => 'Notification',
            'description' => "Bulk overdue reminders sent ({$sent}/{$overdue->count()} succeeded)",
            'user_name'   => $request->header('X-User-Name', 'Staff'),
            'user_role'   => $request->header('X-User-Role', 'staff'),
        ]);

        return response()->json(['message' => "Reminders sent: {$sent} of {$overdue->count()}."]);
    }
}
