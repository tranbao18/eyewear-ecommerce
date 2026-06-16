'use client';

import { useState, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { getActivePriceInfo } from '@/lib/priceUtils';

interface AttributeValue {
  id: number;
  value: string;
  attribute: {
    id: number;
    name: string;
  };
}

interface Variant {
  id: number;
  sku: string;
  price_adjustment: number;
  stock: number;
  attribute_values: AttributeValue[];
}

interface VariantSelectorProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    sale_price_starts_at?: string;
    sale_price_ends_at?: string;
    image?: string;
  };
  variants: Variant[];
}

export default function VariantSelector({ product, variants }: VariantSelectorProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  // Group available attributes and their unique values
  const groupedAttributes = useMemo(() => {
    const map = new Map<string, { id: number; values: { id: number; value: string }[] }>();
    
    variants?.forEach((variant) => {
      variant.attribute_values?.forEach((av) => {
        const attrName = av.attribute.name;
        if (!map.has(attrName)) {
          map.set(attrName, { id: av.attribute.id, values: [] });
        }
        
        const existingValues = map.get(attrName)!.values;
        if (!existingValues.find((v) => v.id === av.id)) {
          existingValues.push({ id: av.id, value: av.value });
        }
      });
    });
    
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }));
  }, [variants]);

  // State to hold selected attribute values (attributeName -> attributeValueId)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);

  const handleSelectOption = (attrName: string, valueId: number) => {
    setSelectedOptions((prev) => ({ ...prev, [attrName]: valueId }));
  };

  // Find matching variant based on selected options
  const matchingVariant = useMemo(() => {
    if (Object.keys(selectedOptions).length !== groupedAttributes.length) return null;
    
    return variants?.find((variant) => {
      const variantValueIds = variant.attribute_values?.map((av) => av.id) || [];
      const selectedValueIds = Object.values(selectedOptions);
      return selectedValueIds.every((id) => variantValueIds.includes(id));
    });
  }, [selectedOptions, variants, groupedAttributes]);

  const { isSale, finalPrice: baseSalePrice, originalPrice, discountPercent } = getActivePriceInfo(
    product.price,
    product.sale_price,
    product.sale_price_starts_at,
    product.sale_price_ends_at
  );

  const finalPrice = matchingVariant 
    ? Number(baseSalePrice) + Number(matchingVariant.price_adjustment) 
    : Number(baseSalePrice);
    
  const displayOriginalPrice = matchingVariant 
    ? Number(originalPrice) + Number(matchingVariant.price_adjustment)
    : Number(originalPrice);

  const handleAddToCart = () => {
    if (groupedAttributes.length > 0 && !matchingVariant) {
      toast.error('Vui lòng chọn đầy đủ các tùy chọn sản phẩm');
      return;
    }

    // Lấy đúng tên thuộc tính (giá trị) mà người dùng đã bấm chọn trong UI
    const selectedValueIds = Object.values(selectedOptions);
    const selectedAttributes = matchingVariant?.attribute_values?.filter(av => selectedValueIds.includes(av.id)) || [];
    
    const colorAttr = selectedAttributes.find(av => av.attribute.name.toLowerCase().includes('màu') || av.attribute.name.toLowerCase().includes('color'));
    const sizeAttr = selectedAttributes.find(av => av.attribute.name.toLowerCase().includes('kích') || av.attribute.name.toLowerCase().includes('size'));
    
    const variantNameStr = selectedAttributes.map(av => av.value).join(' / ');

    addToCart({
      productId: product.id,
      variantId: matchingVariant?.id,
      name: product.name,
      image: product.image || '',
      price: finalPrice,
      quantity,
      color: colorAttr?.value,
      size: sizeAttr?.value,
      variantName: variantNameStr,
    });
    
    // Quick visual feedback
    toast.success('Đã thêm vào giỏ hàng!');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Price */}
      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-black">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
          </span>
          {isSale && (
            <span className="text-xl text-gray-400 line-through font-medium">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayOriginalPrice)}
            </span>
          )}
          {isSale && (
            <span className="bg-red-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              -{discountPercent}%
            </span>
          )}
        </div>
        {matchingVariant?.stock !== undefined && (
          <p className="text-sm text-gray-500 mt-1">
            Còn lại: {matchingVariant.stock} sản phẩm
          </p>
        )}
      </div>

      {/* Attributes */}
      {groupedAttributes.map((attr) => (
        <div key={attr.id} className="flex flex-col gap-3">
          <span className="font-bold uppercase tracking-wider text-sm text-black">
            {attr.name}
          </span>
          <div className="flex flex-wrap gap-3">
            {attr.values.map((val) => (
              <button
                key={val.id}
                onClick={() => handleSelectOption(attr.name, val.id)}
                className={`px-5 py-2 rounded-lg border-2 font-medium transition-all ${
                  selectedOptions[attr.name] === val.id
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 hover:border-gray-300 text-gray-900 bg-white'
                }`}
              >
                {val.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4">
        {/* Quantity */}
        <div className="flex items-center border-2 border-gray-200 rounded-lg h-14">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors rounded-l-lg"
          >
            -
          </button>
          <span className="w-12 text-center font-bold text-black">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors rounded-r-lg"
          >
            +
          </button>
        </div>

        {/* Add to Cart */}
        <button 
          onClick={handleAddToCart}
          className="flex-1 h-14 bg-black text-white rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors active:scale-[0.98]"
        >
          <ShoppingCart className="w-5 h-5" />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
