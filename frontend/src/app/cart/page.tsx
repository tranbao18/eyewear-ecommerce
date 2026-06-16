import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

// Using a Client Component wrapper inside the Page since page.tsx by default is a Server Component,
// but our cart requires Zustand client state.
import CartClient from './CartClient';

export const metadata = {
  title: 'Giỏ hàng của bạn | Mắt Kính',
  description: 'Xem lại các sản phẩm trong giỏ hàng của bạn và tiến hành thanh toán.',
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-medium">Giỏ hàng</span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-8 h-8 text-black" />
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-black">
            Giỏ Hàng Của Bạn
          </h1>
        </div>

        <CartClient />
      </div>
    </div>
  );
}
