'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) return null;

  // Sync active dot/counter with mobile scroll-snap
  const handleMobileScroll = () => {
    if (!mobileScrollRef.current) return;
    const { scrollLeft, offsetWidth } = mobileScrollRef.current;
    if (offsetWidth === 0) return;
    const newIndex = Math.round(scrollLeft / offsetWidth);
    if (newIndex !== activeImageIndex && newIndex >= 0 && newIndex < images.length) {
      setActiveImageIndex(newIndex);
    }
  };

  const scrollToImage = (index: number) => {
    setActiveImageIndex(index);
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollTo({
        left: index * mobileScrollRef.current.offsetWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* ========================================================
          MOBILE VIEW: Native-Feeling Touch-Swipeable Carousel (< sm)
         ======================================================== */}
      <div className="sm:hidden relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-[#303030] shadow-xs select-none">
        {/* Horizontal Scroll Snap Track */}
        <div
          ref={mobileScrollRef}
          onScroll={handleMobileScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
        >
          {images.map((img, idx) => (
            <div
              key={img + idx}
              className="relative w-full h-full shrink-0 snap-center bg-slate-900"
            >
              <Image
                src={img}
                alt={`${alt} — Photo ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Counter Badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white z-10">
          {activeImageIndex + 1} / {images.length}
        </div>

        {/* Swipe Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToImage(idx)}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  activeImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                }`}
                aria-label={`Jump to photo ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          DESKTOP VIEW: High-Res Featured Image + Thumbnail Strip (sm+)
         ======================================================== */}
      <div className="hidden sm:block space-y-3">
        {/* Featured Main Image */}
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-[#303030] shadow-xs">
          <Image
            src={images[activeImageIndex] || images[0]}
            alt={`${alt} — Photo ${activeImageIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="object-cover transition-all duration-300"
          />
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-semibold text-white">
            Photo {activeImageIndex + 1} of {images.length}
          </div>
        </div>

        {/* Thumbnails Strip */}
        {images.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={img + idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  activeImageIndex === idx
                    ? 'border-slate-900 dark:border-[#10B981] ring-2 ring-slate-900/20 dark:ring-[#10B981]/20'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                aria-label={`View photo ${idx + 1}`}
              >
                <Image
                  src={img}
                  alt={`${alt} thumbnail ${idx + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
