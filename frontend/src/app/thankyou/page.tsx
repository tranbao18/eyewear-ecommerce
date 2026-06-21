'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useUserStore } from '@/lib/store';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { isAuthenticated } = useUserStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (orderId) {
      setIsLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.message) {
            setOrderData(data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [orderId]);

  if (!isMounted) return null;

  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm w-full max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black mb-3">
          Cảm Ơn Bạn!
        </h1>
        <p className="text-gray-500 text-lg">
          Đơn hàng của bạn đã được đặt thành công. Chúng tôi sẽ sớm liên hệ để giao hàng.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : orderData ? (
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 mb-6 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Mã đơn hàng</p>
              <p className="text-2xl font-black text-black">#{orderData.id}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Ngày đặt hàng</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(orderData.created_at).toLocaleDateString('vi-VN', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3 uppercase text-sm tracking-wider">Thông tin người nhận</h3>
              <div className="space-y-1 text-gray-600 text-sm">
                <p><span className="font-medium text-gray-900">{orderData.customer_name}</span></p>
                <p>{orderData.customer_phone}</p>
                <p>{orderData.customer_email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3 uppercase text-sm tracking-wider">Địa chỉ giao hàng</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {orderData.shipping_address}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Chi tiết sản phẩm</h3>
            <div className="space-y-4 mb-6">
              {orderData.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 overflow-hidden shrink-0 relative">
                    {item.image ? (
                      <img src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://127.0.0.1:8000'}/storage/${item.image}`} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-bl-lg font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.product_name}</h4>
                    {item.variant_name && (
                      <p className="text-xs text-gray-500 mt-1">{item.variant_name}</p>
                    )}
                  </div>
                  <div className="text-sm font-bold text-right flex flex-col justify-center">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.sub_total)}</span>
              </div>
              {orderData.discount_amount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Giảm giá {orderData.coupon_code ? `(${orderData.coupon_code})` : ''}</span>
                  <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className={`font-medium ${orderData.shipping_fee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {orderData.shipping_fee === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.shipping_fee)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                <span className="text-gray-900 font-bold uppercase tracking-wider text-sm">Tổng thanh toán</span>
                <span className="text-2xl font-black text-black">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : orderId ? (
        <div className="bg-gray-50 rounded-2xl p-6 mb-10 inline-block text-center w-full">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-1 font-bold">Mã đơn hàng</p>
          <p className="text-2xl font-black tracking-widest text-black">#{orderId}</p>
          <p className="text-sm text-red-500 mt-2">Không thể tải chi tiết đơn hàng.</p>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link 
          href="/products" 
          className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          Tiếp Tục Mua Sắm
          <ArrowRight className="w-5 h-5" />
        </Link>
        
        {isAuthenticated && (
          <Link 
            href="/profile?tab=orders" 
            className="w-full sm:w-auto bg-white text-black border-2 border-gray-200 px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:border-black transition-colors flex items-center justify-center gap-2"
          >
            Xem Đơn Hàng Của Tôi
            <Package className="w-5 h-5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16 flex items-center justify-center px-4">
      <Suspense fallback={<div className="animate-pulse w-96 h-96 bg-gray-200 rounded-3xl"></div>}>
        <ThankYouContent />
      </Suspense>
    </div>
  );
}
