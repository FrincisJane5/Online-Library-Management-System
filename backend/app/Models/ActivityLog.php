<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * ActivityLog — records every significant action performed in the system.
 * Used by the Activity Logs page to give admins a full audit trail.
 */
class ActivityLog extends Model
{
    use SoftDeletes;
    /** Columns that can be mass-assigned via create() or fill() */
    protected $fillable = [
        'user_id',      // FK to users table (nullable — log survives if user is deleted)
        'action',       // Short label e.g. "Borrow", "Return", "Book Added"
        'description',  // Full human-readable description of what happened
        'user_name',    // Snapshot of the user's name at the time of the action
        'user_role',    // Snapshot of the user's role at the time of the action
    ];

    /**
     * Many logs → one user.
     * Nullable because logs should persist even after a user account is deleted.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
