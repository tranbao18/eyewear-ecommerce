<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/make-filament', function () {
    try {
        Artisan::call('make:filament-resource', ['name' => 'Coupon', '--generate' => true]);
        return response()->json(['status' => 'success', 'output' => Artisan::output()]);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()]);
    }
});

Route::get('/seed-coupon', function () {
    try {
        $coupon = \App\Models\Coupon::firstOrCreate(
            ['code' => 'SUMMER26'],
            ['type' => 'percent', 'value' => 20, 'min_spend' => 0]
        );
        return response()->json(['status' => 'success', 'coupon' => $coupon]);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()]);
    }
});
