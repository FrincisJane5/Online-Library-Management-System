<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'student_id', 'id_number', 'name',
        'email', 'phone', 'course', 'year', 'purpose',
    ];

    /** Many attendances → one student */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
