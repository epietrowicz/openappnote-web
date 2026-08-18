import { isRefToInclude } from '@/lib/util'
import { SearchIcon } from 'lucide-react'
import Link from 'next/link'

export default function BomView ({ data }) {
  return (
    <table className='table table-xs table-pin-rows table-pin-cols'>
      <thead>
        <tr>
          <th>Reference</th>
          <th>Value</th>
          <td>Quantity</td>
          <td>Footprint</td>
        </tr>
      </thead>
      <tbody>
        {data.map((r, i) => {
          const linkable = isRefToInclude(r?.Refs)
          if (linkable) {
            return (
              <tr key={i}>
                <th> {r?.Refs}</th>
                <td className='link flex items-center justify-start'>
                  <SearchIcon className='w-2 h-2 mr-1' />
                  <Link href={`/tags/1/${r?.Value}`}>{r?.Value}</Link>
                </td>
                <td>{r?.Qty}</td>
                <td>{r?.Footprint}</td>
              </tr>
            )
          }
          return (
            (
              <tr key={i}>
                <th>{r?.Refs}</th>
                <td>{r?.Value}</td>
                <td>{r?.Qty}</td>
                <td>{r?.Footprint}</td>
              </tr>
            )
          )
        })}
      </tbody>
    </table>
  )
}
