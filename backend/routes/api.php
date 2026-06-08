<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;

// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Products
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

Route::get('/categories', function() {
    return response()->json(['data' => \App\Models\Category::all()]);
});
Route::get('/brands', function() {
    return response()->json(['data' => \App\Models\Brand::all()]);
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // User Orders
    Route::get('/user/orders', [\App\Http\Controllers\Api\OrderController::class, 'getUserOrders']);

    // Favorites
    Route::get('/favorites', [\App\Http\Controllers\Api\FavoriteController::class, 'index']);
    Route::post('/favorites/toggle', [\App\Http\Controllers\Api\FavoriteController::class, 'toggle']);
});

// Social Login
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Checkout & Cart
Route::post('/orders', [\App\Http\Controllers\Api\OrderController::class, 'store']);
Route::get('/orders/{id}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
Route::post('/coupons/apply', [\App\Http\Controllers\Api\CouponController::class, 'apply']);
