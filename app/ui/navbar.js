'use client'

import Link from 'next/link'
import React from 'react'
import Search from './search'
import { usePathname, useSearchParams } from 'next/navigation'

function Navbar () {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pageNumber = searchParams?.get('page') == null
    ? 1
    : parseInt(searchParams.get('page'))

  return (
    <div className='navbar bg-base-100 space-x-2'>
      <Link
        href='/'
        className='btn btn-ghost text-xl'
      >
        Open App Note
      </Link>
      {(pathname !== '/' || pageNumber > 1) && (
        <Search />
      )}
      <div className='flex justify-end flex-1'>
        <Link href='/submit' className='btn btn-primary btn-outline'>
          Submit Design
        </Link>
      </div>
    </div>
  )
}

export default Navbar
