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
        $link   = public_path('storage');
        $target = storage_path('app/public');

        if (!is_link($link)) {
            // Remove any blocking file/dir at the link path
            if (file_exists($link) || is_dir($link)) {
                if (is_dir($link) && !is_link($link)) {
                    @rmdir($link);
                } else {
                    @unlink($link);
                }
            }
            if (!file_exists($link)) {
                @symlink($target, $link);
            }
        }
    }
}
