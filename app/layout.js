import './globals.css'
import Navbar from './ui/navbar'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'react-hot-toast'
import ClientAsyncLDProvider from '@/components/clientAsyncLDProvider'

export const metadata = {
  title: 'Open App Note',
  description: 'Open source electronics reference designs'
}

export default function RootLayout ({ children }) {
  return (
    <html lang='en' data-theme='lofi'>
      <body className='flex flex-col min-h-screen'>
        <ClientAsyncLDProvider clientSideID={process.env.LAUNCHDARKLY_CLIENT_SIDE_ID}>
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
        </ClientAsyncLDProvider>
      </body>
    </html>
  )
}
