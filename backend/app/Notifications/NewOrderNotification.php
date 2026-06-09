<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewOrderNotification extends Notification
{
    // Không dùng ShouldQueue để chạy đồng bộ (sync), tránh bị kẹt queue
    public function __construct(
        public Order $order,
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'format' => 'filament',
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'title' => 'Đơn hàng mới #' . $this->order->id,
            'body' => $this->order->customer_name . ' vừa đặt đơn hàng trị giá ' . number_format($this->order->total_amount) . 'đ',
            'icon' => 'heroicon-o-shopping-bag',
            'iconColor' => 'warning',
            'status' => 'warning',
            'duration' => 'persistent',
            'view' => 'filament-notifications::notification',
            'viewData' => [],
            'actions' => [],
        ];
    }
}
