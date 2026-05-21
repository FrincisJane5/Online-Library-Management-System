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

/**
 * BorrowingController — manages the full borrow/return lifecycle and fine tracking.
 * Delegates business logic to BorrowingService to keep this controller thin.
 */
class BorrowingController extends Controller
{
    /** Inject BorrowingService via constructor for borrow/return logic */
    public function __construct(private BorrowingService $service) {}

    /**
     * GET /api/borrowings
     * Returns all borrowing records with their associated book details.
     */
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
                // Include book snapshot for the BorrowingDetails panel
                'book'           => $r->book ? [
                    'id'          => $r->book->id,
                    'call_number' => $r->book->call_number,
                    'title'       => $r->book->title,
                    'author'      => $r->book->author,
                    'publisher'   => $r->book->publisher,
                    'year'        => $r->book->year,
                    'available'   => $r->book->available,
                    'status'      => $r->book->status,
                ] : null,
            ])
        );
    }

    /**
     * POST /api/borrowings
     * Creates a new borrow record, decrements book availability, and sends a confirmation email.
     */
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

        // Delegate to service — handles book lookup, copy decrement, and record creation
        $record = $this->service->borrow(
            $data,
            $request->header('X-User-Name', 'Staff'),
            $request->header('X-User-Role', 'staff')
        );

        // Send confirmation email — non-fatal if mail fails
        try {
            Mail::to($record->email)->send(new BorrowConfirmationMail($record));
        } catch (\Throwable $e) {
            // Don't fail the request if mail fails
        }

        return response()->json($record, 201);
    }

    /**
     * POST /api/borrowings/{borrowing}/return
     * Marks a book as returned, calculates fines, and updates book copy counts.
     */
    public function returnBook(Request $request, BorrowingRecord $borrowing)
    {
        $record = $this->service->return(
            $borrowing,
            $request->input('action'),      // null | "damaged" | "lost"
            $request->header('X-User-Name', 'Staff'),
            $request->header('X-User-Role', 'staff'),
            $request->input('description')  // Optional description of damage/loss
        );

        return response()->json($record);
    }

    /**
     * GET /api/fines
     * Returns all records with overdue days or fines.
     * Auto-calculates and persists running fines for still-borrowed overdue books.
     */
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
            // Only include records that actually have overdue days or a fine
            ->filter(fn($r) => $r['daysOverdue'] > 0 || $r['fineAmount'] > 0)
            ->values();

        return response()->json($records);
    }

    /** PATCH /api/fines/{borrowing}/pay — marks a fine as paid */
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

    /** PATCH /api/fines/{borrowing}/unpay — marks a fine as unpaid */
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

    /**
     * POST /api/fines/{borrowing}/remind
     * Sends a single overdue reminder email and logs the notification.
     */
    public function sendReminder(Request $request, BorrowingRecord $borrowing)
    {
        $type    = $this->service->notificationType($borrowing);
        $message = $this->service->buildReminderMessage($borrowing);

        $status = 'Failed';
        $sentAt = null;

        // Attempt to send the email — log as Failed if it throws
        if ($borrowing->email) {
            try {
                Mail::to($borrowing->email)->send(new OverdueReminderMail($borrowing));
                $status = 'Sent';
                $sentAt = now();
            } catch (\Throwable) {}
        }

        // Update the last notification timestamp regardless of success
        $borrowing->update(['last_notification_at' => now()]);

        // Save a notification log entry for the Notifications page
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

        return response()->json(['message' => $status === 'Sent'
            ? "Reminder sent to {$borrowing->email}"
            : 'Notification logged (mail failed or no email)']);
    }

    /**
     * POST /api/fines/reminders
     * Sends overdue reminder emails to ALL currently overdue borrowers in bulk.
     */
    public function sendReminders(Request $request)
    {
        // Fetch all borrowed records that are past their due date
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
                    $record->update(['last_notification_at' => now()]);
                    $sent++;
                } catch (\Throwable) {}
            }

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
