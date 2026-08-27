'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DesignEntryLink ({ href, className, children }) {
  const [isNavigating, setIsNavigating] = useState(false)

  return (
    <Link
      href={href}
      className={`relative ${className}${isNavigating ? ' opacity-70 pointer-events-none' : ''}`}
      onClick={() => setIsNavigating(true)}
    >
      {children}
      {isNavigating && (
        <div className='absolute inset-0 flex items-center justify-center rounded-2xl bg-base-100/60'>
          <span className='loading loading-spinner loading-lg' />
        </div>
      )}
    </Link>
  )
}
