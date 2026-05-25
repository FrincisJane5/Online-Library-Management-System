<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * AppServiceProvider — the main application service provider.
 * Used to register custom bindings and bootstrap application-wide behavior.
 * Currently empty — extend this class if you need to bind interfaces or add global observers.
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Ensure the public/storage symlink exists on every boot.
        // This is a safety net for deployments that don't run `php artisan storage:link`.
        $link   = public_path('storage');
        $target = storage_path('app/public');

        if (!is_link($link) && !is_dir($link)) {
            // Remove the placeholder 0-byte file if it exists
            if (file_exists($link)) {
                @unlink($link);
            }
            @symlink($target, $link);
        }
    }
}
