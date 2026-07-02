import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AppDiversa',
    short_name: 'AppDiversa',
    description: 'Motor de formularios parametrizables',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F0F0',
    theme_color: '#3B2484',
    lang: 'es',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
