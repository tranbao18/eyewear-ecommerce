<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_spend',
        'max_uses',
        'used_count',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function isValid($cartTotal = 0)
    {
        if (!$this->is_active) {
            return ['valid' => false, 'message' => 'Mã giảm giá đã bị vô hiệu hóa.'];
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return ['valid' => false, 'message' => 'Mã giảm giá đã hết hạn.'];
        }

        if ($this->max_uses && $this->used_count >= $this->max_uses) {
            return ['valid' => false, 'message' => 'Mã giảm giá đã hết lượt sử dụng.'];
        }

        if ($cartTotal < $this->min_spend) {
            return ['valid' => false, 'message' => 'Đơn hàng chưa đạt giá trị tối thiểu để sử dụng mã này.'];
        }

        return ['valid' => true];
    }

    public function calculateDiscount($cartTotal)
    {
        if ($this->type === 'percent') {
            return ($cartTotal * $this->value) / 100;
        }

        return min($cartTotal, $this->value);
    }
}
