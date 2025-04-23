import { NextResponse } from 'next/server'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openappnote-bucket.nyc3.digitaloceanspaces.com'
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      }
    ]
  },
  metadataBase: new URL('https://openappnote.dev')
}

export default nextConfig
