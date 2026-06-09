<?php

namespace App\Observers;

use App\Models\Order;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderProcessingMail;

class OrderObserver
{
    public function updated(Order $order)
    {
        if ($order->isDirty('status') && $order->status === 'processing') {
            try {
                Mail::to($order->customer_email)->queue(new OrderProcessingMail($order));
            } catch (\Exception $e) {
                \Log::error('Lỗi khi gửi email OrderProcessing: ' . $e->getMessage());
            }
        }
    }
}
