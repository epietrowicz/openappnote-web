'use client'

import { useEffect, useState } from 'react'
import { asyncWithLDProvider, basicLogger } from 'launchdarkly-react-client-sdk'

const defaultContext = {
  kind: 'user',
  key: 'ericp',
  user_tier: 'free',
  years_of_experience: 1
}

const createLDConfig = (clientSideID, context = defaultContext) => ({
  clientSideID,
  context,
  timeout: 5,
  options: {
    logger: basicLogger({
      destination: (line) => console.log(line),
      level: 'debug'
    })
  },
  reactOptions: {
    useCamelCaseFlagKeys: true
  }
})

export default function AsyncLDProvider ({
  children,
  clientSideID
}) {
  const [LDProvider, setLDProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!clientSideID) {
      setError(new Error('clientSideID is required'))
      setLoading(false)
      return
    }

    let mounted = true

    const initializeLDProvider = async () => {
      try {
        const config = createLDConfig(clientSideID)
        const provider = await asyncWithLDProvider(config)

        if (mounted) {
          setLDProvider(() => provider)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err)
          setLoading(false)
        }
      }
    }

    initializeLDProvider()

    return () => {
      mounted = false
    }
  }, [clientSideID])

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (loading || !LDProvider) {
    return <div>Loading LaunchDarkly...</div>
  }

  return <LDProvider>{children}</LDProvider>
}
