'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import { api } from '@/lib/api';

export default function ProductFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);
  const [brands, setBrands] = useState<{name: string, slug: string}[]>([]);

  useEffect(() => {
    api.get('/categories').then(res => {
      if (res.data?.data) setCategories(res.data.data);
    }).catch(console.error);

    api.get('/brands').then(res => {
      if (res.data?.data) setBrands(res.data.data);
    }).catch(console.error);
  }, []);

  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });

  // Update local state when URL changes
  useEffect(() => {
    setPriceRange({ min: minPrice, max: maxPrice });
  }, [minPrice, maxPrice]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 on filter change if pagination exists
    params.delete('page');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    
    if (priceRange.min) params.set('min_price', priceRange.min);
    else params.delete('min_price');
    
    if (priceRange.max) params.set('max_price', priceRange.max);
    else params.delete('max_price');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasFilters = currentCategory || currentBrand || minPrice || maxPrice;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black uppercase tracking-wider text-lg">Bộ Lọc</h3>
        {hasFilters && (
          <button 
            onClick={clearFilters}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Xóa Lọc
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <h4 className="font-bold text-sm mb-4 uppercase text-gray-500">Danh Mục</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="radio" 
              id="cat-all" 
              name="category"
              checked={!currentCategory}
              onChange={() => updateFilters('category', '')}
              className="w-4 h-4 text-black focus:ring-black border-gray-300" 
            />
            <label htmlFor="cat-all" className="ml-3 text-sm text-gray-700 cursor-pointer">Tất cả</label>
          </div>
          {categories.map((cat) => (
            <div key={cat.slug} className="flex items-center">
              <input 
                type="radio" 
                id={`cat-${cat.slug}`} 
                name="category"
                checked={currentCategory === cat.slug}
                onChange={() => updateFilters('category', cat.slug)}
                className="w-4 h-4 text-black focus:ring-black border-gray-300" 
              />
              <label htmlFor={`cat-${cat.slug}`} className="ml-3 text-sm text-gray-700 cursor-pointer">{cat.name}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="mb-8">
        <h4 className="font-bold text-sm mb-4 uppercase text-gray-500">Thương Hiệu</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="radio" 
              id="brand-all" 
              name="brand"
              checked={!currentBrand}
              onChange={() => updateFilters('brand', '')}
              className="w-4 h-4 text-black focus:ring-black border-gray-300" 
            />
            <label htmlFor="brand-all" className="ml-3 text-sm text-gray-700 cursor-pointer">Tất cả</label>
          </div>
          {brands.map((brand) => (
            <div key={brand.slug} className="flex items-center">
              <input 
                type="radio" 
                id={`brand-${brand.slug}`} 
                name="brand"
                checked={currentBrand === brand.slug}
                onChange={() => updateFilters('brand', brand.slug)}
                className="w-4 h-4 text-black focus:ring-black border-gray-300" 
              />
              <label htmlFor={`brand-${brand.slug}`} className="ml-3 text-sm text-gray-700 cursor-pointer">{brand.name}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="font-bold text-sm mb-4 uppercase text-gray-500">Khoảng Giá (VNĐ)</h4>
        <form onSubmit={handlePriceFilter} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Từ" 
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="number" 
              placeholder="Đến" 
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-2 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors"
          >
            Áp Dụng
          </button>
        </form>
      </div>
    </div>
  );
}
