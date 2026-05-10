<?php

namespace App\Console\Commands;

use App\Mail\OverdueReminderMail;
use App\Models\BorrowingRecord;
use App\Models\NotificationLog;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class SendOverdueReminders extends Command
{
    protected $signature   = 'library:send-overdue-reminders';
    protected $description = 'Send overdue reminder emails to all students with unpaid fines';

    public function handle(): void
    {
        $overdue = BorrowingRecord::where('status', 'borrowed')
            ->where('fine_status', 'unpaid')
            ->where('due_date', '<', Carbon::today()->toDateString())
            ->whereNotNull('email')
            ->get();

        $sent = 0;
        foreach ($overdue as $record) {
            $daysOverdue = max(0, Carbon::parse($record->due_date)->diffInDays(Carbon::today(), false));
            $type        = $record->fine_amount > 0 ? 'Fine Reminder' : 'Overdue';
            $message     = $this->buildMessage($record, $daysOverdue, $type);

            $status = 'Failed';
            $sentAt = null;
            try {
                Mail::to($record->email)->send(new OverdueReminderMail($record));
                $status = 'Sent';
                $sentAt = now();
                $record->update(['last_notification_at' => now()]);
                $sent++;
            } catch (\Throwable) {}

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

        $this->info("Sent reminders to {$sent} of {$overdue->count()} student(s).");
    }

    private function buildMessage(BorrowingRecord $record, int $daysOverdue, string $type): string
    {
        $base = "Dear {$record->student_name},\n\n";
        if ($type === 'Fine Reminder') {
            $base .= "Your borrowed book \"{$record->book_title}\"";
            if ($record->call_number) $base .= " (Call No: {$record->call_number})";
            $base .= " is {$daysOverdue} day(s) overdue. A fine of ₱" . number_format($record->fine_amount, 2) . " has been incurred.\n\nPlease return the book and settle your fine at the library counter immediately.";
        } else {
            $base .= "Your borrowed book \"{$record->book_title}\"";
            if ($record->call_number) $base .= " (Call No: {$record->call_number})";
            $base .= " is {$daysOverdue} day(s) overdue (due: {$record->due_date}).\n\nPlease return the book as soon as possible to avoid fines.";
        }
        $base .= "\n\n— Legacy College of Compostela Library";
        return $base;
    }
}
