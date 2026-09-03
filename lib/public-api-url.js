function isProduction () {
  return (process.env.NODE_ENV === 'production' || process.env.API_ENDPOINT === 'production')
}

export function getPublicApiUrl () {
  if (isProduction()) {
    console.log('🚀 Running against production URLs for Meilisearch & API')
    return process.env.NEXT_PUBLIC_DEPLOYED_API_URL
  }

  return process.env.NEXT_PUBLIC_LOCAL_API_URL
}
