'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useUserStore } from '@/lib/store';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function FavoriteButton({ productId }: { productId: number }) {
  const { isAuthenticated, favoriteIds, toggleFavoriteId } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const isFavorited = favoriteIds.includes(productId);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào mục yêu thích');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/favorites/toggle', { product_id: productId });
      toggleFavoriteId(productId);
      if (response.data.is_favorited) {
        toast.success(response.data.message);
      } else {
        toast('Đã bỏ yêu thích', { icon: '💔' });
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110 ${
        isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      }`}
    >
      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
    </button>
  );
}
