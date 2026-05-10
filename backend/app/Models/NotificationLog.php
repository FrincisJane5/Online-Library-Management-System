<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $fillable = [
        'borrowing_record_id',
        'student_name',
        'student_email',
        'call_number',
        'book_title',
        'type',
        'message',
        'status',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    /** Many notifications → one borrowing record */
    public function borrowingRecord()
    {
        return $this->belongsTo(BorrowingRecord::class, 'borrowing_record_id');
    }
}
