'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DesignEntryLink ({ href, className = '', ariaLabel }) {
  const [isNavigating, setIsNavigating] = useState(false)

  return (
    <>
      <Link
        href={href}
        aria-label={ariaLabel}
        className={`absolute inset-0 z-0 ${className}${isNavigating ? ' pointer-events-none' : ''}`}
        onClick={() => setIsNavigating(true)}
      />
      {isNavigating && (
        <div className='absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-base-100/60'>
          <span className='loading loading-spinner loading-lg' />
        </div>
      )}
    </>
  )
}
