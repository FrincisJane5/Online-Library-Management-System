<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\LibrarySettingController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

// ─── Public ──────────────────────────────────────────────────────────────────
Route::post('/auth/login',           [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [ForgotPasswordController::class, 'send']);
Route::post('/attendance',           [AttendanceController::class, 'store']);
Route::get('/programs',              [ProgramController::class, 'index']);
Route::get('/network-url',           fn() => response()->json([
    'url' => 'http://' . gethostbyname(gethostname()) . ':3000',
]));

// ─── Staff + Admin (authenticated via X-User-Role header) ────────────────────
Route::middleware([])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Books — read & lookup open to staff; write protected below
    Route::get('/books',        [BookController::class, 'index']);
    Route::get('/books/lookup', [BookController::class, 'lookup']);

    // Borrowing
    Route::get('/borrowings',                    [BorrowingController::class, 'index']);
    Route::post('/borrowings',                   [BorrowingController::class, 'store']);
    Route::post('/borrowings/{borrowing}/return',[BorrowingController::class, 'returnBook']);

    // Fines
    Route::get('/fines',                    [BorrowingController::class, 'fines']);
    Route::post('/fines/reminders',         [BorrowingController::class, 'sendReminders']);
    Route::patch('/fines/{borrowing}/pay',  [BorrowingController::class, 'markPaid']);
    Route::patch('/fines/{borrowing}/unpay',[BorrowingController::class, 'markUnpaid']);
    Route::post('/fines/{borrowing}/remind',[BorrowingController::class, 'sendReminder']);

    // Attendance management (read)
    Route::get('/attendance', [AttendanceController::class, 'index']);

    // Notifications & Logs (read-only for staff)
    Route::get('/notifications',  [NotificationController::class, 'index']);
    Route::get('/activity-logs',  [ActivityLogController::class, 'index']);

    // Reports (read-only)
    Route::prefix('reports')->group(function () {
        Route::get('/attendance', [ReportsController::class, 'attendance']);
        Route::get('/borrowing',  [ReportsController::class, 'borrowing']);
        Route::get('/inventory',  [ReportsController::class, 'inventory']);
        Route::get('/overdue',    [ReportsController::class, 'overdue']);
    });

    // Settings (read)
    Route::get('/settings', [LibrarySettingController::class, 'show']);
});

// ─── Admin Only ───────────────────────────────────────────────────────────────
Route::middleware(['admin'])->group(function () {

    // Book management (write)
    Route::post('/books',          [BookController::class, 'store']);
    Route::put('/books/{book}',    [BookController::class, 'update']);
    Route::delete('/books/{book}', [BookController::class, 'destroy']);

    // User management
    Route::get('/users',                          [UserManagementController::class, 'index']);
    Route::post('/users',                         [UserManagementController::class, 'store']);
    Route::put('/users/{user}',                   [UserManagementController::class, 'update']);
    Route::patch('/users/{user}/status',          [UserManagementController::class, 'setStatus']);
    Route::patch('/users/{user}/reset-password',  [UserManagementController::class, 'resetPassword']);

    // Settings (write)
    Route::put('/settings', [LibrarySettingController::class, 'update']);

    // Program management
    Route::post('/programs',              [ProgramController::class, 'store']);
    Route::put('/programs/{program}',     [ProgramController::class, 'update']);
    Route::delete('/programs/{program}',  [ProgramController::class, 'destroy']);
});
