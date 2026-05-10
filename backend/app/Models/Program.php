<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $fillable = ['code', 'name', 'total_years'];

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    /** Generate year level labels e.g. ['1st Year', '2nd Year', ...] */
    public function yearLevels(): array
    {
        $ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
        return array_map(fn($i) => "{$ordinals[$i - 1]} Year", range(1, $this->total_years));
    }
}
