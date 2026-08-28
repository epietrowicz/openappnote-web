import { cache } from 'react'
import { unstable_cache as unstableCache } from 'next/cache'
import { octokit } from './gh'

export const getGithubUser = cache(unstableCache(
  async (owner) => {
    const { data } = await octokit.users.getByUsername({ username: owner })
    return data
  },
  ['github-user'],
  { revalidate: 86400, tags: ['github-user'] }
))
