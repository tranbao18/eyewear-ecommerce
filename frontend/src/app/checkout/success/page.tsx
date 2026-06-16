'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const resultCode = searchParams.get('resultCode');
  const orderIdMomo = searchParams.get('orderId');

  useEffect(() => {
    if (resultCode && orderIdMomo) {
      // Kết quả trả về từ MoMo
      const id = orderIdMomo.split('_')[0];
      setOrderId(id);
      if (resultCode === '0') {
        setStatus('success');
      } else {
        setStatus('failed');
      }
    } else {
      // Không có tham số -> Có thể bị truy cập lỗi
      setStatus('failed');
    }
  }, [resultCode, orderIdMomo]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        
        {status === 'success' ? (
          <>
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <h2 className="mt-6 text-3xl font-black text-gray-900 uppercase tracking-tight">Thanh toán thành công!</h2>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                Cảm ơn bạn đã mua sắm. Đơn hàng <span className="font-bold text-black">#{orderId}</span> của bạn đã được thanh toán qua MoMo thành công.
                Chúng tôi sẽ sớm giao hàng đến bạn.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <div>
              <h2 className="mt-6 text-3xl font-black text-gray-900 uppercase tracking-tight">Thanh toán thất bại</h2>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                Giao dịch MoMo cho đơn hàng <span className="font-bold text-black">#{orderId}</span> đã bị hủy hoặc có lỗi xảy ra. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.
              </p>
            </div>
          </>
        )}

        <div className="mt-8 space-y-4">
          <Link
            href={`/profile/orders/${orderId}`}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 border border-transparent text-sm font-bold rounded-xl text-white bg-black hover:bg-gray-800 transition-colors uppercase tracking-wider"
          >
            <ShoppingBag className="w-5 h-5" />
            Xem chi tiết đơn hàng
          </Link>
          <Link
            href="/products"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-200 text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 transition-colors uppercase tracking-wider"
          >
            Tiếp tục mua sắm
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
