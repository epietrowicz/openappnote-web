'use client'

import Link from 'next/link'
import React from 'react'
import Search from './search'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLDClient, useFlags } from 'launchdarkly-react-client-sdk'

function Navbar () {
  const ldClient = useLDClient()
  const context = ldClient.getContext()
  const llmChat = useFlags().llmChat

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pageNumber = searchParams?.get('page') == null
    ? 1
    : parseInt(searchParams.get('page'))

  const handleUpgrade = () => {
    ldClient.identify({ kind: 'user', key: 'eric-test-user', user_tier: 'paid' })
  }

  const handleDowngrade = () => {
    ldClient.identify({ kind: 'user', key: 'eric-test-user', user_tier: 'free' })
  }

  const isPro = context.user_tier === 'paid'

  const getUpdateButton = () => {
    if (!llmChat) {
      return <></>
    }
    if (isPro) {
      return (
        <button className='btn btn-primary' onClick={handleDowngrade}>
          Downgrade to Free
        </button>
      )
    }
    return (
      <button className='btn btn-primary' onClick={handleUpgrade}>
        Upgrade to Pro!
      </button>
    )
  }

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
      <div className='flex justify-end flex-1 gap-2'>
        <Link href='/submit' className='btn btn-primary btn-outline'>
          Submit Design
        </Link>
        {getUpdateButton()}
      </div>
    </div>
  )
}

export default Navbar
