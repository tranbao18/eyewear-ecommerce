<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Review;

class ReviewController extends Controller
{
    public function index($productId)
    {
        $reviews = Review::with('user:id,name,avatar')
            ->where('product_id', $productId)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate stats
        $total = $reviews->count();
        $average = $total > 0 ? $reviews->avg('rating') : 0;
        
        $ratingCounts = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $reviews,
            'stats' => [
                'total' => $total,
                'average' => round($average, 1),
                'counts' => $ratingCounts
            ]
        ]);
    }

    public function store(Request $request, $productId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $product = Product::findOrFail($productId);
        $user = $request->user();

        // User can submit multiple reviews for the same product as requested

        // Note: For demo purposes, we will not enforce buying rules yet 
        // since the Order system is planned for a later phase.

        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $productId,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_approved' => true, // Auto-approve
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá của bạn đã được gửi thành công.',
            'data' => $review->load('user:id,name,avatar')
        ], 201);
    }
}
