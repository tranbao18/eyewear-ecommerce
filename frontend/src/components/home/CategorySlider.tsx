'use client';

import { useRef } from 'react';
import Link from 'next/link';

export default function CategorySlider({ categories }: { categories: any[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.8 : 350;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.8 : 350;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop';
    if (imagePath.startsWith('http')) return imagePath;
    
    const cleanPath = imagePath.replace(/^\/+/, '');
    if (cleanPath.startsWith('storage/')) {
      return `http://127.0.0.1:8000/${cleanPath}`;
    }
    return `http://127.0.0.1:8000/storage/${cleanPath}`;
  };

  return (
    <div className="relative group">
      {/* Navigation Buttons */}
      <button 
        onClick={scrollLeft}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0 focus:outline-none border border-gray-100"
        aria-label="Previous categories"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button 
        onClick={scrollRight}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0 focus:outline-none border border-gray-100"
        aria-label="Next categories"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Slider */}
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {categories.length > 0 ? categories.map((category: any) => (
          <Link 
            key={category.slug} 
            href={`/products?category=${category.slug}`}
            className="group/card relative w-[80vw] sm:w-[40vw] md:w-[320px] lg:w-[360px] shrink-0 snap-center h-[320px] md:h-[400px] overflow-hidden rounded-2xl block"
          >
            <img 
              src={getImageUrl(category.image)}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity duration-300" />
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-wider mb-2 group-hover/card:-translate-y-2 transition-transform duration-300">
                {category.name}
              </h3>
              <span className="text-white/80 uppercase tracking-widest text-xs md:text-sm font-bold opacity-0 group-hover/card:opacity-100 group-hover/card:-translate-y-2 transition-all duration-300 flex items-center gap-2">
                Khám Phá Ngay <span className="text-lg">→</span>
              </span>
            </div>
          </Link>
        )) : (
          <div className="w-full text-center text-gray-500 py-10">Chưa có danh mục nào đang hoạt động.</div>
        )}
      </div>
    </div>
  );
}
