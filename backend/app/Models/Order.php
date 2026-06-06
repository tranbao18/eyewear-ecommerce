<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'total_amount', 'status', 'payment_method',
        'customer_name', 'customer_phone', 'customer_email',
        'shipping_address', 'province', 'district', 'ward', 'specific_address',
        'coupon_code', 'discount_amount'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
