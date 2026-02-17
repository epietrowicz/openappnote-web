'use client'

import dynamic from 'next/dynamic'

const LDAsyncProvider = dynamic(
  () => import('./asyncWithLDProvider'),
  {
    ssr: false,
    loading: () => <></>
  }
)

export default function ClientAsyncLDProvider ({ children, clientSideID }) {
  return (
    <LDAsyncProvider clientSideID={clientSideID}>
      {children}
    </LDAsyncProvider>
  )
}
