import { ImageResponse } from 'next/og'
import { OG_IMAGE_SIZE, ogLayout } from '@/lib/og-image'
import { getGithubUser } from '@/lib/github-user'

export const size = OG_IMAGE_SIZE
export const contentType = 'image/png'
export const revalidate = 86400

export default async function Image ({ params }) {
  const { owner } = await params

  let user = null
  try {
    user = await getGithubUser(owner)
  } catch {
    user = null
  }

  return new ImageResponse(
    ogLayout({
      title: user?.name ?? owner,
      subtitle: user?.name ? `@${owner}` : 'KiCad reference designs on GitHub'
    }),
    { ...size }
  )
}
