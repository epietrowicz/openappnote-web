import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ({ pageNumber, nextPageNumber, prevPageNumber }) {
  return (
    <div className='flex items-center justify-center mt-12'>
      {pageNumber === prevPageNumber
        ? (
          <div className='btn btn-link' disabled>
            <ArrowLeft className='h-5 w-5' />
            Back
          </div>)
        : (
          <Link className='btn btn-link' href={`/?page=${prevPageNumber}`}>
            <ArrowLeft className='h-5 w-5' />
            Back
          </Link>)}
      <span>
        {pageNumber}
      </span>
      {pageNumber === nextPageNumber
        ? (
          <div className='btn btn-link' disabled>
            Next
            <ArrowRight className='h-5 w-5' />
          </div>)
        : (
          <Link className='btn btn-link' href={`/?page=${nextPageNumber}`}>
            Next
            <ArrowRight className='h-5 w-5' />
          </Link>)}
    </div>
  )
}
