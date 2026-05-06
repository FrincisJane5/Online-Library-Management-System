<?php

use Illuminate\Support\Facades\Route;
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


