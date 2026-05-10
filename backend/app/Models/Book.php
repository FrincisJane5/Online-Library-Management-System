<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'call_number',
        'title',
        'author',
        'pages',
        'cost_price',
        'publisher',
        'year',
        'remarks',
        'total',
        'available',
        'borrowed',
        'damaged',
        'lost',
        'status',
    ];

    protected $casts = [
        'total'      => 'integer',
        'available'  => 'integer',
        'borrowed'   => 'integer',
        'damaged'    => 'integer',
        'lost'       => 'integer',
        'pages'      => 'integer',
        'cost_price' => 'decimal:2',
        'year'       => 'integer',
        'remarks'    => 'date:Y-m-d',
    ];

    /** One book → many borrowing records */
    public function borrowings()
    {
        return $this->hasMany(BorrowingRecord::class, 'book_id');
    }
}
