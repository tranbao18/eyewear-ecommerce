export function getActivePriceInfo(price: number | string, salePrice?: number | string | null, startsAt?: string | null, endsAt?: string | null) {
  const numPrice = Number(price);
  const numSalePrice = Number(salePrice);

  if (!salePrice || isNaN(numSalePrice) || numSalePrice <= 0) {
    return { isSale: false, originalPrice: numPrice, finalPrice: numPrice };
  }
  
  const now = new Date();
  
  if (startsAt && new Date(startsAt) > now) {
    return { isSale: false, originalPrice: numPrice, finalPrice: numPrice };
  }
  
  if (endsAt && new Date(endsAt) < now) {
    return { isSale: false, originalPrice: numPrice, finalPrice: numPrice };
  }

  const discountPercent = Math.round((1 - numSalePrice / numPrice) * 100);
  
  return { 
    isSale: true, 
    originalPrice: numPrice, 
    finalPrice: numSalePrice,
    discountPercent
  };
}
