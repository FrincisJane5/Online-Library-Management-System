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
        //
    }
}
