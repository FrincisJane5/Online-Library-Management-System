<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = ['call_number', 'title', 'author', 'category', 'total', 'available', 'status'];

    // This tells Laravel to include these "mapped" names in the JSON output
   protected $appends = ['callNumber', 'totalCopies'];
   

public function getCallNumberAttribute()
    {
       return $this->getAttribute('call_number') ?? 'N/A';
    }

    public function getTotalCopiesAttribute()
    {
       return $this->getAttribute('total_copies') ?? 0;
    }

    protected $hidden = ['call_number', 'total_copies'];
}
