import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function HeroBanner() {
  return (
    <section className="relative h-[90vh] min-h-[600px] w-full bg-black overflow-hidden flex items-center">
      {/* Background Image/Video representation */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2080&auto=format&fit=crop"
          alt="Premium Sunglasses Banner"
          fill
          className="object-cover opacity-60 mix-blend-overlay"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-2xl">
          <span className="inline-block text-white/80 uppercase tracking-[0.3em] font-semibold text-sm mb-4 border-l-2 border-white pl-4">
            Bộ Sưu Tập Mùa Hè 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-6">
            ĐỊNH HÌNH <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">PHONG CÁCH</span> <br />
            CỦA BẠN.
          </h1>
          <p className="text-lg text-gray-300 mb-10 max-w-lg leading-relaxed">
            Khám phá bộ sưu tập kính mát và gọng kính cận mới nhất. Thiết kế đẳng cấp, chất lượng hoàn thiện vượt trội dành riêng cho bạn.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/products" 
              className="bg-white text-black font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 group"
            >
              Khám Phá Ngay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/products?category=kinh-ram" 
              className="bg-transparent text-white font-bold uppercase tracking-wider px-8 py-4 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
            >
              Kính Râm Nam
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
