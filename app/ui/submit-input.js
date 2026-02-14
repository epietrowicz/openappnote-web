'use client'

import { LinkIcon, MailIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SubmitInput () {
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isValidGitHubURL = () => {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.hostname === 'github.com' || parsedUrl.hostname.endsWith('.github.com')
    } catch (e) {
      return false // Invalid URL format
    }
  }

  const isValidEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidGitHubURL()) {
      toast.error('Please provide a valid GitHub URL')
      return
    }
    if (email !== '' && !isValidEmail()) {
      toast.error('Please provide a valid email')
      return
    }
    setIsLoading(true)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email })
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || 'Something went wrong')
        return
      }
      if (data.result === 'WARNING') {
        toast(data.message)
        return
      }
      if (data.result === 'SUCCESS') {
        toast.success(data.message)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='max-w-3xl flex flex-col items-center justify-center text-center p-4'>
      <h1 className='text-3xl font-bold'>Submit a new design</h1>
      <p className='mt-2'>Provide the GitHub repository URL of your design to queue it for indexing. Optionally, provide an email to receive a notification when the indexing completes.</p>
      <form
        onSubmit={handleSubmit}
        className='flex items-center justify-center space-x-2 mt-4 max-w-xl w-full'
      >
        <label className='input input-bordered flex items-center gap-2 w-full'>
          <LinkIcon className='h-5 w-5 opacity-50' />
          <input
            type='text'
            className='grow'
            placeholder='Repository URL'
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />
        </label>
        <label className='input input-bordered flex items-center gap-2 w-full'>
          <MailIcon className='h-5 w-5 opacity-50' />
          <input
            type='email'
            className='grow'
            placeholder='Email (optional)'
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>
        <button
          type='submit'
          className='btn btn-primary'
        >
          {isLoading && (<span className='loading loading-spinner' />)}
          Submit
        </button>
      </form>
    </div>
  )
}
