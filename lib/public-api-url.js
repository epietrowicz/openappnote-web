function isProduction () {
  return process.env.NODE_ENV === 'production'
}

export function getPublicApiUrl () {
  if (isProduction()) {
    return process.env.NEXT_PUBLIC_DEPLOYED_API_URL
  }

  return process.env.NEXT_PUBLIC_LOCAL_API_URL
}
