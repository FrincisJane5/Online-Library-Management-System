<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LibrarySettingController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/test', fn() => 'API WORKING');

// Dashboard
Route::get('/dashboard', [DashboardController::class, 'index']);

// Auth
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/login', fn() => redirect('http://localhost:3000/login'))->name('login');

// Books
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/lookup', [BookController::class, 'lookup']);
Route::post('/books', [BookController::class, 'store']);
Route::put('/books/{book}', [BookController::class, 'update']);
Route::delete('/books/{book}', [BookController::class, 'destroy']);

// Users
Route::get('/users', [UserManagementController::class, 'index']);
Route::post('/users', [UserManagementController::class, 'store']);
Route::put('/users/{user}', [UserManagementController::class, 'update']);
Route::patch('/users/{user}/status', [UserManagementController::class, 'setStatus']);

// Attendance
Route::get('/attendance', [AttendanceController::class, 'index']);
Route::post('/attendance', [AttendanceController::class, 'store']);
Route::post('/attendance/manual', [AttendanceController::class, 'store']);

// Borrowing & Returning
Route::get('/borrowings', [BorrowingController::class, 'index']);
Route::post('/borrowings', [BorrowingController::class, 'store']);
Route::post('/borrowings/{borrowing}/return', [BorrowingController::class, 'returnBook']);

// Fines
Route::get('/fines', [BorrowingController::class, 'fines']);
Route::post('/fines/reminders', [BorrowingController::class, 'sendReminders']);
Route::patch('/fines/{borrowing}/pay', [BorrowingController::class, 'markPaid']);
Route::post('/fines/{borrowing}/remind', [BorrowingController::class, 'sendReminder']);

// Activity Logs
Route::get('/activity-logs', [ActivityLogController::class, 'index']);

// Reports
Route::get('/reports/attendance', [ReportsController::class, 'attendance']);
Route::get('/reports/borrowing', [ReportsController::class, 'borrowing']);
Route::get('/reports/inventory', [ReportsController::class, 'inventory']);
Route::get('/reports/overdue', [ReportsController::class, 'overdue']);

// Settings
Route::get('/settings', [LibrarySettingController::class, 'show']);
Route::put('/settings', [LibrarySettingController::class, 'update']);
