<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Coupon;

class CouponController extends Controller
{
    public function apply(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'cart_total' => 'required|numeric|min:0'
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon) {
            return response()->json(['message' => 'Mã giảm giá không tồn tại.'], 404);
        }

        $validation = $coupon->isValid($request->cart_total);

        if (!$validation['valid']) {
            return response()->json(['message' => $validation['message']], 400);
        }

        $discountAmount = $coupon->calculateDiscount($request->cart_total);

        return response()->json([
            'coupon_code' => $coupon->code,
            'discount_amount' => $discountAmount,
            'message' => 'Áp dụng mã giảm giá thành công!'
        ]);
    }
}
