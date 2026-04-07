<?php
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::get('/test', function () {
    return "API WORKING";
});
Route::post('/attendance', [AttendanceController::class, 'store']);
Route::get('/attendance', [AttendanceController::class, 'index']);