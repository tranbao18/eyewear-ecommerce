'use client';

import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X, ArrowRight } from 'lucide-react';
import { useCartStore, useUserStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, setFavoriteIds } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isHomePage = pathname === '/';
  const textColorClass = isHomePage && !isScrolled ? 'text-white' : 'text-black';
  const hoverClass = isHomePage && !isScrolled ? 'hover:text-gray-200' : 'hover:text-gray-500';
  const iconHoverBgClass = isHomePage && !isScrolled ? 'hover:bg-white/20' : 'hover:bg-gray-100';

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    if (isAuthenticated) {
      api.get('/favorites').then((res) => {
        if (res.data?.data) {
          setFavoriteIds(res.data.data.map((fav: any) => fav.product_id));
        }
      }).catch(console.error);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthenticated, setFavoriteIds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        api.get(`/products?search=${encodeURIComponent(searchQuery)}`)
          .then(res => {
            setSearchResults(res.data?.data?.data || res.data?.data || []);
          })
          .catch(console.error)
          .finally(() => setIsSearching(false));
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <>
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className={`text-2xl font-black tracking-tighter uppercase transition-colors duration-300 ${textColorClass}`}>
            MẮT KÍNH
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={`hidden md:flex items-center gap-8 font-medium text-sm transition-colors duration-300 ${textColorClass}`}>
          <Link href="/products" className={`${hoverClass} transition-colors`}>
            Sản Phẩm
          </Link>
          <Link href="/products?category=kinh-ram" className={`${hoverClass} transition-colors`}>
            Kính Râm
          </Link>
          <Link href="/products?category=kinh-can" className={`${hoverClass} transition-colors`}>
            Kính Cận
          </Link>
          <Link href="/coming-soon" className={`${hoverClass} transition-colors`}>
            Về Chúng Tôi
          </Link>
        </nav>

        {/* Actions */}
        <div className={`flex items-center gap-4 transition-colors duration-300 ${textColorClass}`}>
          <button 
            onClick={() => setIsSearchOpen(true)}
            className={`p-2 ${iconHoverBgClass} rounded-full transition-colors hidden sm:block`}
          >
            <Search className="w-5 h-5" />
          </button>
          
          {isMounted && useUserStore.getState().isAuthenticated ? (
            <Link href="/profile" className={`p-2 ${iconHoverBgClass} rounded-full transition-colors relative group`}>
              <User className="w-5 h-5" />
              <span className="absolute top-full right-0 mt-2 whitespace-nowrap bg-black text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {useUserStore.getState().user?.first_name || useUserStore.getState().user?.name || 'Profile'}
              </span>
            </Link>
          ) : (
            <Link href="/login" className={`p-2 ${iconHoverBgClass} rounded-full transition-colors`}>
              <User className="w-5 h-5" />
            </Link>
          )}
          
          <Link href="/cart" className={`relative p-2 ${iconHoverBgClass} rounded-full transition-colors group`}>
            <ShoppingCart className="w-5 h-5" />
            {isMounted && totalItems > 0 && (
              <span className={`absolute top-0 right-0 w-4 h-4 text-[10px] font-bold flex items-center justify-center rounded-full group-hover:scale-110 transition-transform ${isHomePage && !isScrolled ? 'bg-white text-black' : 'bg-black text-white'}`}>
                {totalItems}
              </span>
            )}
          </Link>

          <button className={`p-2 ${iconHoverBgClass} rounded-full transition-colors md:hidden`}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    {/* Search Overlay */}
    {isSearchOpen && (
      <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col animate-fade-in">
        <div className="container mx-auto px-4 md:px-6 pt-20 pb-8 flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-8 shrink-0">
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">Tìm kiếm</h2>
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="p-3 bg-gray-100 text-black hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="relative mb-10 shrink-0">
            <input 
              type="text" 
              autoFocus
              placeholder="Nhập tên sản phẩm bạn muốn tìm..."
              className="w-full text-3xl md:text-5xl font-black text-black border-none border-b-4 border-black focus:ring-0 focus:border-blue-600 bg-transparent py-4 outline-none placeholder:text-gray-300 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  setIsSearchOpen(false);
                  router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                }
              }}
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {searchQuery.trim() && searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.slice(0, 8).map(product => (
                  <Link 
                    key={product.id} 
                    href={`/products/${product.slug}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="group flex items-center gap-4 bg-gray-50 hover:bg-gray-100 p-3 rounded-2xl transition-all border border-transparent hover:border-gray-200"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `http://127.0.0.1:8000/storage/${product.image_url}`) : 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm leading-tight">{product.name}</h4>
                      <p className="text-gray-500 text-sm font-medium mt-1">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.sale_price || product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : searchQuery.trim() && !isSearching ? (
              <div className="text-center py-20 text-gray-500 text-lg">
                Không tìm thấy sản phẩm nào phù hợp với "{searchQuery}"
              </div>
            ) : !searchQuery.trim() ? (
              <div className="text-gray-400">
                <p className="font-bold uppercase tracking-wider mb-4 text-sm text-black">Gợi ý tìm kiếm</p>
                <div className="flex flex-wrap gap-3">
                  {['Kính râm nam', 'Gọng kính titan', 'Tròng kính chống chói', 'Kính râm nữ', 'Ray-ban'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-4 py-2 bg-gray-100 text-black hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {searchQuery.trim() && searchResults.length > 0 && (
            <div className="pt-6 border-t border-gray-100 mt-6 shrink-0 flex justify-center pb-10">
              <Link
                href={`/products?search=${encodeURIComponent(searchQuery)}`}
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center gap-2 text-lg font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Xem tất cả kết quả <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}
