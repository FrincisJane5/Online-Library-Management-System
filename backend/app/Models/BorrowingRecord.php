<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BorrowingRecord extends Model
{
    protected $fillable = [
        'book_id',
        'student_id',
        'student_name',
        'id_number',
        'email',
        'contact_number',
        'course',
        'year',
        'academic_year',
        'semester',
        'book_title',
        'call_number',
        'borrow_date',
        'due_date',
        'return_date',
        'status',
        'action',
        'fine_amount',
        'fine_status',
        'last_notification_at',
    ];

    protected $casts = [
        'fine_amount' => 'float',
    ];

    /** Many borrows → one book (FK: book_id) */
    public function book(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Book::class, 'book_id');
    }

    /** Many borrows → one student (FK: student_id) */
    public function student(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    /** One borrow → many notification logs */
    public function notifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(NotificationLog::class, 'borrowing_record_id');
    }
}
