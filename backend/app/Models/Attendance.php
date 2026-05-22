<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Attendance — records each library visit by a student or patron.
 * Created when a student submits the public attendance form (QR or direct URL).
 */
class Attendance extends Model
{
    use SoftDeletes;
    /** Columns that can be mass-assigned */
    protected $fillable = [
        'student_id', // FK to students table (nullable — walk-in visitors may not have a student record)
        'id_number',  // Student ID number typed in the form (e.g. "2024000001")
        'name',       // Full name of the visitor
        'email',      // Contact email
        'phone',      // Contact phone number (11 digits, starts with 09)
        'course',     // Program code (e.g. "BSIT") — must exist in programs table
        'year',       // Year level (e.g. "1st Year")
        'purpose',    // Reason for the visit (e.g. "Research", "Borrowing / Returning Books")
    ];

    /**
     * Many attendance records → one student.
     * Used to link walk-in logs back to a known student profile.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
