import { UserCircleIcon } from 'lucide-react'
import Image from 'next/image'

export function GhAvatar ({ design, height = 20, width = 20 }) {
  return (
    <>
      {design?.repository?.avatar_url == null
        ? (<UserCircleIcon style={{ height, width }} />)
        : (<Image
            className='rounded-full'
            alt={`Avatar for ${design.owner}`}
            src={design.repository.avatar_url}
            width={width}
            height={height}
           />)}
    </>
  )
}
