<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'title',
        'author',
        'total',
        'available',
        'borrowed',
        'damaged',
        'lost',
        'status',
    ];

    protected $casts = [
        'total'     => 'integer',
        'available' => 'integer',
        'borrowed'  => 'integer',
        'damaged'   => 'integer',
        'lost'      => 'integer',
    ];
}
