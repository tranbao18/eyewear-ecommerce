'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export default function CartClient() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-gray-900">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Chưa có sản phẩm nào trong giỏ hàng của bạn. Hãy khám phá thêm các bộ sưu tập kính mắt mới nhất của chúng tôi nhé!
        </p>
        <Link 
          href="/products" 
          className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items List */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div 
            key={`${item.productId}-${item.variantId}`} 
            className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 border border-gray-100 shadow-sm transition-all hover:shadow-md"
          >
            {/* Image */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                unoptimized={process.env.NODE_ENV === 'development'}
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Link href={`/products/${item.productId}`} className="hover:text-gray-600 transition-colors">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{item.name}</h3>
                  </Link>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                    {item.color && (
                      <span className="bg-gray-100 px-2 py-1 rounded-md">Màu: {item.color}</span>
                    )}
                    {item.size && (
                      <span className="bg-gray-100 px-2 py-1 rounded-md">Size: {item.size}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.productId, item.variantId)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Xóa khỏi giỏ hàng"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-4">
                {/* Quantity Controls */}
                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-1">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold text-sm">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Price */}
                <div className="font-black text-lg">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm sticky top-28">
          <h2 className="text-xl font-bold mb-6 text-black uppercase tracking-wider border-b border-gray-100 pb-4">
            Tóm tắt đơn hàng
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí vận chuyển</span>
              <span className="font-semibold text-green-600">Miễn phí</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mb-8 flex justify-between items-end">
            <span className="text-gray-900 font-bold uppercase text-sm tracking-wider">Tổng cộng</span>
            <span className="text-3xl font-black text-black">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getTotalPrice())}
            </span>
          </div>

          <Link 
            href="/checkout"
            className="w-full bg-black text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group"
          >
            Tiến Hành Thanh Toán
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-xs text-center text-gray-400 mt-4">
            Đã bao gồm thuế (nếu có). Mã giảm giá sẽ được áp dụng ở trang thanh toán.
          </p>
        </div>
      </div>
    </div>
  );
}

import { ShoppingBag } from 'lucide-react';
