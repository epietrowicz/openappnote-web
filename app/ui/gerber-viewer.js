'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

function GerberViewer ({ svgs }) {
  const [layers, setLayers] = useState(svgs)

  const svgColors = [
    'text-red-500/60',
    'text-green-500/60',
    'text-purple-500/60',
    'text-yellow-500/60',
    'text-blue-500/60',
    'text-orange-500/60',
    'text-teal-500/60',
    'text-pink-500/60',
    'text-gray-500/60'
  ]

  const refColors = [
    'bg-red-500/60',
    'bg-green-500/60',
    'bg-purple-500/60',
    'bg-yellow-500/60',
    'bg-blue-500/60',
    'bg-orange-500/60',
    'bg-teal-500/60',
    'bg-pink-500/60',
    'bg-gray-500/60'
  ]

  const toggleHideLayer = (layerName) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.name === layerName
          ? { ...layer, hidden: !layer.hidden }
          : layer
      )
    )
  }

  return (
    <div className='relative h-full w-full bg-base-200 rounded-sm overflow-hidden'>
      <div className='absolute left-0 flex flex-col space-y-1 z-10 rounded-sm p-2'>
        {layers.map((l, i) => {
          const tmp = l.name.replaceAll('.', ' ').replace('svg', '')
          const vals = tmp.split(' ')
          const layerTitle = `${vals[vals.length - 3]} ${vals[vals.length - 2]}`
          return (
            <div key={l.name}>
              <button
                className='flex items-center justify-center space-x-2'
                onClick={() => toggleHideLayer(l.name)}
              >
                <span>
                  {l.hidden
                    ? (<EyeOff className='h-5 w-5' />)
                    : (<Eye className='h-5 w-5' />)}
                </span>
                <div className={`h-4 w-4 ${refColors[i % refColors.length]}`} />
                <span className='ml-2'>
                  {layerTitle}
                </span>
              </button>

            </div>
          )
        })}
      </div>
      <TransformWrapper
        initialScale={3}
        initialPositionX={0}
        initialPositionY={0}
        centerOnInit
        smooth={false}
        maxScale={20}
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
          <div className='relative h-[500px] w-[500px] flex items-center justify-center' />
          {layers.map((layer, index) => {
            const coloredSvg = layer.content.replace(
              /<svg([^>]*)>/,
                `<svg$1 class="fill-current ${svgColors[index % svgColors.length]}">`
            )
            return (
              <div
                key={layer.name}
                className={`border border-black
                  absolute ${layer.hidden && 'hidden'}
                  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[${index}]
                `}
                dangerouslySetInnerHTML={{ __html: coloredSvg }}
              />
            )
          })}
          {/* </div> */}
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}

export default GerberViewer
