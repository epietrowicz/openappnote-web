import { supabaseService } from '@/lib/db'
import { octokit } from '@/lib/gh'
import { resend } from '@/lib/resend'
import { NextResponse } from 'next/server'

async function getAllFilesInRepo (owner, repo) {
  const { data: repoData } = await octokit.repos.get({
    owner,
    repo
  })
  const defaultBranch = repoData.default_branch

  // Get the latest commit on the default branch
  const { data: branchData } = await octokit.repos.getBranch({
    owner,
    repo,
    branch: defaultBranch
  })
  const treeSha = branchData.commit.commit.tree.sha

  // Fetch the tree with recursive=1 to list all files
  const { data: treeData } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: 1
  })

  // Count the number of files (treeData.tree contains all entries)
  const files = treeData.tree.filter(item => item.type === 'blob')
  return files.filter(f => f.path.endsWith('kicad_sch') || f.path.endsWith('kicad_pcb') || f.path.endsWith('kicad_pro'))
}

async function checkIfRepoExists (owner, repo) {
  const { data, error } = await supabaseService
    .from('repository')
    .select('id', { count: 'exact' })
    .eq('full_name', `${owner}/${repo}`)

  if (error) {
    throw new Error('Error checking repository existence')
  }
  return data.length > 0
}

async function addToDatabase (owner, repo, requester) {
  const result = (await octokit.rest.repos.get({
    owner,
    repo
  })).data

  const { data, error } = await supabaseService
    .from('repository')
    .insert({
      name: result.name,
      full_name: result.full_name,
      owner_login: result.owner.login,
      html_url: result.html_url,
      description: result.description,
      stars: result.stargazers_count,
      avatar_url: result.owner.avatar_url,
      requester
    })
    .select('*')
    .single()

  if (error) {
    throw new Error('Error adding repository to database')
  }
  return data
}

export async function POST (req) {
  try {
    const data = await req.json() // Parse incoming JSON
    const { url, email } = data
    const owner = url.split('/')[3]
    const repo = url.split('/')[4]
    const files = await getAllFilesInRepo(owner, repo)

    if (files.length === 0) {
      return NextResponse.json({ message: 'Only KiCad supported for now...' }, { status: 500 })
    }

    const existingRepo = await checkIfRepoExists(owner, repo)
    if (existingRepo) {
      return NextResponse.json({ message: 'Repository already indexed', result: 'WARNING' })
    }

    const newRepo = await addToDatabase(owner, repo, email)
    const { error } = await resend.emails.send({
      from: 'mail@ubiqueiot.com',
      to: 'pietrowicz.eric@gmail.com',
      subject: 'New design submission!',
      html: `<p>Repository: ${owner} ${repo}</p><p>From Email: ${email ?? ''}</p><p>URL: ${newRepo?.html_url ?? ''}</p><p>Repo ID: ${newRepo?.id ?? ''}</p>`
    })

    if (error) {
      return NextResponse.json({ message: 'Error sending email' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Design submitted!', result: 'SUCCESS' })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
