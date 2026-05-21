<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Book — represents a physical book title in the library inventory.
 * Tracks copy counts across all states: available, borrowed, damaged, lost.
 */
class Book extends Model
{
    /** Columns that can be mass-assigned */
    protected $fillable = [
        'call_number', // Library call number used to locate the book on the shelf
        'title',       // Book title
        'author',      // Author name
        'pages',       // Number of pages
        'cost_price',  // Purchase price (used for inventory valuation)
        'publisher',   // Publisher name
        'year',        // Copyright/publication year
        'remarks',     // Date of acquisition or any notes (stored as a date)
        'total',       // Total copies owned by the library
        'available',   // Copies currently on the shelf and available to borrow
        'borrowed',    // Copies currently checked out
        'damaged',     // Copies marked as damaged
        'lost',        // Copies marked as lost
        'status',      // Overall status: Available | Borrowed | Damaged | Lost
    ];

    /** Cast numeric and date columns to their proper PHP types */
    protected $casts = [
        'total'      => 'integer',
        'available'  => 'integer',
        'borrowed'   => 'integer',
        'damaged'    => 'integer',
        'lost'       => 'integer',
        'pages'      => 'integer',
        'cost_price' => 'decimal:2',
        'year'       => 'integer',
        'remarks'    => 'date:Y-m-d', // Stored as a date, not a free-text string
    ];

    /**
     * One book → many borrowing records.
     * Lets us query all borrow history for a specific book.
     */
    public function borrowings()
    {
        return $this->hasMany(BorrowingRecord::class, 'book_id');
    }
}
