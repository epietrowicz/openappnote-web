import { isRefToInclude } from '@/lib/util'
import { SearchIcon } from 'lucide-react'
import Link from 'next/link'

export default function BomView ({ data }) {
  const sorted = [...data].sort((a, b) => {
    const aLinkable = isRefToInclude(a?.Reference)
    const bLinkable = isRefToInclude(b?.Reference)
    if (aLinkable === bLinkable) return 0
    return aLinkable ? -1 : 1
  })

  return (
    <div className='rounded-box border border-base-300 overflow-hidden'>
      <table className='table table-xs table-pin-rows table-pin-cols'>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Value</th>
            <td>Description</td>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const linkable = isRefToInclude(r?.Reference)
            if (linkable) {
              return (
                <tr key={i}>
                  <th> {r?.Reference}</th>
                  <td className='link flex items-center justify-start'>
                    <SearchIcon className='w-2 h-2 mr-1' />
                    <Link href={`/tags/1/${r?.Value}`} target='_blank' rel='noopener noreferrer'>{r?.Value}</Link>
                  </td>
                  <td>{r?.Description}</td>
                </tr>
              )
            }
            return (
              (
                <tr key={i}>
                  <th>{r?.Reference}</th>
                  <td>{r?.Value}</td>
                  <td>{r?.Description}</td>
                </tr>
              )
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
