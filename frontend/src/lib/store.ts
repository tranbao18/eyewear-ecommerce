import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===== USER STORE ===== //
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  favoriteIds: number[];
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setFavoriteIds: (ids: number[]) => void;
  toggleFavoriteId: (id: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      favoriteIds: [],
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false, favoriteIds: [] }),
      setUser: (user) => set({ user }),
      setFavoriteIds: (ids) => set({ favoriteIds: ids }),
      toggleFavoriteId: (id) => set((state) => ({
        favoriteIds: state.favoriteIds.includes(id) 
          ? state.favoriteIds.filter(fId => fId !== id)
          : [...state.favoriteIds, id]
      })),
    }),
    {
      name: 'auth-storage', // Lưu vào localStorage với key này
    }
  )
);

// ===== CART STORE ===== //
export interface CartItem {
  productId: number;
  variantId?: number | null;
  name: string;
  image: string;
  color?: string;
  size?: string;
  variantName?: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, variantId?: number | null) => void;
  updateQuantity: (productId: number, variantId: number | null | undefined, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (newItem) => {
        set((state) => {
          // Kiểm tra xem sản phẩm (cùng variant) đã có trong giỏ chưa
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
          );

          if (existingItemIndex !== -1) {
            // Nếu có rồi thì tăng số lượng
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += newItem.quantity;
            return { items: newItems };
          }

          // Nếu chưa có thì thêm mới
          return { items: [...state.items, newItem] };
        });
      },

      removeFromCart: (productId, variantId = null) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId = null, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // Lưu giỏ hàng vào localStorage
    }
  )
);
