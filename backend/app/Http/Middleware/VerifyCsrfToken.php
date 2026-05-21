<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

/**
 * VerifyCsrfToken — CSRF protection middleware.
 * All API routes are excluded ('*') because the frontend uses stateless header-based auth,
 * not cookie/session-based auth, so CSRF tokens are not needed.
 */
class VerifyCsrfToken extends Middleware
{
    /**
     * URIs excluded from CSRF verification.
     * '*' means all routes are excluded — appropriate for a stateless API.
     *
     * @var array<int, string>
     */
    protected $except = ['*'];

    /**
     * Skip CSRF check entirely in DEMO_MODE.
     * In production, the parent class handles CSRF normally for any non-excluded routes.
     */
    public function handle($request, $next)
    {
        // Allow bypassing CSRF in demo/development mode via .env DEMO_MODE=true
        if (config('app.demo_mode') === true || env('DEMO_MODE') === true || env('DEMO_MODE') === 'true') {
            return $next($request);
        }

        return parent::handle($request, $next);
    }
}
