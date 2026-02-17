import * as LaunchDarkly from '@launchdarkly/node-server-sdk'

let ldNodeClient

export async function initLdClient () {
  const client = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY)
  await client.waitForInitialization({ timeout: 10 })
  return client
}

export async function getLdClient () {
  if (ldNodeClient) {
    return ldNodeClient
  }
  ldNodeClient = await initLdClient()
  return ldNodeClient
}
