<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand'])->where('is_active', true);

        // Filter by category slug
        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter by brand slug
        if ($request->has('brand')) {
            $query->whereHas('brand', function ($q) use ($request) {
                $q->where('slug', $request->brand);
            });
        }

        // Search by keyword
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $products = $query->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $products,
            'message' => 'Thành công',
        ]);
    }

    public function show($slug)
    {
        $product = Product::with([
            'category', 
            'brand', 
            'galleries', 
            'variants.attributeValues.attribute'
        ])->where('slug', $slug)->where('is_active', true)->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm không tồn tại',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Thành công',
        ]);
    }
}
