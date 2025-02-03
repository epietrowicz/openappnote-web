import './globals.css'
import Navbar from './ui/navbar'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Open App Note',
  description: 'Open source electronics reference designs'
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
          <aside>
            <p>Open App Note</p>
          </aside>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
