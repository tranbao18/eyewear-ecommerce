<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Favorite;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = Favorite::with('product')->where('user_id', $request->user()->id)->get();
        
        return response()->json([
            'success' => true,
            'data' => $favorites,
            'message' => 'Lấy danh sách yêu thích thành công',
        ]);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = $request->user()->id;
        $productId = $request->product_id;

        $favorite = Favorite::where('user_id', $userId)->where('product_id', $productId)->first();

        if ($favorite) {
            $favorite->delete();
            $isFavorited = false;
            $message = 'Đã bỏ yêu thích sản phẩm';
        } else {
            Favorite::create([
                'user_id' => $userId,
                'product_id' => $productId,
            ]);
            $isFavorited = true;
            $message = 'Đã thêm vào danh sách yêu thích';
        }

        return response()->json([
            'success' => true,
            'is_favorited' => $isFavorited,
            'message' => $message,
        ]);
    }
}
