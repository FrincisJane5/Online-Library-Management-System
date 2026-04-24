<?php
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\LibrarySettingController;

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::get('/test', function () {
    return "API WORKING";
});
Route::post('/attendance', [AttendanceController::class, 'store']);
Route::post('/attendance/manual', [AttendanceController::class, 'store']);
Route::get('/attendance', [AttendanceController::class, 'index']);

Route::get('/books', [BookController::class, 'index']);
Route::post('/books', [BookController::class, 'store']);
Route::put('/books/{book}', [BookController::class, 'update']);
Route::delete('/books/{book}', [BookController::class, 'destroy']);

Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/users', [UserManagementController::class, 'index']);
Route::post('/users', [UserManagementController::class, 'store']);
Route::put('/users/{user}', [UserManagementController::class, 'update']);
Route::patch('/users/{user}/status', [UserManagementController::class, 'setStatus']);

Route::get('/borrowings', [BorrowingController::class, 'index']);
Route::post('/borrowings', [BorrowingController::class, 'store']);
Route::post('/borrowings/{borrowing}/return', [BorrowingController::class, 'returnBook']);
Route::get('/fines', [BorrowingController::class, 'fines']);
Route::patch('/fines/{borrowing}/pay', [BorrowingController::class, 'markPaid']);
Route::post('/fines/reminders', [BorrowingController::class, 'sendReminders']);

Route::get('/settings', [LibrarySettingController::class, 'show']);
Route::put('/settings', [LibrarySettingController::class, 'update']);
