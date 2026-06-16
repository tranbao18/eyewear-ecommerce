'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChangeEvent } from 'react';

export default function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSort === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }
    
    // Reset to page 1 when sorting changes
    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select 
      value={currentSort}
      onChange={handleSortChange}
      className="border-gray-200 rounded-lg text-sm focus:ring-black focus:border-black"
    >
      <option value="newest">Mới nhất</option>
      <option value="price_asc">Giá tăng dần</option>
      <option value="price_desc">Giá giảm dần</option>
    </select>
  );
}
