<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LibrarySetting extends Model
{
    protected $fillable = [
        'loan_duration',
        'fine_rate',
        'open_time',
        'close_time',
        'email_notifications',
        'sms_notifications',
        'library_policies',
    ];
}
