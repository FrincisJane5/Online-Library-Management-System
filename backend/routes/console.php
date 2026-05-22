<?php

use Illuminate\Support\Facades\Schedule;

/**
 * Console schedule — defines all recurring Artisan commands.
 * Laravel runs these automatically when the scheduler cron is set up:
 *   * * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
 */

// Send overdue reminder emails to all borrowers with unpaid fines every day at 8:00 AM
Schedule::command('library:send-overdue-reminders')->dailyAt('08:00');

// Delete records older than 30 days every day at midnight to keep the database lean
Schedule::command('library:purge-old-records')->dailyAt('00:00');

// Backup the database every day at 11:00 PM — keeps the last 7 backups in storage/backups/
Schedule::command('db:backup')->dailyAt('23:00');
