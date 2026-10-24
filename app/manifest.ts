import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BookMyStudio — Production Spaces & Crew',
    short_name: 'BookMyStudio',
    description: 'The architectural production marketplace for verified cycloramas, soundstages, filming locations, and crew.',
    start_url: '/',
    display: 'standalone',
    background_color: '#101010',
    theme_color: '#101010',
    icons: [
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/images/bookmystudio-favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

