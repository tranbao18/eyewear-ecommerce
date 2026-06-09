<x-mail::message>
# Có đơn hàng mới!

Một đơn hàng mới vừa được đặt trên hệ thống.

## Thông tin đơn hàng:
- **Mã đơn:** #{{ $order->id }}
- **Khách hàng:** {{ $order->customer_name }}
- **Email:** {{ $order->customer_email }}
- **Tổng tiền:** {{ number_format($order->total_amount, 0, ',', '.') }} VNĐ

<x-mail::button :url="config('app.url') . '/admin/orders/' . $order->id">
Quản lý đơn hàng
</x-mail::button>

Hệ thống quản trị,<br>
{{ config('app.name') }}
</x-mail::message>
