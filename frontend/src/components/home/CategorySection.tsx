import Link from 'next/link';
import CategorySlider from './CategorySlider';

async function fetchCategories() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/categories', {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export default async function CategorySection() {
  const categories = await fetchCategories();
  console.log('Fetched categories:', categories);



  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-black">Danh Mục Sản Phẩm</h2>
          <Link href="/products" className="text-sm font-bold uppercase tracking-wider hover:text-gray-500 transition-colors hidden md:block border-b-2 border-black pb-1 text-black">
            Xem Tất Cả
          </Link>
        </div>

        <CategorySlider categories={categories} />
      </div>
    </section>
  );
}
