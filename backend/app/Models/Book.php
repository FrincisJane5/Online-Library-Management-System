<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'call_number',
        'title',
        'author',
        'category',
        'total',
        'available',
        'borrowed',
        'damaged',
        'lost',
        'status',
    ];

    // Include frontend-friendly aliases in JSON responses.
    protected $appends = ['callNumber', 'totalCopies'];

    public function getCallNumberAttribute(): string
    {
        return $this->attributes['call_number'] ?? 'N/A';
    }

    public function getTotalCopiesAttribute(): int
    {
        return (int) ($this->attributes['total'] ?? 0);
    }

    protected $hidden = ['call_number', 'total'];
}
