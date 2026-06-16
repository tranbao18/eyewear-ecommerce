'use client';

import { useState } from 'react';
import Image from 'next/image';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop';

function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:8000/storage/${url}`;
}

interface GalleryImage {
  id: number;
  image_url?: string;
  image_path?: string;
}

interface ProductGalleryProps {
  mainImage?: string;
  images: GalleryImage[];
  productName: string;
}

export default function ProductGallery({ mainImage, images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Combine main image and gallery images
  const allImages: { id: number; url: string }[] = [];
  if (mainImage) {
    allImages.push({ id: -1, url: resolveImageUrl(mainImage) });
  }
  images.forEach(img => {
    // Support both image_url (backend field) and image_path (legacy)
    const rawUrl = img.image_url || img.image_path;
    if (rawUrl) {
      allImages.push({ id: img.id, url: resolveImageUrl(rawUrl) });
    }
  });

  // Fallback if no images at all
  const displayImages = allImages.length > 0
    ? allImages
    : [{ id: 0, url: FALLBACK_IMAGE }];

  const activeImageUrl = displayImages[activeIndex]?.url || FALLBACK_IMAGE;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
        <Image
          src={activeImageUrl}
          alt={productName}
          fill
          unoptimized={process.env.NODE_ENV === 'development'}
          className="object-cover transition-all duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {displayImages.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                activeIndex === index ? 'border-black' : 'border-transparent hover:border-gray-200'
              }`}
            >
              <Image
                src={img.url}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                unoptimized={process.env.NODE_ENV === 'development'}
                className="object-cover"
                sizes="25vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
