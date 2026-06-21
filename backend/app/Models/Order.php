<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'total_amount', 'status', 'payment_method', 'payment_status',
        'customer_name', 'customer_phone', 'customer_email',
        'shipping_address', 'province', 'district', 'ward', 'specific_address',
        'coupon_code', 'discount_amount', 'shipping_fee'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at', 'desc');
    }

    protected static function booted()
    {
        static::updated(function (Order $order) {
            if ($order->wasChanged('status')) {
                $order->statusHistories()->create([
                    'status' => $order->status,
                    'note' => 'Hệ thống/Admin cập nhật trạng thái'
                ]);
            }
            if ($order->wasChanged('payment_status') && $order->payment_status === 'paid') {
                $order->statusHistories()->create([
                    'status' => $order->status,
                    'note' => 'Đã xác nhận thanh toán'
                ]);
            }
        });
    }
}
