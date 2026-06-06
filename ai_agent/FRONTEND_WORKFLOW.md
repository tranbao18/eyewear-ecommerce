# 🎨 Frontend Workflow — Next.js + TailwindCSS + shadcn/ui

> Mô tả toàn bộ kiến trúc, luồng UI/UX và quy tắc phát triển phần Frontend của dự án E-commerce Mắt Kính.

---

## 1. Tổng quan Kiến trúc

```
┌──────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │              Next.js App Router (SSR/SSG)         │    │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────────────┐  │    │
│  │  │ Pages   │ │Components│ │    Layouts         │  │    │
│  │  └────┬────┘ └────┬─────┘ └────────┬──────────┘  │    │
│  │       │           │                │              │    │
│  │  ┌────┴───────────┴────────────────┴──────────┐   │    │
│  │  │         shadcn/ui + TailwindCSS             │   │    │
│  │  └────────────────────────────────────────────┘   │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         │                                │
│  ┌──────────────────────┴───────────────────────────┐    │
│  │    Zustand (Cart Store, User State)               │    │
│  │    + localStorage persistence                     │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         │                                │
│  ┌──────────────────────┴───────────────────────────┐    │
│  │    API Client (Axios/Fetch) → Laravel REST API    │    │
│  │    Base URL: http://localhost:8000/api             │    │
│  └───────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Cấu trúc Thư mục Chi tiết

```text
frontend/src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout (Header, Footer)
│   ├── page.tsx                   # Trang chủ (Homepage)
│   ├── (auth)/                    # Group route cho Auth
│   │   ├── login/page.tsx         # Đăng nhập
│   │   └── register/page.tsx      # Đăng ký
│   ├── products/
│   │   ├── page.tsx               # Danh sách sản phẩm (Filter, Pagination)
│   │   └── [slug]/page.tsx        # Chi tiết sản phẩm (Gallery, Variants, Add to Cart)
│   ├── cart/page.tsx              # Giỏ hàng (Lấy dữ liệu từ Zustand)
│   ├── checkout/page.tsx          # Trang thanh toán COD
│   ├── thankyou/page.tsx          # Trang cảm ơn sau khi đặt hàng thành công
│   └── globals.css                # Global styles + Tailwind directives
│
├── components/
│   ├── ui/                        # shadcn/ui components (Button, Card, Input, Dialog...)
│   ├── layout/
│   │   ├── Header.tsx             # Navbar với logo, search, cart icon, user menu
│   │   ├── Footer.tsx             # Footer với thông tin liên hệ
│   │   └── MobileNav.tsx          # Navigation responsive cho mobile
│   ├── product/
│   │   ├── ProductCard.tsx        # Card sản phẩm (Ảnh, tên, giá, nút thêm giỏ)
│   │   ├── ProductGallery.tsx     # Slideshow bộ sưu tập ảnh sản phẩm
│   │   ├── ProductFilter.tsx      # Bộ lọc (Category, Brand, Price range)
│   │   └── VariantSelector.tsx    # Chọn biến thể (Màu sắc, Size)
│   ├── cart/
│   │   ├── CartItem.tsx           # Một dòng sản phẩm trong giỏ hàng
│   │   └── CartSummary.tsx        # Tổng tiền + nút Checkout
│   └── home/
│       ├── HeroBanner.tsx         # Banner chính trang chủ
│       ├── FeaturedProducts.tsx   # Sản phẩm nổi bật
│       └── CategorySection.tsx   # Danh mục nổi bật
│
├── lib/
│   ├── api.ts                     # Cấu hình API client (Axios instance)
│   ├── store.ts                   # Zustand Store definitions
│   └── utils.ts                   # Utility functions (format tiền, slug...)
│
└── types/
    ├── product.ts                 # Interface: Product, ProductVariant, ProductGallery
    ├── order.ts                   # Interface: Order, OrderItem
    └── user.ts                    # Interface: User
```

---

## 3. Luồng UI/UX Chi tiết (User Flows)

### 3.1 Trang chủ (Homepage)
```
┌──────────────────────────────────────────┐
│  Header: Logo | Search | Cart(badge) | Login
├──────────────────────────────────────────┤
│  Hero Banner (Slider ảnh lớn)            │
├──────────────────────────────────────────┤
│  Danh mục nổi bật (Grid cards)           │
│  [Kính râm] [Kính cận] [Kính thời trang]│
├──────────────────────────────────────────┤
│  Sản phẩm nổi bật (Carousel/Grid)       │
│  [Card] [Card] [Card] [Card]            │
├──────────────────────────────────────────┤
│  Footer: Liên hệ | Mạng xã hội          │
└──────────────────────────────────────────┘
```

### 3.2 Danh sách sản phẩm (/products)
```
┌──────────────────────────────────────────┐
│  Breadcrumb: Trang chủ > Sản phẩm       │
├──────────┬───────────────────────────────┤
│ Sidebar  │  Product Grid                 │
│ ──────── │  ┌──────┐ ┌──────┐ ┌──────┐  │
│ Category │  │Card 1│ │Card 2│ │Card 3│  │
│ Brand    │  └──────┘ └──────┘ └──────┘  │
│ Price    │  ┌──────┐ ┌──────┐ ┌──────┐  │
│ Range    │  │Card 4│ │Card 5│ │Card 6│  │
│          │  └──────┘ └──────┘ └──────┘  │
├──────────┴───────────────────────────────┤
│  Pagination: < 1 2 3 ... >               │
└──────────────────────────────────────────┘
```

### 3.3 Chi tiết sản phẩm (/products/[slug])
```
┌──────────────────────────────────────────┐
│  Breadcrumb: Trang chủ > SP > Tên SP     │
├──────────────────┬───────────────────────┤
│ Gallery          │  Tên sản phẩm         │
│ ┌──────────────┐ │  Brand: Ray-Ban       │
│ │  Ảnh lớn     │ │  Giá: 1,500,000 VND  │
│ │              │ │                       │
│ └──────────────┘ │  Chọn màu: ○ ○ ○     │
│ [thumb][thumb]   │  Chọn size: [S][M][L] │
│                  │                       │
│                  │  Số lượng: [-] 1 [+]  │
│                  │  [🛒 Thêm vào giỏ]   │
├──────────────────┴───────────────────────┤
│  Mô tả chi tiết sản phẩm                │
└──────────────────────────────────────────┘
```

### 3.4 Giỏ hàng (/cart)
```
┌──────────────────────────────────────────┐
│  Giỏ hàng của bạn (3 sản phẩm)          │
├──────────────────────────────────────────┤
│  [Ảnh] Tên SP | Màu: Đen | Size: M      │
│        Giá: 1,500,000 | SL: [-]1[+] | 🗑│
├──────────────────────────────────────────┤
│  [Ảnh] Tên SP | Màu: Trắng              │
│        Giá: 800,000  | SL: [-]2[+]  | 🗑│
├──────────────────────────────────────────┤
│                    Tạm tính: 3,100,000 VND│
│                    [Tiến hành thanh toán →]│
└──────────────────────────────────────────┘
```

### 3.5 Thanh toán (/checkout)
```
┌──────────────────────────────────────────┐
│  Thông tin giao hàng                      │
├──────────────────────────────────────────┤
│  Họ tên:     [________________]          │
│  SĐT:       [________________]          │
│  Địa chỉ:   [________________]          │
│                                          │
│  Phương thức: ◉ Thanh toán khi nhận hàng │
├──────────────────────────────────────────┤
│  Tóm tắt đơn hàng:                      │
│  SP 1 x 1 .............. 1,500,000      │
│  SP 2 x 2 .............. 1,600,000      │
│  ────────────────────────────────        │
│  Tổng cộng:              3,100,000 VND  │
│                                          │
│          [✅ Đặt hàng]                    │
└──────────────────────────────────────────┘
```

### 3.6 Cảm ơn (/thankyou?order=123)
```
┌──────────────────────────────────────────┐
│          ✅ Đặt hàng thành công!          │
│                                          │
│  Mã đơn hàng: #123                      │
│  Ngày đặt: 03/06/2026                   │
│  Trạng thái: Đang xử lý                 │
│                                          │
│  Sản phẩm đã đặt:                       │
│  ─ SP 1 (Đen, M) x 1 ... 1,500,000     │
│  ─ SP 2 (Trắng)  x 2 ... 1,600,000     │
│  ────────────────────────────────        │
│  Tổng: 3,100,000 VND                    │
│  Giao đến: 123 Nguyễn Văn A, Q.1, HCM  │
│                                          │
│  [🏠 Về trang chủ]  [📦 Xem đơn hàng]   │
└──────────────────────────────────────────┘
```

---

## 4. Zustand Store (State Management)

### 4.1 Cart Store
```typescript
// Cấu trúc dữ liệu giỏ hàng
interface CartItem {
  productId: number;
  variantId?: number;      // Null nếu SP không có biến thể
  name: string;
  image: string;
  color?: string;
  size?: string;
  price: number;           // Giá cuối cùng (đã cộng price_adjustment)
  quantity: number;
}

// Actions
- addToCart(item)          // Thêm SP vào giỏ (nếu trùng → tăng quantity)
- removeFromCart(id)       // Xóa 1 SP khỏi giỏ
- updateQuantity(id, qty)  // Cập nhật số lượng
- clearCart()              // Xóa toàn bộ giỏ hàng (sau khi đặt hàng)
- getTotalPrice()          // Tính tổng tiền
- getTotalItems()          // Đếm tổng số item (hiển thị badge)
```

### 4.2 User Store
```typescript
interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Actions
- login(email, password)   // Gọi API → lưu token
- register(data)           // Gọi API → lưu token
- logout()                 // Xóa token + user
- fetchUser()              // Lấy thông tin user từ API
```

---

## 5. API Client (lib/api.ts)

```typescript
// Axios instance configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,   // http://localhost:8000/api
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: Tự động gắn Bearer token nếu user đã login
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 6. Quy tắc phát triển Frontend

1. **Server Components (SC) vs Client Components (CC):**
   - Mặc định dùng **Server Components** cho pages cần SEO (Homepage, Product listing, Product detail).
   - Dùng `"use client"` cho components cần tương tác: Cart, VariantSelector, AddToCart button.

2. **Styling:**
   - Dùng **TailwindCSS utility classes** là chính.
   - shadcn/ui components đã tích hợp sẵn Tailwind.
   - Tránh inline styles. Custom styles chỉ khi thực sự cần thiết.

3. **Responsive Design:**
   - Mobile-first approach.
   - Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`.
   - Header chuyển thành hamburger menu trên mobile.

4. **SEO Best Practices:**
   - Mỗi page có `metadata` export (title, description).
   - Dùng `generateMetadata()` động cho trang chi tiết sản phẩm.
   - Sử dụng semantic HTML (`<main>`, `<article>`, `<section>`).
   - Tất cả ảnh dùng `<Image>` component của Next.js (lazy loading, optimization).

5. **Performance:**
   - Dùng `React.lazy()` / `dynamic()` cho components nặng.
   - Zustand persist middleware để đồng bộ cart với localStorage.
   - API calls caching với Next.js built-in fetch caching.

6. **Naming Convention:**
   - Components: PascalCase (VD: `ProductCard.tsx`)
   - Hooks: camelCase bắt đầu bằng `use` (VD: `useCart`)
   - Types/Interfaces: PascalCase (VD: `Product`, `CartItem`)
   - Utilities: camelCase (VD: `formatCurrency`)
