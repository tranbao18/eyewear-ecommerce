<x-mail::message>
# Xin chào {{ $order->customer_name }},

Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi!
Đơn hàng **#{{ $order->id }}** của bạn đã được nhận và đang trong quá trình xử lý.

## Chi tiết đơn hàng:
**Tổng tiền:** {{ number_format($order->total_amount, 0, ',', '.') }} VNĐ
**Địa chỉ giao hàng:** {{ $order->shipping_address }}

Chúng tôi sẽ thông báo cho bạn ngay khi đơn hàng được xác nhận.

<x-mail::button :url="config('app.url') . '/profile'">
Xem đơn hàng
</x-mail::button>

Trân trọng,<br>
{{ config('app.name') }}
</x-mail::message>
