<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (strtolower($request->header('X-User-Role', '')) !== 'admin') {
            return response()->json(['message' => 'Admin access required.'], 403);
        }

        return $next($request);
    }
}
