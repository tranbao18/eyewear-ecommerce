<x-mail::message>
# Đơn hàng đang được xử lý

Xin chào **{{ $order->customer_name }}**,

Tin vui đây! Đơn hàng **#{{ $order->id }}** của bạn đã được xác nhận và hiện đang trong quá trình đóng gói để giao đến bạn.

## Chi tiết đơn hàng #{{ $order->id }}

<x-mail::table>
| Sản phẩm | Số lượng | Giá |
|:---|:---:|---:|
@foreach($order->items as $item)
| {{ $item->product ? $item->product->name : 'Sản phẩm đã xóa' }} @if($item->variant_name) <br><small>Phân loại: {{ $item->variant_name }}</small> @endif | {{ $item->quantity }} | {{ number_format($item->price * $item->quantity, 0, ',', '.') }} đ |
@endforeach
| **Tạm tính:** | | **{{ number_format($order->total_amount + $order->discount_amount - $order->shipping_fee, 0, ',', '.') }} đ** |
@if($order->discount_amount > 0)
| **Giảm giá @if($order->coupon_code) ({{ $order->coupon_code }}) @endif:** | | **-{{ number_format($order->discount_amount, 0, ',', '.') }} đ** |
@endif
| **Phí vận chuyển:** | | **{{ $order->shipping_fee == 0 ? 'Miễn phí' : number_format($order->shipping_fee, 0, ',', '.') . ' đ' }}** |
| **Tổng cộng:** | | **{{ number_format($order->total_amount, 0, ',', '.') }} đ** |
| **Thanh toán:** | | **{{ strtoupper($order->payment_method) }}** |
</x-mail::table>

---

### Thông tin khách hàng
- **Họ tên:** {{ $order->customer_name }}
- **Email:** {{ $order->customer_email }}
- **Số điện thoại:** {{ $order->customer_phone }}

### Địa chỉ giao hàng
{{ $order->shipping_address }}

<x-mail::button :url="config('app.url') . '/profile'">
Theo dõi đơn hàng
</x-mail::button>

Cảm ơn bạn đã tin tưởng và mua sắm tại {{ config('app.name') }}!<br>
Trân trọng,
</x-mail::message>
