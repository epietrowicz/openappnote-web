import { ImageResponse } from 'next/og'
import { OG_IMAGE_SIZE, ogLayout } from '@/lib/og-image'
import { searchDesigns } from '@/lib/design-search'

export const size = OG_IMAGE_SIZE
export const contentType = 'image/png'

export default async function Image ({ params }) {
  const { tag } = await params
  const searchTitle = tag.replace(/-/g, ' ')

  let totalHits = 0
  try {
    ({ totalHits } = await searchDesigns(tag, 1))
  } catch {
    totalHits = 0
  }

  return new ImageResponse(
    ogLayout({
      title: searchTitle,
      subtitle: `${totalHits} reference designs`
    }),
    { ...size }
  )
}
