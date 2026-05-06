<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BorrowingRecord extends Model
{
    protected $fillable = [
        'student_name',
        'id_number',
        'email',
        'contact_number',
        'book_title',
        'call_number',
        'borrow_date',
        'due_date',
        'return_date',
        'status',   // borrowed | returned
        'action',   // damaged | lost (special cases only)
        'fine_amount',
        'fine_status',
        'last_notification_at',
    ];

    protected $casts = [
        'fine_amount' => 'float',
    ];
}
