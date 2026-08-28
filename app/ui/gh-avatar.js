import { UserCircleIcon } from 'lucide-react'
import Image from 'next/image'

export function GhAvatar ({ avatarUrl, alt = 'Github avatar', height = 25, width = 25 }) {
  return (
    <>
      {avatarUrl == null
        ? (<UserCircleIcon style={{ height, width }} />)
        : (<Image
            unoptimized
            className='rounded-full'
            alt={alt}
            src={avatarUrl}
            width={width}
            height={height}
           />)}
    </>
  )
}
