export function getPublicApiUrl () {
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    return process.env.NEXT_PUBLIC_DEPLOYED_API_URL
  }

  return process.env.NEXT_PUBLIC_LOCAL_API_URL
}
