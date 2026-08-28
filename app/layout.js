import './globals.css'
import Link from 'next/link'
import Navbar from './ui/navbar'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'react-hot-toast'
import { SITE_URL } from '@/lib/site-url'
import { CURATED_TAGS } from '@/lib/tags'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Open App Note',
    template: '%s | Open App Note'
  },
  description: 'Open source electronics reference designs',
  openGraph: {
    siteName: 'Open App Note',
    type: 'website',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image'
  }
}

export default function RootLayout ({ children }) {
  return (
    <html lang='en' data-theme='lofi'>
      <body className='flex flex-col min-h-screen'>
        <Toaster />
        <Suspense>
          <Navbar />
        </Suspense>
        <div className='max-w-7xl flex flex-col flex-1 mx-auto w-full'>
          {children}
        </div>
        <footer className='footer footer-center py-4'>
          <aside className='flex flex-col items-center gap-2'>
            <p>Open App Note</p>
            <nav className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm'>
              <Link href='/tags' className='link link-hover'>Browse tags</Link>
              {CURATED_TAGS.slice(0, 5).map(tag => (
                <Link key={tag} href={`/tags/1/${tag}`} className='link link-hover'>
                  {tag.replace(/-/g, ' ')}
                </Link>
              ))}
            </nav>
          </aside>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
