<x-mail::message>
# Đơn hàng đã bị hủy

Xin chào {{ $order->customer_name }},

Đơn hàng **#{{ $order->id }}** của bạn đã được hủy thành công theo yêu cầu.

Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với bộ phận hỗ trợ khách hàng.

<x-mail::button :url="config('app.url') . '/products'">
Tiếp tục mua sắm
</x-mail::button>

Trân trọng,<br>
{{ config('app.name') }}
</x-mail::message>
