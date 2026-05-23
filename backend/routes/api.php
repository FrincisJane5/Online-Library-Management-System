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

// ─── Public routes (no authentication required) ───────────────────────────────
Route::post('/auth/login',           [AuthController::class, 'login']);           // Staff/admin login
Route::post('/auth/forgot-password', [ForgotPasswordController::class, 'send']);      // Send OTP to email
Route::post('/auth/verify-otp',      [ForgotPasswordController::class, 'verifyOtp']); // Verify OTP, get reset token
Route::post('/auth/reset-password',  [ForgotPasswordController::class, 'reset']);     // Set new password with token
Route::post('/attendance',           [AttendanceController::class, 'store']);     // Submit attendance form
Route::get('/attendance/check-id',   [AttendanceController::class, 'checkId']);   // Duplicate ID check
Route::get('/attendance/lookup',     [AttendanceController::class, 'lookup']);    // Auto-fill by ID
Route::get('/programs',              [ProgramController::class, 'index']);        // Course list for dropdowns
Route::get('/network-url', fn(Illuminate\Http\Request $r) => response()->json([  // Base URL for QR code generation
    'url' => $r->getSchemeAndHttpHost(),
]));

// ─── Staff + Admin routes ───────────────────────────────────────────'──────────
Route::middleware([])->group(function () {

    // Dashboard — aggregated stats, charts, and recent activity
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Books — full CRUD open to both staff and admin
    Route::get('/books',           [BookController::class, 'index']);
    Route::get('/books/lookup',    [BookController::class, 'lookup']);   // Autocomplete search
    Route::post('/books',          [BookController::class, 'store']);
    Route::put('/books/{book}',    [BookController::class, 'update']);
    Route::delete('/books/{book}', [BookController::class, 'destroy']);

    // Borrowing — create borrow records and process returns
    Route::get('/borrowings',                     [BorrowingController::class, 'index']);
    Route::post('/borrowings',                    [BorrowingController::class, 'store']);
    Route::post('/borrowings/{borrowing}/return', [BorrowingController::class, 'returnBook']);

    // Fines — view, mark paid/unpaid, and send reminders
    Route::get('/fines',                     [BorrowingController::class, 'fines']);
    Route::post('/fines/reminders',          [BorrowingController::class, 'sendReminders']); // Bulk remind
    Route::patch('/fines/{borrowing}/pay',   [BorrowingController::class, 'markPaid']);
    Route::patch('/fines/{borrowing}/unpay', [BorrowingController::class, 'markUnpaid']);
    Route::post('/fines/{borrowing}/remind', [BorrowingController::class, 'sendReminder']);  // Single remind

    // Attendance — read all records (write is public above)
    Route::get('/attendance', [AttendanceController::class, 'index']);

    // Notifications & Logs — read-only for staff
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);

    // Reports — all report types, read-only
    Route::prefix('reports')->group(function () {
        Route::get('/attendance',            [ReportsController::class, 'attendance']);
        Route::get('/borrowing',             [ReportsController::class, 'borrowing']);
        Route::get('/inventory',             [ReportsController::class, 'inventory']);
        Route::get('/overdue',               [ReportsController::class, 'overdue']);
        Route::get('/department-attendance', [ReportsController::class, 'departmentAttendance']);
        Route::get('/payment-collection',    [ReportsController::class, 'paymentCollection']);
    });

    // Settings — read is open to staff; write is admin-only (see below)
    Route::get('/settings', [LibrarySettingController::class, 'show']);
});

// ─── Admin-only routes ────────────────────────────────────────────────────────
// Protected by AdminMiddleware which checks the X-User-Role header
Route::middleware(['admin'])->group(function () {

    // User management — create, update, activate/deactivate staff accounts
    Route::get('/users',                         [UserManagementController::class, 'index']);
    Route::post('/users',                        [UserManagementController::class, 'store']);
    Route::put('/users/{user}',                  [UserManagementController::class, 'update']);
    Route::patch('/users/{user}/status',         [UserManagementController::class, 'setStatus']);
    Route::patch('/users/{user}/reset-password', [UserManagementController::class, 'resetPassword']);

    // Settings — write (update library configuration)
    Route::put('/settings', [LibrarySettingController::class, 'update']);

    // Program management — add, edit, delete academic programs
    Route::post('/programs',             [ProgramController::class, 'store']);
    Route::put('/programs/{program}',    [ProgramController::class, 'update']);
    Route::delete('/programs/{program}', [ProgramController::class, 'destroy']);
});
