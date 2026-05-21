<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Student — represents a registered student profile.
 * Created automatically when a student submits the attendance form for the first time.
 * Links attendance and borrowing records back to a single student identity.
 */
class Student extends Model
{
    /** Columns that can be mass-assigned */
    protected $fillable = [
        'student_id_number', // Official student ID (e.g. "2024000001")
        'name',              // Full name
        'email',             // Contact email
        'course',            // Enrolled program code
        'year_level',        // Current year level (e.g. "2nd Year")
        'contact_number',    // Phone number (11 digits, starts with 09)
    ];

    /**
     * One student → many attendance records.
     * Tracks every library visit by this student.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * One student → many borrowing records.
     * Tracks every book borrowed by this student.
     */
    public function borrowings()
    {
        return $this->hasMany(BorrowingRecord::class);
    }
}
