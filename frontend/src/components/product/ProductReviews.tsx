'use client';

import { useState, useEffect } from 'react';
import { Star, MessageCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/store';

type Review = {
  id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
};

type ReviewStats = {
  total: number;
  average: number;
  counts: Record<number, number>;
};

export default function ProductReviews({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { token, isAuthenticated } = useUserStore();

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${productId}/reviews`);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data);
        setStats(json.stats);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Quick token check
    if (!isAuthenticated || !token) {
      setError('Vui lòng đăng nhập để đánh giá sản phẩm.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Có lỗi xảy ra.');
      } else {
        setSuccess('Cảm ơn bạn đã đánh giá!');
        setComment('');
        setRating(5);
        fetchReviews(); // reload reviews
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} 
      />
    ));
  };

  if (loading) return <div className="py-12 animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-gray-200 rounded"></div><div className="h-4 bg-gray-200 rounded w-5/6"></div></div></div></div>;

  return (
    <div className="mt-20 border-t border-gray-100 pt-16">
      <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Đánh Giá Sản Phẩm</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left: Stats */}
        <div className="md:col-span-4">
          <div className="bg-gray-50 p-8 rounded-2xl flex flex-col items-center justify-center text-center h-full">
            <span className="text-6xl font-black text-black mb-2">{stats?.average || 0}</span>
            <div className="flex gap-1 mb-2">
              {renderStars(Math.round(stats?.average || 0))}
            </div>
            <p className="text-gray-500 text-sm">Dựa trên {stats?.total || 0} đánh giá</p>
          </div>
        </div>

        {/* Right: Write Review & List */}
        <div className="md:col-span-8 space-y-12">
          
          {/* Write Review Form */}
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Viết đánh giá của bạn
            </h3>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">{success}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chất lượng sản phẩm</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét chi tiết (Không bắt buộc)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border-gray-200 rounded-xl shadow-sm focus:border-black focus:ring-black sm:text-sm p-4 bg-gray-50"
                  rows={3}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          </div>

          {/* Review List */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Khách hàng nhận xét ({stats?.total || 0})</h3>
            
            {reviews.length === 0 ? (
              <p className="text-gray-500 italic text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 uppercase">
                        {review.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{review.user?.name || 'Người dùng ẩn danh'}</div>
                        <div className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm mt-3 ml-13 leading-relaxed pl-13">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
