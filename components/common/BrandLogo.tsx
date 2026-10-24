'use client';

import React from 'react';
import Image from 'next/image';

export interface BrandLogoProps {
  /**
   * Logo layout variant:
   * - 'navbar': The horizontal 'book my [studio]' brand mark, optimized for headers (aspect ratio ~6.7:1).
   * - 'full': The complete logo including the tagline 'Discover Your Perfect Studio Space' (aspect ratio ~4.2:1).
   * - 'mark': The compact square brand mark ('b' in yellow squircle, aspect ratio 1:1).
   * - 'official': The original unmodified 1563x1563 asset provided by the project lead.
   */
  variant?: 'navbar' | 'full' | 'mark' | 'official';
  /**
   * Theme mode:
   * - 'auto': Uses responsive CSS classes so dark theme gets white lettering on 'book my' and light theme gets dark lettering.
   * - 'dark': Forces dark-background version.
   * - 'light': Forces light-background version.
   */
  theme?: 'auto' | 'dark' | 'light';
  /**
   * Custom width in pixels. If not provided, sensible defaults for the variant are used.
   */
  width?: number;
  /**
   * Custom height in pixels. If not provided, sensible defaults for the variant are used.
   */
  height?: number;
  /**
   * Optional Tailwind classes for the outer wrapper container.
   */
  className?: string;
  /**
   * Optional Tailwind classes for the <img> elements.
   */
  imageClassName?: string;
  /**
   * Next.js priority loading (recommended for navbar and hero).
   */
  priority?: boolean;
  /**
   * Accessible alternative text. Defaults to 'BookMyStudio'.
   */
  alt?: string;
  /**
   * If true, displays the official tagline directly underneath the brand name.
   */
  showTagline?: boolean;
  /**
   * Custom tagline text. Defaults to 'Discover Your Perfect Studio Space!'.
   */
  tagline?: string;
  /**
   * Optional custom Tailwind class for the tagline text.
   */
  taglineClassName?: string;
  /**
   * Optional badge element placed inline next to the brand name (e.g. Partner badge).
   */
  badge?: React.ReactNode;
}

export function BrandLogo({
  variant = 'navbar',
  theme = 'auto',
  width,
  height,
  className = '',
  imageClassName = '',
  priority = false,
  alt = 'BookMyStudio',
  showTagline = false,
  tagline = 'Discover Your Perfect Studio Space!',
  taglineClassName = '',
  badge,
}: BrandLogoProps) {
  if (variant === 'official') {
    const finalWidth = width || 160;
    const finalHeight = height || 160;
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <Image
          src="/images/bookmystudio-logo.png"
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          priority={priority}
          className={`object-contain ${imageClassName}`}
        />
      </div>
    );
  }

  if (variant === 'mark') {
    const finalSize = width || height || 32;
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <Image
          src="/images/bookmystudio-mark.png"
          alt={alt}
          width={finalSize}
          height={finalSize}
          priority={priority}
          className={`rounded-lg object-contain ${imageClassName}`}
        />
      </div>
    );
  }

  if (variant === 'full') {
    // Aspect ratio 1056 x 250 ~= 4.224 : 1
    const finalHeight = height || 38;
    const finalWidth = width || Math.round(finalHeight * 4.224);

    if (theme === 'dark') {
      return (
        <div className={`relative inline-flex items-center ${className}`}>
          <Image
            src="/images/bookmystudio-logo-full-dark.png"
            alt={alt}
            width={finalWidth}
            height={finalHeight}
            priority={priority}
            style={{ height: `${finalHeight}px`, width: 'auto' }}
            className={`object-contain ${imageClassName}`}
          />
        </div>
      );
    }

    if (theme === 'light') {
      return (
        <div className={`relative inline-flex items-center ${className}`}>
          <Image
            src="/images/bookmystudio-logo-full-light.png"
            alt={alt}
            width={finalWidth}
            height={finalHeight}
            priority={priority}
            style={{ height: `${finalHeight}px`, width: 'auto' }}
            className={`object-contain ${imageClassName}`}
          />
        </div>
      );
    }

    return (
      <div className={`relative inline-flex items-center ${className}`}>
        {/* Dark Theme: white 'book my' + yellow 'studio' box */}
        <Image
          src="/images/bookmystudio-logo-full-dark.png"
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          priority={priority}
          style={{ height: `${finalHeight}px`, width: 'auto' }}
          className={`hidden dark:block object-contain ${imageClassName}`}
        />
        {/* Light Theme: dark 'book my' + yellow 'studio' box */}
        <Image
          src="/images/bookmystudio-logo-full-light.png"
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          priority={priority}
          style={{ height: `${finalHeight}px`, width: 'auto' }}
          className={`dark:hidden block object-contain ${imageClassName}`}
        />
      </div>
    );
  }

  // Default: variant === 'navbar'
  // Aspect ratio 1056 x 158 ~= 6.68 : 1
  const finalHeight = height || (showTagline ? 22 : 26);
  const finalWidth = width || Math.round(finalHeight * 6.68);

  const renderLogoImage = () => {
    if (theme === 'dark') {
      return (
        <Image
          src="/images/bookmystudio-logo-dark.png"
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          priority={priority}
          style={{ height: `${finalHeight}px`, width: 'auto' }}
          className={`object-contain ${imageClassName}`}
        />
      );
    }

    if (theme === 'light') {
      return (
        <Image
          src="/images/bookmystudio-logo-light.png"
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          priority={priority}
          style={{ height: `${finalHeight}px`, width: 'auto' }}
          className={`object-contain ${imageClassName}`}
        />
      );
    }

    return (
      <>
        {/* Dark Theme */}
        <Image
          src="/images/bookmystudio-logo-dark.png"
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          priority={priority}
          style={{ height: `${finalHeight}px`, width: 'auto' }}
          className={`hidden dark:block object-contain ${imageClassName}`}
        />
        {/* Light Theme */}
        <Image
          src="/images/bookmystudio-logo-light.png"
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          priority={priority}
          style={{ height: `${finalHeight}px`, width: 'auto' }}
          className={`dark:hidden block object-contain ${imageClassName}`}
        />
      </>
    );
  };

  if (showTagline) {
    const taglineText = tagline || 'Discover Your Perfect Studio Space!';
    return (
      <div className={`relative inline-flex flex-col items-start justify-center ${className}`}>
        <div className="flex items-center gap-2">
          {renderLogoImage()}
          {badge}
        </div>
        <span
          className={`text-[9px] xs:text-[9.5px] sm:text-[10px] font-medium tracking-tight text-zinc-600 dark:text-zinc-400 select-none whitespace-nowrap mt-0.5 leading-none transition-colors ${taglineClassName}`}
        >
          {taglineText}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${badge ? 'gap-2' : ''} ${className}`}>
      {renderLogoImage()}
      {badge}
    </div>
  );
}