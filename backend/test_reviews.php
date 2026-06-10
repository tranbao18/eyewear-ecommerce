<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\User;
use App\Models\Review;

// 1. Check if we have a user and product
$user = User::first();
if (!$user) {
    echo "No user found.\n";
    exit;
}

$product = Product::first();
if (!$product) {
    echo "No product found.\n";
    exit;
}

echo "Testing with User: {$user->name} and Product: {$product->name}\n";

// 2. Create a review
$review = Review::updateOrCreate(
    ['user_id' => $user->id, 'product_id' => $product->id],
    ['rating' => 5, 'comment' => 'Sản phẩm tuyệt vời! Đã test.', 'is_approved' => true]
);
echo "Review created with ID: {$review->id}\n";

// 3. Fetch product with reviews
$productWithReviews = Product::withAvg('reviews', 'rating')->withCount('reviews')->find($product->id);
echo "Product average rating: {$productWithReviews->reviews_avg_rating}\n";
echo "Product reviews count: {$productWithReviews->reviews_count}\n";

echo "SUCCESS!\n";
