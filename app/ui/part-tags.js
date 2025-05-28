import Link from 'next/link'

export default async function ({ parts }) {
  return (
    <div className='flex items-center space-x-2'>
      {parts.map(part => (
        <Link
          href={`/tags/1/${part.part_number}`}
          key={part.id}
          className='badge badge-soft badge-primary badge-sm'
        >
          <h4>{part.part_number}</h4>
        </Link>
      ))}
    </div>
  )
}
