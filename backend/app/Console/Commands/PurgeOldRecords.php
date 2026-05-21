<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\BorrowingRecord;
use App\Models\NotificationLog;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * PurgeOldRecords — scheduled Artisan command that deletes records older than 30 days.
 * Runs daily at midnight via the scheduler in routes/console.php.
 * Keeps the database lean by removing stale borrowing, attendance, log, and notification data.
 */
class PurgeOldRecords extends Command
{
    protected $signature   = 'library:purge-old-records';
    protected $description = 'Delete borrowing details, attendance, activity logs, and notifications older than 30 days';

    public function handle(): void
    {
        // Calculate the cutoff timestamp: anything created before this is deleted
        $cutoff = Carbon::now()->subDays(30);

        // Delete from each table and report the count of deleted rows
        $counts = [
            'borrowing records' => BorrowingRecord::where('created_at', '<', $cutoff)->delete(),
            'attendance'        => Attendance::where('created_at', '<', $cutoff)->delete(),
            'activity logs'     => ActivityLog::where('created_at', '<', $cutoff)->delete(),
            'notifications'     => NotificationLog::where('created_at', '<', $cutoff)->delete(),
        ];

        foreach ($counts as $label => $deleted) {
            $this->info("Deleted {$deleted} {$label}.");
        }
    }
}
