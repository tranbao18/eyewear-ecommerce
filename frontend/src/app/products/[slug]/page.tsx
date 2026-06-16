import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/product/ProductGallery';
import VariantSelector from '@/components/product/VariantSelector';
import ProductReviews from '@/components/product/ProductReviews';
import { ChevronRight } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
};

async function fetchProductDetail(slug: string) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/products/${slug}`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (error) {
    console.error('Failed to fetch product details:', error);
  }
  return null;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductDetail(slug);

  if (!product) {
    notFound();
  }

  // Format product for variant selector
  const productBase = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    sale_price: product.sale_price,
    sale_price_starts_at: product.sale_price_starts_at,
    sale_price_ends_at: product.sale_price_ends_at,
    image: product.image_url 
      ? (product.image_url.startsWith('http') ? product.image_url : `http://127.0.0.1:8000/storage/${product.image_url}`)
      : 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop'
  };

  return (
    <div className="bg-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-black transition-colors">Sản phẩm</Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-black transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-black font-medium">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Left: Gallery */}
          <div className="w-full lg:w-1/2 shrink-0">
            <ProductGallery 
              mainImage={product.image_url}
              images={product.galleries || []} 
              productName={product.name}
            />
          </div>

          {/* Right: Info & Actions */}
          <div className="flex-1 flex flex-col pt-4">
            
            {/* Header Info */}
            <div className="mb-8">
              {product.brand && (
                <span className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                  {product.brand.name}
                </span>
              )}
              <h1 className="text-3xl md:text-5xl font-black text-black tracking-tight mb-4 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Variant Selector & Price */}
            <div className="mb-10">
              <VariantSelector 
                product={productBase}
                variants={product.variants || []}
              />
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 pt-8 mt-auto">
              <h3 className="font-bold uppercase tracking-wider text-black mb-4">Chi tiết sản phẩm</h3>
              <div 
                className="prose prose-sm text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có thông tin mô tả cho sản phẩm này.' }}
              />
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}
