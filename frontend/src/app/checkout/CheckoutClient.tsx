'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore, useUserStore } from '@/lib/store';
import { api } from '@/lib/api';
import Image from 'next/image';

const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Vui lòng nhập họ tên'),
  customer_phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  customer_email: z.string().email('Email không hợp lệ'),
  province: z.string().min(1, 'Vui lòng nhập Tỉnh/Thành phố'),
  district: z.string().min(1, 'Vui lòng nhập Quận/Huyện'),
  ward: z.string().min(1, 'Vui lòng nhập Phường/Xã'),
  specific_address: z.string().min(5, 'Vui lòng nhập địa chỉ cụ thể'),
  save_address: z.boolean().default(false),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutClient() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useUserStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo'>('cod');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      save_address: false,
    }
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Autofill flags
  const [hasAutofilled, setHasAutofilled] = useState(false);
  const [hasAutofilledDistrict, setHasAutofilledDistrict] = useState(false);
  const [hasAutofilledWard, setHasAutofilledWard] = useState(false);

  const provinceName = watch('province');
  const districtName = watch('district');

  useEffect(() => {
    // Fetch provinces on mount
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (provinceName && provinces.length > 0) {
      const p = provinces.find((x: any) => x.name === provinceName);
      if (p) {
        fetch(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`)
          .then(res => res.json())
          .then(data => {
            setDistricts(data.districts || []);
          })
          .catch(console.error);
      }
    } else {
      setDistricts([]);
    }
  }, [provinceName, provinces]);

  useEffect(() => {
    if (districtName && districts.length > 0) {
      const d = districts.find((x: any) => x.name === districtName);
      if (d) {
        fetch(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`)
          .then(res => res.json())
          .then(data => {
            setWards(data.wards || []);
          })
          .catch(console.error);
      }
    } else {
      setWards([]);
    }
  }, [districtName, districts]);

  useEffect(() => {
    setIsMounted(true);
    if (items.length === 0 && !isCheckoutSuccess) {
      router.push('/cart');
    }
  }, [items, router, isCheckoutSuccess]);

  // Autofill user basic info and province
  useEffect(() => {
    if (user && provinces.length > 0 && !hasAutofilled) {
      setValue('customer_name', user.name || user.first_name + ' ' + user.last_name || '');
      setValue('customer_email', user.email || '');
      if (user.phone) setValue('customer_phone', user.phone);
      if (user.specific_address) setValue('specific_address', user.specific_address);
      if (user.province) setValue('province', user.province);
      setHasAutofilled(true);
    }
  }, [user, provinces, hasAutofilled, setValue]);

  // Autofill district after districts are loaded
  useEffect(() => {
    if (user?.district && districts.length > 0 && !hasAutofilledDistrict) {
      setValue('district', user.district);
      setHasAutofilledDistrict(true);
    }
  }, [districts, user, hasAutofilledDistrict, setValue]);

  // Autofill ward after wards are loaded
  useEffect(() => {
    if (user?.ward && wards.length > 0 && !hasAutofilledWard) {
      setValue('ward', user.ward);
      setHasAutofilledWard(true);
    }
  }, [wards, user, hasAutofilledWard, setValue]);

  if (!isMounted || items.length === 0) return null;

  const subtotal = getTotalPrice();
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      const response = await api.post('/coupons/apply', {
        code: couponCode,
        cart_total: subtotal
      });
      
      setAppliedCoupon(response.data.coupon_code);
      setDiscountAmount(response.data.discount_amount);
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        ...data,
        payment_method: paymentMethod,
        frontend_total: total,
        coupon_code: appliedCoupon,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          variant_name: item.variantName || (item.color && item.size ? `${item.size} / ${item.color}` : item.color || item.size || null)
        }))
      };

      const response = await api.post('/orders', payload);
      
      if (paymentMethod === 'momo') {
        const momoRes = await api.post(`/payment/momo/create/${response.data.order_id}`);
        if (momoRes.data.success) {
          clearCart();
          window.location.href = momoRes.data.payment_url;
          return;
        }
      }
      
      setIsCheckoutSuccess(true);
      clearCart();
      router.push(`/thankyou?orderId=${response.data.order_id}`);
      
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-black uppercase tracking-wider mb-6 text-black border-b border-gray-100 pb-4">
          Thông tin giao hàng
        </h2>
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {errorMessage}
          </div>
        )}

        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên *</label>
              <input 
                type="text" 
                {...register('customer_name')}
                className={`w-full px-4 py-3 rounded-xl border ${errors.customer_name ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all`}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
              {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại *</label>
              <input 
                type="tel" 
                {...register('customer_phone')}
                className={`w-full px-4 py-3 rounded-xl border ${errors.customer_phone ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all`}
                placeholder="Ví dụ: 0901234567"
              />
              {errors.customer_phone && <p className="text-red-500 text-xs mt-1">{errors.customer_phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
            <input 
              type="email" 
              {...register('customer_email')}
              className={`w-full px-4 py-3 rounded-xl border ${errors.customer_email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all`}
              placeholder="Để nhận thông tin đơn hàng"
            />
            {errors.customer_email && <p className="text-red-500 text-xs mt-1">{errors.customer_email.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tỉnh/Thành phố *</label>
              <select 
                {...register('province')}
                className={`w-full px-4 py-3 rounded-xl border ${errors.province ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white`}
              >
                <option value="">Chọn Tỉnh/Thành</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>
              {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Quận/Huyện *</label>
              <select 
                {...register('district')}
                disabled={districts.length === 0}
                className={`w-full px-4 py-3 rounded-xl border ${errors.district ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400`}
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.name}>{d.name}</option>
                ))}
              </select>
              {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phường/Xã *</label>
              <select 
                {...register('ward')}
                disabled={wards.length === 0}
                className={`w-full px-4 py-3 rounded-xl border ${errors.ward ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400`}
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
              {errors.ward && <p className="text-red-500 text-xs mt-1">{errors.ward.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ cụ thể (Số nhà, tên đường) *</label>
            <input 
              type="text" 
              {...register('specific_address')}
              className={`w-full px-4 py-3 rounded-xl border ${errors.specific_address ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all`}
              placeholder="Ví dụ: 123 Lê Lợi"
            />
            {errors.specific_address && <p className="text-red-500 text-xs mt-1">{errors.specific_address.message}</p>}
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                id="save_address"
                {...register('save_address')}
                className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
              />
              <label htmlFor="save_address" className="text-sm text-gray-700 cursor-pointer">
                Lưu làm thông tin giao hàng mặc định cho lần sau
              </label>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold mb-4">Phương thức thanh toán</h3>
            <div className="space-y-3">
              <div 
                onClick={() => setPaymentMethod('cod')}
                className={`border-2 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-4 flex shrink-0 ${paymentMethod === 'cod' ? 'border-black bg-white' : 'border-gray-300 bg-transparent'}`}></div>
                  <span className={`font-semibold ${paymentMethod === 'cod' ? 'text-black' : 'text-gray-600'}`}>Thanh toán khi nhận hàng (COD)</span>
                </div>
                <Image src="https://cdn-icons-png.flaticon.com/512/2897/2897832.png" alt="COD" width={30} height={30} className={paymentMethod === 'cod' ? 'opacity-100' : 'opacity-40'} unoptimized />
              </div>

              <div 
                onClick={() => setPaymentMethod('momo')}
                className={`border-2 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'momo' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-4 flex shrink-0 ${paymentMethod === 'momo' ? 'border-pink-500 bg-white' : 'border-gray-300 bg-transparent'}`}></div>
                  <span className={`font-semibold ${paymentMethod === 'momo' ? 'text-pink-600' : 'text-gray-600'}`}>Thanh toán trực tuyến (Ví MoMo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" width={40} height={40} className={`object-contain ${paymentMethod === 'momo' ? 'opacity-100' : 'opacity-40'}`} unoptimized />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Order Summary & Coupon */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Coupon */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Mã giảm giá</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Nhập mã giảm giá..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all uppercase"
              disabled={!!appliedCoupon || isApplyingCoupon}
            />
            {appliedCoupon ? (
              <button 
                onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); }}
                className="px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
              >
                Hủy
              </button>
            ) : (
              <button 
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || isApplyingCoupon}
                className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors disabled:opacity-50"
              >
                {isApplyingCoupon ? 'Đang kiểm tra...' : 'Áp dụng'}
              </button>
            )}
          </div>
          {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
          {appliedCoupon && <p className="text-green-600 text-xs mt-2 font-medium">Đã áp dụng mã: {appliedCoupon}</p>}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-28">
          <h3 className="font-black text-lg mb-6 uppercase tracking-wider border-b border-gray-100 pb-4">Tóm tắt đơn hàng</h3>
          
          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.name} fill unoptimized={process.env.NODE_ENV === 'development'} className="object-cover" />
                  <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-bl-lg font-bold">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.color && `${item.color} `}
                    {item.size && `/ ${item.size}`}
                  </p>
                </div>
                <div className="text-sm font-bold shrink-0">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Giảm giá</span>
                <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Phí vận chuyển</span>
              <span className="font-semibold text-green-600">Miễn phí</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4 mb-8 flex justify-between items-end">
            <span className="text-gray-900 font-bold uppercase text-sm tracking-wider">Tổng cộng</span>
            <span className="text-2xl font-black text-black">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
            </span>
          </div>

          <button 
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full bg-black text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Hoàn tất đặt hàng'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
