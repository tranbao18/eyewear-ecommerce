'use client';

import Link from 'next/link';
import { Home, Sparkles, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ComingSoon() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-rose-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-violet-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl bg-white/60 backdrop-blur-xl p-10 sm:p-12 rounded-3xl shadow-2xl border border-white/50">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-500/30 rotate-12 hover:rotate-0 transition-transform duration-300">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
          Sắp ra mắt!
        </h1>
        
        <p className="text-gray-500 mb-8 text-lg leading-relaxed">
          Tính năng này đang được chúng tôi chăm chút phát triển để mang lại trải nghiệm tuyệt vời nhất cho bạn. Vui lòng chờ đón nhé!
        </p>

        <div className="flex items-center gap-2 text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-full mb-10 border border-orange-100">
          <Clock className="w-4 h-4" />
          <span>Đang trong quá trình hoàn thiện</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => router.back()} 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-2xl font-bold shadow-sm hover:shadow border border-gray-100 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </button>
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:bg-gray-800 transition-all hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
