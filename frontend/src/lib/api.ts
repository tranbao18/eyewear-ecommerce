import axios from 'axios';
import { useUserStore } from './store';

// Tạo Axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor: Tự động gắn token vào header Authorization nếu có
api.interceptors.request.use(
  (config) => {
    // Lấy token từ Zustand store
    const token = useUserStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tự động xử lý lỗi (ví dụ token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ -> Đăng xuất
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
