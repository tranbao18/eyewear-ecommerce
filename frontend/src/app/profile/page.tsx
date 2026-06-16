'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/lib/store';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { User, Package, Heart, LogOut, Camera, ChevronRight, MapPin, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getActivePriceInfo } from '@/lib/priceUtils';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const { user, isAuthenticated, logout, setUser } = useUserStore();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(tabParam || 'info'); // info, orders, wishlist

  useEffect(() => {
    if (tabParam && ['info', 'orders', 'wishlist'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Tab 1: Info states
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    specific_address: '',
    avatar: ''
  });

  // Tab 2: Orders states
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrderData, setSelectedOrderData] = useState<any>(null);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 4;

  // Tab 3: Wishlist states
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);

  // Address states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated && isMounted) {
      router.push('/login');
    }
  }, [isAuthenticated, isMounted, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        province: user.province || '',
        district: user.district || '',
        ward: user.ward || '',
        specific_address: user.specific_address || '',
        avatar: user.avatar || ''
      });

      // Kiểm tra xem đã đủ thông tin bắt buộc chưa
      if (!user.first_name || !user.phone || !user.province) {
        toast('Vui lòng bổ sung đầy đủ thông tin cá nhân', { icon: 'ℹ️' });
        setIsEditingInfo(true);
      }
    }
  }, [user]);

  useEffect(() => {
    // Fetch provinces on mount
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.province && provinces.length > 0) {
      const p = provinces.find((x: any) => x.name === formData.province);
      if (p) {
        fetch(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`)
          .then(res => res.json())
          .then(data => {
            setDistricts(data.districts || []);
            // Nếu province đổi thì không tự xóa district hiện tại nếu user mới load, 
            // nhưng UX tốt nhất là xóa district nếu province thực sự đổi.
            // Xử lý đơn giản: chỉ tải danh sách, form control sẽ hiển thị cái hiện có nếu khớp, nếu không tự rớt xuống ''.
          })
          .catch(console.error);
      }
    } else {
      setDistricts([]);
    }
  }, [formData.province, provinces]);

  useEffect(() => {
    if (formData.district && districts.length > 0) {
      const d = districts.find((x: any) => x.name === formData.district);
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
  }, [formData.district, districts]);

  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      fetchOrders();
    } else if (activeTab === 'wishlist' && favorites.length === 0) {
      fetchFavorites();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await api.get('/user/orders');
      setOrders(response.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchFavorites = async () => {
    setIsLoadingFavorites(true);
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      const res = await api.post(`/orders/${orderToCancel}/cancel`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOrders();
        if (selectedOrderId === orderToCancel) {
          setSelectedOrderData({...selectedOrderData, status: 'cancelled'});
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setShowCancelModal(false);
      setOrderToCancel(null);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put('/user', formData);
      if (response.data.success) {
        setUser(response.data.data);
        setIsEditingInfo(false);
        toast.success('Cập nhật thông tin thành công');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error(err);
    } finally {
      logout();
      router.push('/login');
      toast.success('Đã đăng xuất');
    }
  };

  if (!isMounted || !isAuthenticated) return null;

  const indexOfLastOrder = ordersCurrentPage * ORDERS_PER_PAGE;
  const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalOrderPages = Math.ceil(orders.length / ORDERS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-black uppercase tracking-wider text-black mb-8">Tài khoản của tôi</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-100 flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-full bg-gray-100 mb-4 overflow-hidden border-2 border-white shadow-sm">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt={user?.name || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 font-bold text-2xl uppercase">
                      {formData.first_name ? formData.first_name[0] : (user?.name?.[0] || 'U')}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-center line-clamp-1">{formData.last_name} {formData.first_name}</h3>
                <p className="text-sm text-gray-500 text-center line-clamp-1">{formData.email}</p>
              </div>
              
              <div className="p-3 space-y-1">
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'info' ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}
                >
                  <User className="w-5 h-5" />
                  Thông tin cá nhân
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}
                >
                  <Package className="w-5 h-5" />
                  Đơn hàng của tôi
                </button>
                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'wishlist' ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}
                >
                  <Heart className="w-5 h-5" />
                  Sản phẩm yêu thích
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-500 hover:bg-red-50 font-medium mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* TAB INFO */}
            {activeTab === 'info' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-wider">Thông tin cá nhân</h2>
                  {!isEditingInfo && (
                    <button 
                      onClick={() => setIsEditingInfo(true)}
                      className="text-sm font-bold border-b-2 border-black pb-1 hover:text-gray-600 transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveInfo}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Họ (Last Name)</label>
                      <input 
                        type="text" 
                        value={formData.last_name}
                        onChange={e => setFormData({...formData, last_name: e.target.value})}
                        disabled={!isEditingInfo}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                        placeholder="Nguyễn Văn"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tên (First Name)</label>
                      <input 
                        type="text" 
                        value={formData.first_name}
                        onChange={e => setFormData({...formData, first_name: e.target.value})}
                        disabled={!isEditingInfo}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                        placeholder="A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none"
                      />
                      <p className="text-xs text-gray-400 mt-1">Không thể thay đổi email</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        disabled={!isEditingInfo}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                        placeholder="0901234567"
                      />
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mt-8 mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Địa chỉ giao hàng mặc định
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tỉnh/Thành phố</label>
                      <select 
                        value={formData.province}
                        onChange={e => setFormData({...formData, province: e.target.value, district: '', ward: ''})}
                        disabled={!isEditingInfo}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all bg-white"
                      >
                        <option value="">Chọn Tỉnh/Thành</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Quận/Huyện</label>
                      <select 
                        value={formData.district}
                        onChange={e => setFormData({...formData, district: e.target.value, ward: ''})}
                        disabled={!isEditingInfo || districts.length === 0}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all bg-white"
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map((d) => (
                          <option key={d.code} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phường/Xã</label>
                      <select 
                        value={formData.ward}
                        onChange={e => setFormData({...formData, ward: e.target.value})}
                        disabled={!isEditingInfo || wards.length === 0}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all bg-white"
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {wards.map((w) => (
                          <option key={w.code} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ cụ thể (Số nhà, tên đường)</label>
                    <input 
                      type="text" 
                      value={formData.specific_address}
                      onChange={e => setFormData({...formData, specific_address: e.target.value})}
                      disabled={!isEditingInfo}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                      placeholder="Số 1, Lê Duẩn"
                    />
                  </div>

                  {isEditingInfo && (
                    <div className="mt-8 flex gap-4">
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center min-w-[140px]"
                      >
                        {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Lưu Thay Đổi'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsEditingInfo(false);
                          if (user) {
                            setFormData({...formData, ...user});
                          }
                        }}
                        className="bg-white text-black border border-gray-200 px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* TAB ORDERS */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm min-h-[500px]">
                {selectedOrderId ? (
                  <div>
                    <button 
                      onClick={() => { setSelectedOrderId(null); setSelectedOrderData(null); }}
                      className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
                    >
                      &larr; Quay lại danh sách đơn hàng
                    </button>
                    {isLoadingOrderDetails ? (
                      <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
                      </div>
                    ) : selectedOrderData ? (
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Mã đơn hàng</p>
                            <p className="text-xl font-black text-black">#{selectedOrderData.id}</p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Ngày đặt hàng</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(selectedOrderData.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                            {selectedOrderData.status === 'pending' && (
                              <button 
                                onClick={() => { setOrderToCancel(selectedOrderData.id); setShowCancelModal(true); }}
                                className="mt-2 text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                Hủy đơn hàng
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3 uppercase text-xs tracking-wider">Thông tin người nhận</h3>
                            <div className="space-y-1 text-gray-600 text-sm">
                              <p><span className="font-medium text-gray-900">{selectedOrderData.customer_name}</span></p>
                              <p>{selectedOrderData.customer_phone}</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3 uppercase text-xs tracking-wider">Địa chỉ giao hàng</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {selectedOrderData.shipping_address}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6 mb-6">
                          <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-wider">Lịch sử đơn hàng</h3>
                          {selectedOrderData.status_histories && selectedOrderData.status_histories.length > 0 ? (
                            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                              {selectedOrderData.status_histories.map((history: any, index: number) => (
                                <div key={history.id} className="relative pl-6">
                                  <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-black' : 'bg-gray-300'}`}></span>
                                  <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${index === 0 ? 'text-black' : 'text-gray-500'}`}>
                                      {history.status === 'pending' ? 'Đang xử lý' : 
                                       history.status === 'processing' ? 'Đang giao hàng' : 
                                       history.status === 'completed' ? 'Hoàn thành' : 
                                       history.status === 'cancelled' ? 'Đã hủy' : history.status}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">
                                      {new Date(history.created_at).toLocaleDateString('vi-VN', {
                                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                      })}
                                    </span>
                                    {history.note && <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">{history.note}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Chưa có lịch sử trạng thái.</p>
                          )}
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Chi tiết sản phẩm</h3>
                          <div className="space-y-4 mb-6">
                            {selectedOrderData.items?.map((item: any) => (
                              <div key={item.id} className="flex gap-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 relative">
                                  {item.image ? (
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://127.0.0.1:8000'}/storage/${item.image}`} alt={item.product_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Package className="w-6 h-6" /></div>
                                  )}
                                  <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-bl-lg font-bold">{item.quantity}</span>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.product_name}</h4>
                                  {item.variant_name && <p className="text-xs text-gray-500 mt-1">{item.variant_name}</p>}
                                </div>
                                <div className="text-sm font-bold text-right flex flex-col justify-center">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
                            <div className="flex justify-between text-gray-600">
                              <span>Tạm tính</span>
                              <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrderData.sub_total)}</span>
                            </div>
                            {selectedOrderData.discount_amount > 0 && (
                              <div className="flex justify-between text-green-600 font-medium">
                                <span>Giảm giá</span>
                                <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrderData.discount_amount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                              <span className="text-gray-900 font-bold uppercase tracking-wider text-xs">Tổng thanh toán</span>
                              <span className="text-xl font-black text-black">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrderData.total_amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-red-500 text-center">Không thể tải chi tiết đơn hàng.</p>
                    )}
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Đơn hàng của tôi</h2>
                    
                    {isLoadingOrders ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20">
                    <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào.</p>
                    <Link href="/products" className="inline-block bg-black text-white px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-gray-800">
                      Mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentOrders.map((order) => (
                      <div key={order.id} className="border border-gray-100 rounded-2xl p-4 sm:p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 border-b border-gray-100 pb-4">
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Mã đơn hàng</p>
                            <p className="font-black text-lg">#{order.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Trạng thái</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'completed' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {order.status === 'pending' ? 'Đang xử lý' : 
                               order.status === 'completed' ? 'Hoàn thành' : 
                               order.status === 'cancelled' ? 'Đã hủy' : order.status}
                            </span>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Ngày đặt</p>
                            <p className="font-medium text-sm">
                              {new Date(order.created_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 relative">
                            {order.first_item_image ? (
                              <img src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://127.0.0.1:8000'}/storage/${order.first_item_image}`} alt="Product" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><Package /></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 line-clamp-1">{order.first_item_name || 'Sản phẩm'}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {order.items_count > 1 ? `và ${order.items_count - 1} sản phẩm khác` : '1 sản phẩm'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Tổng tiền</p>
                            <p className="font-black text-lg">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                          <div>
                            {order.status === 'pending' && (
                              <button 
                                onClick={() => { setOrderToCancel(order.id); setShowCancelModal(true); }}
                                className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                              >
                                Hủy đơn hàng
                              </button>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setIsLoadingOrderDetails(true);
                              api.get(`/orders/${order.id}`)
                                .then(res => setSelectedOrderData(res.data))
                                .catch(console.error)
                                .finally(() => setIsLoadingOrderDetails(false));
                            }}
                            className="inline-flex items-center gap-1 text-sm font-bold text-black hover:text-gray-600 transition-colors"
                          >
                            Xem chi tiết <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination Controls */}
                {!isLoadingOrders && orders.length > 0 && totalOrderPages > 1 && !selectedOrderId && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setOrdersCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={ordersCurrentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Trang trước
                    </button>
                    {[...Array(totalOrderPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setOrdersCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                          ordersCurrentPage === i + 1
                            ? 'bg-black text-white'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setOrdersCurrentPage(prev => Math.min(prev + 1, totalOrderPages))}
                      disabled={ordersCurrentPage === totalOrderPages}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
                </>
              )}
              </div>
            )}

            {/* TAB WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm min-h-[500px]">
                <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Sản phẩm yêu thích</h2>
                
                {isLoadingFavorites ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-20">
                    <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm yêu thích nào.</p>
                    <Link href="/products" className="inline-block bg-black text-white px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-gray-800">
                      Khám phá ngay
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {favorites.map((fav) => (
                      <div key={fav.id} className="group relative bg-white rounded-2xl p-3 border border-gray-100 hover:shadow-lg transition-all flex flex-col">
                        <Link href={`/products/${fav.product.slug}`} className="block relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50">
                          {fav.product.image_url ? (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://127.0.0.1:8000'}/storage/${fav.product.image_url}`} alt={fav.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">No Image</div>
                          )}
                        </Link>
                        
                        <div className="flex-1 flex flex-col">
                          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-gray-600 transition-colors">
                            {fav.product.name}
                          </h3>
                          <div className="mt-auto">
                            {(() => {
                              const { isSale, finalPrice, originalPrice, discountPercent } = getActivePriceInfo(
                                fav.product.price,
                                fav.product.sale_price,
                                fav.product.sale_price_starts_at,
                                fav.product.sale_price_ends_at
                              );
                              return isSale ? (
                                <div className="flex flex-col">
                                  <span className="font-black text-red-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
                                  </span>
                                  <span className="text-xs text-gray-400 line-through">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-black text-gray-900">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fav.product.price)}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        <button 
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await api.post('/favorites/toggle', { product_id: fav.product_id });
                              useUserStore.getState().toggleFavoriteId(fav.product_id);
                              fetchFavorites();
                              toast.success('Đã bỏ yêu thích');
                            } catch (err) {
                              toast.error('Lỗi khi bỏ yêu thích');
                            }
                          }}
                          className="absolute top-5 right-5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-red-500 hover:scale-110 transition-transform"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hủy đơn hàng?</h3>
              <p className="text-gray-500 mb-6 text-sm">Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.</p>
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => { setShowCancelModal(false); setOrderToCancel(null); }}
                  className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
                >
                  Không
                </button>
                <button 
                  onClick={handleCancelOrder}
                  className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 text-sm"
                >
                  Có
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
