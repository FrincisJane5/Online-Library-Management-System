<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'student_id_number', 'name', 'email',
        'course', 'year_level', 'contact_number',
    ];

    /** One student → many attendance records */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /** One student → many borrowing records */
    public function borrowings()
    {
        return $this->hasMany(BorrowingRecord::class);
    }
}
