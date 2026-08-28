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
  async redirects () {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'openappnote.dev' }],
        destination: 'https://openappnote.com/:path*',
        permanent: true
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.openappnote.com' }],
        destination: 'https://openappnote.com/:path*',
        permanent: true
      }
    ]
  }
}

export default nextConfig
