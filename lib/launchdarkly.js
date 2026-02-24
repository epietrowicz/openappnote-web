import { init } from '@launchdarkly/node-server-sdk'
import { initAi } from '@launchdarkly/server-sdk-ai'

const ldClient = init(process.env.LAUNCHDARKLY_SDK_KEY)
const aiClient = initAi(ldClient)

let initialized = false
export async function getLdAiClient () {
  if (!initialized) {
    await ldClient.waitForInitialization({ timeout: 10 })
    initialized = true
  }
  return { ldClient, aiClient }
}
