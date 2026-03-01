import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'İş Takip Sistemi',
    short_name: 'İş Takip',
    description: 'Firma, proje, muhasebe ve personel takip sistemi',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ecf0f5',
    theme_color: '#3c8dbc',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
