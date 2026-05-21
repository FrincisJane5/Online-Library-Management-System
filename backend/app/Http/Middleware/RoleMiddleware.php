<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * RoleMiddleware — restricts a route to users with a specific role.
 * Used as: Route::middleware(['role:admin']) or Route::middleware(['role:staff']).
 * Note: The system primarily uses AdminMiddleware (header-based) instead of this session-based one.
 */
class RoleMiddleware
{
    /**
     * @param Closure(Request): (Response) $next
     * @param string $role  The required role (e.g. "admin", "staff")
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Check that the user is authenticated and has the required role
        if (!Auth::check() || $request->user()->role !== $role) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
