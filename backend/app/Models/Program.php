<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Program — represents an academic program/course offered by the college.
 * Used to populate the Course dropdown in the attendance form and borrow form.
 * Admins manage programs through the Settings page.
 */
class Program extends Model
{
    /** Columns that can be mass-assigned */
    protected $fillable = [
        'code',        // Short program code shown in dropdowns (e.g. "BSIT", "BSED")
        'name',        // Full program name (e.g. "Bachelor of Science in Information Technology")
        'total_years', // Number of year levels in this program (e.g. 4 for a 4-year course)
    ];

    /**
     * One program → many students enrolled in it.
     */
    public function students()
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Generate an ordered array of year level labels based on total_years.
     * Example: total_years = 4 → ["1st Year", "2nd Year", "3rd Year", "4th Year"]
     * Used by the API to send year level options to the frontend dropdown.
     */
    public function yearLevels(): array
    {
        // Ordinal suffixes for year numbers 1–10
        $ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

        // Build a label for each year from 1 to total_years
        return array_map(function ($i) use ($ordinals) {
            $label = $ordinals[$i - 1] ?? "{$i}th"; // Fall back to "{n}th" for > 10 years
            return "{$label} Year";
        }, range(1, $this->total_years));
    }
}
