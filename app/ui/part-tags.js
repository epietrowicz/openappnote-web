import Link from 'next/link'

export default function PartTags ({ parts }) {
  return (
    <>
      {parts.map(part => (
        <Link
          href={`/tags/1/${part.partNumber}`}
          key={part.referenceDesignator}
          className='badge badge-soft badge-primary badge-sm flex-none mt-2'
        >
          <h4 className='flex-none'>{part.partNumber}</h4>
        </Link>
      ))}
    </>
  )
}
