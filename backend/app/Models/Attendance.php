<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Attendance extends Model
{
  protected $fillable = [
    'id_number',
    'name',
    'email',
    'phone',
    'course',
    'year',
    'purpose'
];
}
