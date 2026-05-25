<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * ForceCors — manually injects CORS headers on every response.
 * Needed because the frontend (Vite dev server) runs on a different port than the Laravel backend.
 * Handles OPTIONS preflight requests so browsers don't block API calls.
 */
class ForceCors
{
    public function handle(Request $request, Closure $next): Response
    {
        // Reflect the request's Origin back so credentials work correctly
        $origin           = $request->header('Origin') ?? '*';
        $allowCredentials = env('DEMO_MODE', false) ? 'true' : 'false';

        // Respond immediately to OPTIONS preflight requests — no need to hit the controller
        if ($request->isMethod('OPTIONS')) {
            return response()->noContent(204)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-TOKEN, X-User-Name, X-User-Role, X-User-Id')
                ->header('Access-Control-Allow-Credentials', $allowCredentials)
                ->header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
        }

        // For all other requests, process normally then attach CORS headers to the response
        $response = $next($request);

        return $response
            ->header('Access-Control-Allow-Origin', $origin)
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-TOKEN, X-User-Name, X-User-Role, X-User-Id')
            ->header('Access-Control-Allow-Credentials', $allowCredentials);
    }
}
