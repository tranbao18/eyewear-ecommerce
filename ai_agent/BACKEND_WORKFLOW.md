# 🔧 Backend Workflow — Laravel + Filament PHP

> Mô tả toàn bộ kiến trúc, luồng xử lý và quy tắc phát triển phần Backend của dự án E-commerce Mắt Kính.

---

## 1. Tổng quan Kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                     BACKEND (Laravel)                    │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │  Filament     │    │  REST API    │    │  Sanctum  │  │
│  │  Admin Panel  │    │  Controllers │    │  Auth     │  │
│  │  /admin       │    │  /api/*      │    │           │  │
│  └──────┬───────┘    └──────┬───────┘    └─────┬─────┘  │
│         │                   │                  │        │
│  ┌──────┴───────────────────┴──────────────────┴─────┐  │
│  │              Eloquent Models & Services            │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────┴────────────────────────────┐  │
│  │                   MySQL Database                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema (Cấu trúc CSDL)

### 2.1 Bảng `users`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | bigint (PK) | ID tự tăng |
| name | string | Họ tên |
| email | string (unique) | Email đăng nhập |
| password | string | Mật khẩu đã mã hóa |
| role | enum: `admin`, `customer` | Phân quyền (mặc định: `customer`) |
| timestamps | | created_at, updated_at |

### 2.2 Bảng `categories`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | bigint (PK) | ID tự tăng |
| name | string | Tên danh mục (VD: Kính râm, Kính cận) |
| slug | string (unique) | URL-friendly (VD: kinh-ram) |
| image | string (nullable) | Ảnh đại diện danh mục |
| description | text (nullable) | Mô tả |
| timestamps | | created_at, updated_at |

### 2.3 Bảng `brands`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | bigint (PK) | ID tự tăng |
| name | string | Tên thương hiệu (VD: Ray-Ban) |
| slug | string (unique) | URL-friendly |
| logo | string (nullable) | Logo thương hiệu |
| timestamps | | created_at, updated_at |

### 2.4 Bảng `products`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | bigint (PK) | ID tự tăng |
| category_id | FK → categories | Danh mục |
| brand_id | FK → brands | Thương hiệu |
| name | string | Tên sản phẩm |
| slug | string (unique) | URL-friendly |
| description | text (nullable) | Mô tả chi tiết |
| price | decimal(12,2) | Giá gốc |
| stock_quantity | integer | Tồn kho tổng (nếu không dùng variant) |
| image_url | string (nullable) | Ảnh đại diện chính |
| is_active | boolean | Hiển thị/Ẩn (mặc định: true) |
| timestamps | | created_at, updated_at |

### 2.5 Bảng `product_variants` (Biến thể sản phẩm)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | bigint (PK) | ID tự tăng |
| product_id | FK → products | Sản phẩm gốc |
| color | string (nullable) | Màu sắc (VD: Đen, Vàng, Bạc) |
| size | string (nullable) | Kích cỡ (VD: S, M, L) |
| price_adjustment | decimal(12,2) | Chênh lệch giá so với giá gốc (mặc định: 0) |
| stock_quantity | integer | Tồn kho riêng của biến thể |
| timestamps | | created_at, updated_at |

### 2.6 Bảng `product_galleries` (Bộ sưu tập ảnh)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | bigint (PK) | ID tự tăng |
| product_id | FK → products | Sản phẩm |
| image_url | string | Đường dẫn ảnh |
| timestamps | | created_at, updated_at |

### 2.7 Bảng `orders`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | bigint (PK) | ID tự tăng |
| user_id | FK → users (nullable) | Khách hàng (null = khách vãng lai) |
| total_amount | decimal(12,2) | Tổng tiền đơn hàng |
| status | enum | `pending`, `processing`, `shipped`, `completed`, `cancelled` |
| payment_method | string | Mặc định: `cod` |
| customer_name | string | Tên người nhận |
| customer_phone | string | SĐT người nhận |
| shipping_address | text | Địa chỉ giao hàng |
| timestamps | | created_at, updated_at |

### 2.8 Bảng `order_items`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | bigint (PK) | ID tự tăng |
| order_id | FK → orders | Đơn hàng |
| product_id | FK → products | Sản phẩm |
| product_variant_id | FK → product_variants (nullable) | Biến thể (nếu có) |
| quantity | integer | Số lượng |
| price | decimal(12,2) | Giá tại thời điểm mua |
| timestamps | | created_at, updated_at |

---

## 3. Luồng xử lý chính (Business Flows)

### 3.1 Luồng Đăng ký / Đăng nhập (Authentication)
```
[Frontend] POST /api/register  →  Tạo user (role=customer) → Trả về token Sanctum
[Frontend] POST /api/login     →  Xác thực email/password  → Trả về token Sanctum
[Frontend] GET  /api/user      →  Lấy thông tin user hiện tại (Bearer token)
[Frontend] POST /api/logout    →  Hủy token hiện tại
```

### 3.2 Luồng Xem sản phẩm (Product Browsing)
```
[Frontend] GET /api/products                 → Danh sách SP (filter, paginate)
           Query params: ?category=slug&brand=slug&search=keyword&page=1
[Frontend] GET /api/products/{slug}          → Chi tiết SP kèm variants & gallery
           Response: { product, variants[], galleries[] }
[Frontend] GET /api/categories               → Danh sách danh mục
[Frontend] GET /api/brands                   → Danh sách thương hiệu
```

### 3.3 Luồng Đặt hàng (Checkout Flow)
```
1. [Frontend Zustand]  User thêm SP vào giỏ hàng (lưu localStorage)
2. [Frontend]          User vào trang Checkout, điền thông tin giao hàng
3. [Frontend]          POST /api/orders  →  Gửi cart items + shipping info
4. [Backend]           Validate dữ liệu, kiểm tra tồn kho
5. [Backend]           Tạo Order + OrderItems, trừ stock_quantity
6. [Backend]           Trả về order_id + thông tin đơn hàng
7. [Frontend]          Redirect sang trang /thankyou?order={order_id}
```

### 3.4 Luồng Quản trị Admin (Filament Panel)
```
[Admin] Truy cập /admin  →  Đăng nhập bằng tài khoản role=admin
[Admin] CRUD Categories, Brands
[Admin] CRUD Products (kèm quản lý Variants & Gallery qua Relation Manager)
[Admin] Xem danh sách Orders → Cập nhật trạng thái đơn hàng
[Admin] Quản lý Users (Xem/khóa tài khoản)
```

---

## 4. Cấu trúc thư mục Backend quan trọng

```text
backend/
├── app/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Category.php
│   │   ├── Brand.php
│   │   ├── Product.php
│   │   ├── ProductVariant.php
│   │   ├── ProductGallery.php
│   │   ├── Order.php
│   │   └── OrderItem.php
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/              # Controllers cho REST API
│   │           ├── AuthController.php
│   │           ├── ProductController.php
│   │           ├── CategoryController.php
│   │           ├── BrandController.php
│   │           └── OrderController.php
│   └── Filament/
│       └── Resources/            # Filament Admin Resources
│           ├── CategoryResource.php
│           ├── BrandResource.php
│           ├── ProductResource.php
│           ├── OrderResource.php
│           └── UserResource.php
├── database/
│   └── migrations/               # Các file migration tạo bảng
├── routes/
│   ├── api.php                   # Định nghĩa API routes
│   └── web.php                   # Web routes (Filament tự handle)
└── config/
    └── cors.php                  # Cấu hình CORS cho Frontend
```

---

## 5. Quy tắc phát triển Backend

1. **API Response Format chuẩn:**
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "Thành công"
   }
   ```

2. **Luôn dùng API Resources** (Laravel Resources) để format dữ liệu trả về, tránh lộ thông tin nhạy cảm.

3. **Validation:** Mỗi API endpoint cần có FormRequest riêng để validate input.

4. **Authentication:** Tất cả API cần auth phải đặt trong middleware `auth:sanctum`.

5. **Naming Convention:**
   - Model: PascalCase số ít (VD: `ProductVariant`)
   - Migration: snake_case số nhiều (VD: `create_product_variants_table`)
   - Controller: PascalCase + `Controller` (VD: `ProductController`)
   - API Route: kebab-case số nhiều (VD: `/api/products`)
