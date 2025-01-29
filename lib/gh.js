import { Octokit } from '@octokit/rest'

export const octokit = new Octokit({ auth: process.env.GH_ACCESS_TOKEN })

export async function getRepositoryInfo (design) {
  const owner = design.full_path.split('/')[0]
  const repo = design.full_path.split('/')[1]
  try {
    const result = await octokit.rest.repos.get({
      owner,
      repo
    })
    return {
      ...design,
      stars: result.data.stargazers_count,
      avatar_url: result.data.owner.avatar_url
    }
  } catch (e) {
    return {
      ...design,
      stars: 0,
      avatar_url: ''
    }
  }
}
