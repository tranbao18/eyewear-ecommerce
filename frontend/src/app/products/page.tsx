import ProductFilter from '@/components/product/ProductFilter';
import ProductCard from '@/components/product/ProductCard';
import ProductSort from '@/components/product/ProductSort';
import { Suspense } from 'react';

// Next.js 15+ searchParams is a Promise
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function fetchProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams();
  
  if (typeof searchParams.category === 'string') params.append('category', searchParams.category);
  if (typeof searchParams.search === 'string') params.append('search', searchParams.search);
  if (typeof searchParams.brand === 'string') params.append('brand', searchParams.brand);
  if (typeof searchParams.min_price === 'string') params.append('min_price', searchParams.min_price);
  if (typeof searchParams.max_price === 'string') params.append('max_price', searchParams.max_price);
  if (typeof searchParams.sort === 'string') params.append('sort', searchParams.sort);
  if (typeof searchParams.page === 'string') params.append('page', searchParams.page);

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/products?${params.toString()}`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
  return { data: [], current_page: 1, last_page: 1 };
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const productsData = await fetchProducts(params);
  const products = productsData.data || [];

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-4">
            {params.search ? `Kết quả tìm kiếm: "${params.search}"` : 'Tất Cả Sản Phẩm'}
          </h1>
          <p className="text-gray-500">
            {params.search ? `Tìm thấy ${products.length} sản phẩm phù hợp.` : 'Tìm kiếm mẫu kính phù hợp với phong cách của bạn.'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="w-full lg:w-1/4 shrink-0">
            <Suspense fallback={<div className="bg-white p-6 rounded-2xl h-[400px] animate-pulse"></div>}>
              <ProductFilter />
            </Suspense>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between mb-8">
              <span className="text-sm font-medium text-gray-500">
                Hiển thị <span className="text-black font-bold">{products.length}</span> sản phẩm
              </span>
              
              <Suspense fallback={<div className="w-32 h-9 bg-gray-100 rounded-lg animate-pulse"></div>}>
                <ProductSort />
              </Suspense>
            </div>

            {/* Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product: any, index: number) => (
                  <ProductCard 
                    key={product.id} 
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    sale_price={product.sale_price}
                    sale_price_starts_at={product.sale_price_starts_at}
                    sale_price_ends_at={product.sale_price_ends_at}
                    image={product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `http://127.0.0.1:8000/storage/${product.image_url}`) : 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop'}
                    category={product.category?.name || 'Chưa phân loại'}
                    isNew={false}
                    priority={index < 4}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-16 rounded-2xl border border-dashed border-gray-300 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm nào</h3>
                <p className="text-gray-500">Vui lòng thử thay đổi bộ lọc hoặc xóa các tùy chọn lọc.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
