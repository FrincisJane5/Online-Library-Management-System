<?php
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\BookController;

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::get('/test', function () {
    return "API WORKING";
});
Route::post('/attendance', [AttendanceController::class, 'store']);
Route::get('/attendance', [AttendanceController::class, 'index']);

Route::get('/books', [BookController::class, 'index']);
Route::post('/books', [BookController::class, 'store']);
Route::delete('/books/{book}', [BookController::class, 'destroy']);
