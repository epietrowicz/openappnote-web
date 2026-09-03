'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

const REASONS = [
  { value: 'broken', label: 'Broken' },
  { value: 'failed', label: 'Failed to build' }
]

export default function DesignFlagButton ({ owner, repo, projectPath }) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)

  async function submitFlag (reason) {
    if (submitting || submitted) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/designs/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, projectPath, reason })
      })
      if (!res.ok) throw new Error('request failed')
      setSubmitted(reason)
      toast.success('Thanks — this design has been flagged for review')
    } catch {
      toast.error('Could not submit report, please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    const label = REASONS.find(r => r.value === submitted)?.label.toLowerCase()
    return <p className='text-sm opacity-60'>Reported as {label}. Thanks for the heads up.</p>
  }

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm opacity-60'>Something wrong with this design?</span>
      {REASONS.map(({ value, label }) => (
        <button
          key={value}
          type='button'
          disabled={submitting}
          onClick={() => submitFlag(value)}
          className='btn btn-outline btn-sm'
        >
          Report {label}
        </button>
      ))}
    </div>
  )
}
