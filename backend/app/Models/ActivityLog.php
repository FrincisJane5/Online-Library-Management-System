<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id', 'action', 'description', 'user_name', 'user_role',
    ];

    /** Many logs → one user (nullable — logs survive user deletion) */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
