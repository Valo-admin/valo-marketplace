import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tktuizwktwqvvkcoxfsx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/listing-images/**',
      },
    ],
  },
}

export default nextConfig