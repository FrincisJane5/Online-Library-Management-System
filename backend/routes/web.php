<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Mail\HelloWorldMail;

Route::get('/test-mail', function () {
    Mail::to('test@example.com')->send(new HelloWorldMail());
    return 'Hello World email sent!';
});
use App\Http\Controllers\AttendanceController;


use App\Http\Controllers\DashboardController;

use App\Http\Controllers\BookController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\LibrarySettingController;


Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', [DashboardController::class, 'index']);


