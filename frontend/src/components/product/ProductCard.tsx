import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import FavoriteButton from './FavoriteButton';
import { getActivePriceInfo } from '@/lib/priceUtils';

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
  sale_price?: number;
  sale_price_starts_at?: string;
  sale_price_ends_at?: string;
  priority?: boolean;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  image,
  category,
  isNew = false,
  sale_price,
  sale_price_starts_at,
  sale_price_ends_at,
  priority = false,
}: ProductCardProps) {
  const { isSale, finalPrice, originalPrice, discountPercent } = getActivePriceInfo(
    price,
    sale_price,
    sale_price_starts_at,
    sale_price_ends_at
  );
  return (
    <div className="group relative block overflow-hidden bg-white rounded-2xl p-4 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {isNew && (
          <span className="bg-black text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Mới
          </span>
        )}
        {isSale && (
          <span className="bg-red-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}
      </div>
      
      {/* Favorite Button */}
      <FavoriteButton productId={id} />

      {/* Image Container */}
      <Link href={`/products/${slug}`} className="relative block h-64 overflow-hidden rounded-xl mb-4 bg-gray-50">
        <Image
          src={image}
          alt={name}
          fill
          priority={priority}
          unoptimized={process.env.NODE_ENV === 'development'}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Content */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
          {category}
        </span>
        <Link href={`/products/${slug}`} className="hover:text-gray-600 transition-colors">
          <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1">{name}</h3>
        </Link>
        
        <div className="flex flex-col mt-2">
          {isSale ? (
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-red-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
              </span>
              <span className="text-sm text-gray-400 line-through font-medium">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
              </span>
            </div>
          ) : (
            <span className="font-black text-xl text-gray-900">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
            </span>
          )}
          
        </div>
      </div>
    </div>
  );
}
