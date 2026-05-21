<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * LibrarySetting — stores the single row of global library configuration.
 * There is always exactly one row; use firstOrCreate([]) to retrieve it.
 * Admins edit these values through the Settings page.
 */
class LibrarySetting extends Model
{
    /** Columns that can be mass-assigned */
    protected $fillable = [
        'loan_duration',       // Default number of days a book can be borrowed
        'fine_rate',           // Fine per day for overdue books (in pesos)
        'damaged_fine',        // One-time fine added when a book is returned damaged
        'lost_fine',           // One-time fine added when a book is reported lost
        'open_time',           // Library opening time (HH:MM format)
        'close_time',          // Library closing time (HH:MM format)
        'email_notifications', // Whether to send email reminders for overdue books
        'sms_notifications',   // Whether to send SMS reminders (future feature)
        'library_policies',    // Free-text field for library rules displayed to users
    ];
}
