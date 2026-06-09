<x-mail::message>
# Đơn hàng đang được xử lý

Xin chào {{ $order->customer_name }},

Chúng tôi xin thông báo đơn hàng **#{{ $order->id }}** của bạn đã được xác nhận và hiện đang trong quá trình xử lý (đóng gói & giao hàng).

Cảm ơn bạn đã tin tưởng mua sắm tại cửa hàng của chúng tôi!

<x-mail::button :url="config('app.url') . '/profile'">
Kiểm tra trạng thái
</x-mail::button>

Trân trọng,<br>
{{ config('app.name') }}
</x-mail::message>
