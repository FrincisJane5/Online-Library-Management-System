<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     * These will bypass the security check entirely.
     *
     * @var array<int, string>
     */
    protected $except = ['*'];

    /**
     * Handle an incoming request.
     */
    public function handle($request, $next)
    {
        // Check if DEMO_MODE is true in your .env file
        if (config('app.demo_mode') === true || env('DEMO_MODE') === true || env('DEMO_MODE') === 'true') {
            return $next($request);
        }

        return parent::handle($request, $next);
    }
}