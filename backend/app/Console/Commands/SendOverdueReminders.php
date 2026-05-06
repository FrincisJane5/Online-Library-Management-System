<?php

namespace App\Console\Commands;

use App\Mail\OverdueReminderMail;
use App\Models\ActivityLog;
use App\Models\BorrowingRecord;
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

        foreach ($overdue as $record) {
            Mail::to($record->email)->send(new OverdueReminderMail($record));
            $record->update(['last_notification_at' => now()]);
        }

        if ($overdue->count() > 0) {
            ActivityLog::create([
                'action'      => 'Notification',
                'description' => "Automatic overdue reminders sent to {$overdue->count()} student(s)",
            ]);
        }

        $this->info("Sent reminders to {$overdue->count()} student(s).");
    }
}
