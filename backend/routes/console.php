<?php

use Illuminate\Support\Facades\Schedule;

// Automatically send overdue reminder emails every day at 8:00 AM
Schedule::command('library:send-overdue-reminders')->dailyAt('08:00');
