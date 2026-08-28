import { Octokit } from '@octokit/rest'
import { throttling } from '@octokit/plugin-throttling'
import { retry } from '@octokit/plugin-retry'

const ResilientOctokit = Octokit.plugin(throttling, retry)

export const octokit = new ResilientOctokit({
  auth: process.env.GH_ACCESS_TOKEN,
  throttle: {
    onRateLimit: (retryAfter, options, octokitInstance, retryCount) => {
      octokitInstance.log.warn(`Rate limit hit for ${options.method} ${options.url}`)
      if (retryCount < 2) return true
      return false
    },
    onSecondaryRateLimit: (retryAfter, options, octokitInstance, retryCount) => {
      octokitInstance.log.warn(`Secondary rate limit hit for ${options.method} ${options.url}`)
      if (retryCount < 1) return true
      return false
    }
  }
})
