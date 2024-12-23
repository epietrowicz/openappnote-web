'use client'

import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

function BoardView ({ topUrl, bottomUrl }) {
  const [layer, setLayer] = useState('TOP')

  return (
    <div className='relative h-full w-full bg-base-200 rounded-sm overflow-hidden border border-base-300'>
      <div className='absolute left-0 flex flex-col items-start space-y-1 z-10 p-2 bg-white'>

        <button
          className='flex items-center justify-center space-x-2'
          onClick={() => setLayer('TOP')}
        >
          <span>
            {layer !== 'TOP'
              ? (<EyeOff className='h-5 w-5' />)
              : (<Eye className='h-5 w-5' />)}
          </span>
          <span className='ml-2'>
            Top
          </span>
        </button>

        <button
          className='flex items-center justify-center space-x-2'
          onClick={() => setLayer('BOTTOM')}
        >
          <span>
            {layer !== 'BOTTOM'
              ? (<EyeOff className='h-5 w-5' />)
              : (<Eye className='h-5 w-5' />)}
          </span>
          <span className='ml-2'>
            Bottom
          </span>
        </button>
      </div>
      <TransformWrapper
        initialScale={1}
        minScale={1}
        initialPositionX={0}
        initialPositionY={0}
        centerOnInit
        smooth={false}
        maxScale={10}
        wheel={{ step: 0.05 }}
        velocityAnimation={{
          disabled: true
        }}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100%'
          }}
        >
          <div className='relative h-[1000px] w-[1000px]'>
            <Image
              alt='Top PCB view'
              height={500}
              width={500}
              unoptimized
              className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
              src={layer === 'TOP' ? topUrl : bottomUrl}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}

export default BoardView
