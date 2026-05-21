<?php

namespace App\Console\Commands;

use App\Mail\OverdueReminderMail;
use App\Models\BorrowingRecord;
use App\Models\NotificationLog;
use App\Services\BorrowingService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

/**
 * SendOverdueReminders — scheduled Artisan command that emails all overdue borrowers.
 * Runs daily at 08:00 AM via the scheduler in routes/console.php.
 * Logs each attempt (Sent or Failed) to the notification_logs table.
 */
class SendOverdueReminders extends Command
{
    protected $signature   = 'library:send-overdue-reminders';
    protected $description = 'Send overdue reminder emails to all students with unpaid fines';

    /** Inject BorrowingService for message building and type detection */
    public function __construct(private BorrowingService $service)
    {
        parent::__construct();
    }

    public function handle(): void
    {
        // Fetch all borrowed records that are past their due date and have an email address
        $overdue = BorrowingRecord::where('status', 'borrowed')
            ->where('fine_status', 'unpaid')
            ->where('due_date', '<', Carbon::today()->toDateString())
            ->whereNotNull('email')
            ->get();

        $sent = 0;
        foreach ($overdue as $record) {
            $type    = $this->service->notificationType($record);
            $message = $this->service->buildReminderMessage($record);

            $status = 'Failed';
            $sentAt = null;

            try {
                Mail::to($record->email)->send(new OverdueReminderMail($record));
                $status = 'Sent';
                $sentAt = now();
                $record->update(['last_notification_at' => now()]);
                $sent++;
            } catch (\Throwable) {
                // Mail failed — still log the attempt as Failed
            }

            // Save a notification log entry regardless of success or failure
            NotificationLog::create([
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

        // Output a summary line to the console/log
        $this->info("Sent reminders to {$sent} of {$overdue->count()} student(s).");
    }
}
