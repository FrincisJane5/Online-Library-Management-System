<?php

use Illuminate\Support\Facades\Route;

// Redirect root to React frontend
Route::get('/', fn() => redirect('http://localhost:5173'));

// Catch-all: redirect any non-API web request to React
Route::get('/{any}', fn() => redirect('http://localhost:5173'))->where('any', '.*');
