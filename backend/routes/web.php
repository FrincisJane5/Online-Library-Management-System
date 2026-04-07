<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/LccLibraryAttendance', [AttendanceController::class, 'scanForm']);
Route::post('/LccLibraryAttendance', [AttendanceController::class, 'store']);