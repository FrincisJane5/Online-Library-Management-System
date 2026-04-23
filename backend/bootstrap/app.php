<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // This is where the $middleware variable lives!
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'books',
            'attendance'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create(); // Internal code ends here. Do not put logic after this semicolon.