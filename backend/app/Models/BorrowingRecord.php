<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * BorrowingRecord — represents one borrow/return transaction.
 * Created when a book is borrowed and updated when it is returned.
 * Also tracks overdue fines and any damage/loss condition.
 */
class BorrowingRecord extends Model
{
    use SoftDeletes;
    /** Columns that can be mass-assigned */
    protected $fillable = [
        'book_id',              // FK to books table — the specific book copy borrowed
        'student_id',           // FK to students table (nullable — may be a walk-in patron)
        'student_name',         // Snapshot of the borrower's name at borrow time
        'id_number',            // Borrower's student ID number
        'email',                // Borrower's email (used for overdue reminders)
        'contact_number',       // Borrower's phone number
        'course',               // Borrower's course/program at borrow time
        'year',                 // Borrower's year level at borrow time
        'academic_year',        // Academic year (e.g. "2024-2025")
        'semester',             // Semester (e.g. "1st Semester")
        'book_title',           // Snapshot of the book title at borrow time
        'call_number',          // Snapshot of the call number at borrow time
        'borrow_date',          // Date the book was borrowed (YYYY-MM-DD)
        'due_date',             // Date the book must be returned (YYYY-MM-DD)
        'return_date',          // Actual return date — null while still borrowed
        'status',               // "borrowed" | "returned"
        'action',               // Condition on return: null | "damaged" | "lost"
        'description',          // Optional description of the damage or loss condition
        'fine_amount',          // Total fine in pesos (overdue + damage/loss penalty)
        'fine_status',          // "paid" | "unpaid"
        'last_notification_at', // Timestamp of the last overdue reminder sent
    ];

    /** Cast fine_amount to a float so arithmetic works correctly */
    protected $casts = [
        'fine_amount' => 'float',
    ];

    /**
     * Many borrow records → one book (via book_id FK).
     * Used to update book copy counts on borrow/return.
     */
    public function book(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Book::class, 'book_id');
    }

    /**
     * Many borrow records → one student (via student_id FK).
     * Nullable — not all borrowers have a student profile.
     */
    public function student(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    /**
     * One borrow record → many notification logs.
     * Tracks every overdue reminder email sent for this transaction.
     */
    public function notifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(NotificationLog::class, 'borrowing_record_id');
    }
}
