'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[30rem] h-[30rem] bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 drop-shadow-sm">
          404
        </h1>
        <div className="w-24 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-8"></div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ối! Lạc đường rồi
        </h2>
        <p className="text-gray-500 mb-10 text-lg leading-relaxed">
          Trang bạn đang tìm kiếm dường như không tồn tại, đã bị xóa hoặc tạm thời không thể truy cập.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => router.back()} 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </button>
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 hover:scale-105 transition-all"
          >
            <Home className="w-5 h-5" />
            Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
