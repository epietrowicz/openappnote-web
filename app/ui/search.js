'use client'

import { Search as SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function Search () {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.replace(' ', '') !== '') {
      router.push(`/tags/${query}`)
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      className='flex items-center justify-center space-x-2'
    >
      <label className='input input-bordered flex items-center gap-2 w-full'>
        <SearchIcon className='h-5 w-5 opacity-50' />
        <input
          type='text'
          className='grow'
          placeholder='Search'
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </label>
      <button
        type='submit'
        className='btn btn-primary'
      >
        Search
      </button>
    </form>
  )
}

export default Search
