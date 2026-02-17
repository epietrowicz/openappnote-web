'use client'

import React, { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import ChatMessage from './chat-message'

const ChatModal = ({ pdfUrl }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  //   const textareaRef = useRef(null)

  //   useEffect(() => {
  //     const el = textareaRef.current
  //     if (!el) return
  //     el.style.height = 'auto'
  //     el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  //   }, [message])

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    const userMsg = { id: nanoid(), content: message, role: 'user' }
    setMessages(m => [...m, userMsg])
    setMessage('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: message, ...(pdfUrl && { pdfUrl }) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setMessages(m => [...m, { id: nanoid(), content: data.text, role: 'assistant' }])
    } catch (err) {
      setMessages(m => [...m, { id: nanoid(), content: err.message || 'Something went wrong.', role: 'assistant' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2'>
      {isOpen && (
        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-lg w-[400px] max-h-[500px] overflow-y-auto'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-lg font-semibold'>Chat</h2>
            <button
              onClick={() => setIsOpen(false)}
              className='text-gray-500 hover:text-gray-700'
              aria-label='Close chat'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
          <div className='flex flex-col gap-2'>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
          <form onSubmit={handleSendMessage} className='flex items-center gap-2 w-full mt-2'>
            <textarea
              placeholder='Message'
              rows={1}
              className='input input-bordered w-full resize-none py-2'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (message.trim()) handleSendMessage()
                }
              }}
            />
            <button
              className='btn btn-primary'
              type='submit'
              disabled={loading || !message.trim()}
            >
              {loading
                ? <span className='loading loading-dots loading-sm' />
                : 'Send'}
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='btn btn-primary btn-circle'
      >
        <MessageCircle className='h-5 w-5' />
      </button>
    </div>
  )
}

export default ChatModal
