'use client'

import Link from 'next/link'
import React from 'react'
import Search from './search'
import { usePathname } from 'next/navigation'

function Navbar () {
  const pathname = usePathname()

  return (
    <div className='navbar bg-base-100 space-x-2'>
      <Link
        href='/'
        className='btn btn-ghost text-xl'
      >
        Open App Note
      </Link>
      {pathname !== '/' && (
        <Search />
      )}
    </div>
  )
}

export default Navbar
