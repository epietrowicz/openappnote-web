import { ImageResponse } from 'next/og'
import { OG_IMAGE_SIZE, ogLayout } from '@/lib/og-image'

export const size = OG_IMAGE_SIZE
export const contentType = 'image/png'

export default async function Image () {
  return new ImageResponse(
    ogLayout({ title: 'Open App Note', subtitle: 'Open source electronics reference designs' }),
    { ...size }
  )
}
