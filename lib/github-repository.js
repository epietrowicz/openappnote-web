import { octokit } from './gh'

export async function getRepository (owner, repo) {
  const { data } = await octokit.rest.repos.get({ owner, repo })
  return data
}
