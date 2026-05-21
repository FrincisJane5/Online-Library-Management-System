<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * AdminMiddleware — restricts a route to admin users only.
 * Reads the X-User-Role header set by the frontend on every request.
 * Returns 403 if the role is not "admin".
 */
class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Check the custom role header sent by the frontend axios interceptor
        if (strtolower($request->header('X-User-Role', '')) !== 'admin') {
            return response()->json(['message' => 'Admin access required.'], 403);
        }

        return $next($request); // Role is admin — allow the request through
    }
}
