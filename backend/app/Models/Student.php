<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'student_id_number',
        'name',
        'email',
        'course',
        'year_level',
        'contact_number',
    ];
}
