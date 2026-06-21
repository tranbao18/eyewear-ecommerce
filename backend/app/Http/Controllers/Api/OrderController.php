<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Coupon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlacedCustomerMail;
use App\Mail\OrderPlacedAdminMail;
use App\Models\User;
use App\Notifications\NewOrderNotification;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'required|email|max:255',
            'province' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'ward' => 'required|string|max:255',
            'specific_address' => 'required|string|max:500',
            'coupon_code' => 'nullable|string',
            'frontend_total' => 'required|numeric',
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|exists:products,id',
            'items.*.variantId' => 'nullable|exists:product_variants,id',
            'items.*.variant_name' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'save_address' => 'boolean'
        ]);

        $user = Auth::guard('sanctum')->user();

        // 1. Calculate actual DB total
        $dbSubTotal = 0;
        $orderItemsData = [];

        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['productId']);
            
            // Use sale price if active
            $now = now();
            $hasSale = $product->sale_price 
                && (!$product->sale_price_starts_at || $now->gte($product->sale_price_starts_at))
                && (!$product->sale_price_ends_at || $now->lte($product->sale_price_ends_at));
            $unitPrice = $hasSale ? $product->sale_price : $product->price;

            if (!empty($item['variantId'])) {
                $variant = ProductVariant::findOrFail($item['variantId']);
                // Ensure variant belongs to product
                if ($variant->product_id != $product->id) {
                    return response()->json(['message' => 'Dữ liệu sản phẩm không hợp lệ.'], 400);
                }
                $unitPrice += $variant->price_adjustment;
            }

            $lineTotal = $unitPrice * $item['quantity'];
            $dbSubTotal += $lineTotal;

            $orderItemsData[] = [
                'product_id' => $product->id,
                'product_variant_id' => $item['variantId'] ?? null,
                'variant_name' => $item['variant_name'] ?? null,
                'quantity' => $item['quantity'],
                'price' => $unitPrice,
            ];
        }

        // 2. Validate Coupon
        $discountAmount = 0;
        $coupon = null;
        if ($request->coupon_code) {
            $coupon = Coupon::where('code', $request->coupon_code)->first();
            if ($coupon) {
                $validation = $coupon->isValid($dbSubTotal);
                if (!$validation['valid']) {
                    return response()->json(['message' => $validation['message']], 400);
                }
                $discountAmount = $coupon->calculateDiscount($dbSubTotal);
            }
        }

        // 3. Calculate Shipping Fee
        $shippingFee = 0;
        if (($dbSubTotal - $discountAmount) < 500000) {
            if ($request->province === 'Thành phố Hồ Chí Minh') {
                $shippingFee = 40000;
            } else {
                $shippingFee = 50000;
            }
        }

        $dbTotal = max(0, $dbSubTotal - $discountAmount) + $shippingFee;

        // 4. Compare with frontend total (allowing small float precision differences, e.g. < 1.0)
        if (abs($dbTotal - $request->frontend_total) > 1.0) {
            return response()->json([
                'message' => 'Dữ liệu giá đã thay đổi hoặc không hợp lệ. Vui lòng tải lại trang.',
                'db_total' => $dbTotal,
                'frontend_total' => $request->frontend_total
            ], 400);
        }

        DB::beginTransaction();
        try {
            // 5. Create Order
            $shippingAddress = $request->specific_address . ', ' . $request->ward . ', ' . $request->district . ', ' . $request->province;

            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'total_amount' => $dbTotal,
                'status' => 'pending',
                'payment_method' => $request->payment_method ?? 'cod',
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'province' => $request->province,
                'district' => $request->district,
                'ward' => $request->ward,
                'specific_address' => $request->specific_address,
                'shipping_address' => $shippingAddress, // full address legacy
                'coupon_code' => $coupon ? $coupon->code : null,
                'discount_amount' => $discountAmount,
                'shipping_fee' => $shippingFee,
            ]);

            $order->statusHistories()->create([
                'status' => 'pending',
                'note' => 'Đơn hàng được tạo thành công'
            ]);

            // 6. Create Order Items and decrease stock
            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);

                // Decrease product stock
                $product = Product::find($itemData['product_id']);
                if ($product) {
                    $product->decrement('stock_quantity', $itemData['quantity']);
                }

                // Decrease variant stock
                if (!empty($itemData['product_variant_id'])) {
                    $variant = ProductVariant::find($itemData['product_variant_id']);
                    if ($variant) {
                        $variant->decrement('stock_quantity', $itemData['quantity']);
                    }
                }
            }

            // 7. Update Coupon usage
            if ($coupon) {
                $coupon->increment('used_count');
            }

            // 8. Save address to user if requested
            if ($user && $request->save_address) {
                $user->update([
                    'phone' => $request->customer_phone,
                    'province' => $request->province,
                    'district' => $request->district,
                    'ward' => $request->ward,
                    'specific_address' => $request->specific_address,
                ]);
            }

            DB::commit();

            // Send notifications and emails
            try {
                $admins = User::where('role', 'admin')->get();

                // Database Notification cho Filament Admin Panel (chạy đồng bộ)
                foreach ($admins as $admin) {
                    $admin->notify(new NewOrderNotification($order));
                }

                // Email cho khách hàng
                Mail::to($order->customer_email)->queue(new OrderPlacedCustomerMail($order));

                // Email cho admin
                foreach ($admins as $admin) {
                    Mail::to($admin->email)->queue(new OrderPlacedAdminMail($order));
                }
            } catch (\Exception $e) {
                \Log::error('Lỗi khi gửi thông báo đơn hàng: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Đặt hàng thành công!',
                'order_id' => $order->id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Có lỗi xảy ra trong quá trình đặt hàng: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $order = Order::with(['items.product', 'items.variant.attributeValues.attribute', 'statusHistories'])->findOrFail($id);
        
        $subTotal = $order->total_amount + $order->discount_amount - $order->shipping_fee;
        
        $formattedOrder = [
            'id' => $order->id,
            'status' => $order->status,
            'total_amount' => $order->total_amount,
            'sub_total' => $subTotal,
            'discount_amount' => $order->discount_amount,
            'shipping_fee' => $order->shipping_fee,
            'coupon_code' => $order->coupon_code,
            'shipping_address' => $order->shipping_address,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'customer_email' => $order->customer_email,
            'created_at' => $order->created_at,
            'status_histories' => $order->statusHistories,
            'items' => $order->items->map(function ($item) {
                $variantName = $item->variant_name;
                if (!$variantName && $item->variant) {
                    $values = $item->variant->attributeValues->map(function ($val) {
                        return $val->value;
                    })->implode(' / ');
                    $variantName = $values;
                }

                return [
                    'id' => $item->id,
                    'product_name' => $item->product ? $item->product->name : 'Sản phẩm đã xóa',
                    'variant_name' => $variantName,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'image' => $item->product ? $item->product->image_url : null,
                ];
            })
        ];

        return response()->json($formattedOrder);
    }

    public function getUserOrders(Request $request)
    {
        $orders = Order::with(['items.product', 'items.variant.attributeValues.attribute'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedOrders = $orders->map(function ($order) {
            $subTotal = $order->total_amount + $order->discount_amount - $order->shipping_fee;
            return [
                'id' => $order->id,
                'status' => $order->status,
                'total_amount' => $order->total_amount,
                'sub_total' => $subTotal,
                'discount_amount' => $order->discount_amount,
                'shipping_fee' => $order->shipping_fee,
                'coupon_code' => $order->coupon_code,
                'shipping_address' => $order->shipping_address,
                'created_at' => $order->created_at,
                'items_count' => $order->items->count(),
                'first_item_image' => $order->items->first() && $order->items->first()->product ? $order->items->first()->product->image_url : null,
                'first_item_name' => $order->items->first() && $order->items->first()->product ? $order->items->first()->product->name : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedOrders,
            'message' => 'Lấy danh sách đơn hàng thành công',
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Không có quyền truy cập.'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Chỉ có thể hủy đơn hàng đang chờ xử lý.'], 400);
        }

        $order->status = 'cancelled';
        $order->save();

        $order->statusHistories()->create([
            'status' => 'cancelled',
            'note' => 'Khách hàng hủy đơn'
        ]);

        try {
            Mail::to($order->customer_email)->queue(new \App\Mail\OrderCancelledMail($order));
        } catch (\Exception $e) {
            \Log::error('Lỗi khi gửi email hủy đơn hàng: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã hủy đơn hàng thành công.',
        ]);
    }
}
