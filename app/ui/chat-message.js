'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const ChatMessage = ({ message }) => {
  return (
    <div
      key={message.id}
      className={`chat ${message.role === 'user'
        ? 'chat-end'
        : 'chat-start'}`}
    >
      <div className='chat-bubble'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          // className='markdown-content'
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default ChatMessage
