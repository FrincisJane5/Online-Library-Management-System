<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * NotificationLog — records every overdue reminder notification sent to a borrower.
 * Created each time a reminder is sent (manually or via the scheduled command).
 * Displayed on the Notifications page for admin review.
 */
class NotificationLog extends Model
{
    use SoftDeletes;
    /** Columns that can be mass-assigned */
    protected $fillable = [
        'borrowing_record_id', // FK to borrowing_records — which transaction this reminder is for
        'student_name',        // Snapshot of the student's name at send time
        'student_email',       // Email address the notification was sent to
        'call_number',         // Call number of the overdue book
        'book_title',          // Title of the overdue book
        'type',                // Notification type: "Overdue" | "Fine Reminder"
        'message',             // Full text of the message that was sent
        'status',              // Delivery status: "Sent" | "Failed"
        'sent_at',             // Timestamp when the notification was sent (null if failed)
    ];

    /** Cast sent_at to a Carbon datetime instance for easy formatting */
    protected $casts = [
        'sent_at' => 'datetime',
    ];

    /**
     * Many notification logs → one borrowing record.
     * Lets us look up the full transaction details from a notification entry.
     */
    public function borrowingRecord()
    {
        return $this->belongsTo(BorrowingRecord::class, 'borrowing_record_id');
    }
}
