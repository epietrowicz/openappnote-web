import { cache } from 'react'
import { unstable_cache as unstableCache } from 'next/cache'
import { octokit } from './gh'

export const getRepository = cache(unstableCache(
  async (owner, repo) => {
    const { data } = await octokit.rest.repos.get({ owner, repo })
    return data
  },
  ['github-repository'],
  { revalidate: 86400, tags: ['github-repository'] }
))
