import { ImageResponse } from 'next/og'
import { OG_IMAGE_SIZE, ogLayout } from '@/lib/og-image'
import { getRepository } from '@/lib/github-repository'

export const size = OG_IMAGE_SIZE
export const contentType = 'image/png'

export default async function Image ({ params }) {
  const { owner, repo } = await params

  let repository = null
  try {
    repository = await getRepository(owner, repo)
  } catch {
    repository = null
  }

  const title = repository?.name ?? repo
  const stars = repository?.stargazers_count ?? 0

  return new ImageResponse(
    ogLayout({
      title,
      subtitle: `by ${owner} · ${stars} stars`
    }),
    { ...size }
  )
}
