'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/lib/store';
import { api } from '@/lib/api';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { login } = useUserStore();
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      // Temporarily set token in API headers to fetch user info
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      api.get('/user')
        .then(response => {
          if (response.data.success) {
            login(token, response.data.data);
            router.push('/profile');
          }
        })
        .catch(err => {
          console.error(err);
          setError('Không thể lấy thông tin người dùng.');
          setTimeout(() => router.push('/login'), 2000);
        });
    } else {
      setError('Token không hợp lệ.');
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [token, login, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {error ? (
        <div className="text-red-500 font-medium p-4 bg-red-50 rounded-xl">{error}</div>
      ) : (
        <>
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold uppercase tracking-wider">Đang xác thực...</h2>
          <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-4">
      <Suspense fallback={<div className="flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div></div>}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
