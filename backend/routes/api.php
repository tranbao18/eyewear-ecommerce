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

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Checkout & Cart
Route::post('/orders', [\App\Http\Controllers\Api\OrderController::class, 'store']);
Route::get('/orders/{id}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
Route::post('/coupons/apply', [\App\Http\Controllers\Api\CouponController::class, 'apply']);
