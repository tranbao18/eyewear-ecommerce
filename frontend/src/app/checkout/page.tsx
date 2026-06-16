import Link from 'next/link';

import CheckoutClient from './CheckoutClient';

export const metadata = {
  title: 'Thanh toán | Mắt Kính',
  description: 'Hoàn tất đơn hàng của bạn với phương thức thanh toán an toàn.',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href="/cart" className="hover:text-black transition-colors">Giỏ hàng</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-medium">Thanh toán</span>
        </nav>

        <CheckoutClient />
      </div>
    </div>
  );
}
