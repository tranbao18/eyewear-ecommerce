import Link from 'next/link';
import ProductCard from '../product/ProductCard';

export default async function FeaturedProducts() {
  let products = [];
  
  try {
    const res = await fetch('http://127.0.0.1:8000/api/products', {
      cache: 'no-store'
    });
    
    if (res.ok) {
      const json = await res.json();
      products = json.data?.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase mb-2 text-black">Sản Phẩm Nổi Bật</h2>
            <p className="text-gray-500 max-w-2xl">Những mẫu kính được yêu thích nhất trong tháng này.</p>
          </div>
          <Link href="/products" className="text-sm font-bold uppercase tracking-wider hover:text-gray-500 transition-colors hidden md:block border-b-2 border-black pb-1 text-black">
            Xem Tất Cả Sản Phẩm
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                isNew={index < 4}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-lg">Chưa có sản phẩm nào. Hãy truy cập trang Quản trị (Admin) để thêm sản phẩm nhé!</p>
          </div>
        )}
      </div>
    </section>
  );
}
