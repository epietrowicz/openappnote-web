import Link from 'next/link'
import React from 'react'

export default async function ({ params }) {
  const tag = (await params).tag
  const test = [
    { id: 1, name: 'esp32-bitcoin-miner' },
    { id: 2, name: 'raspberry-pi-web-server' },
    { id: 3, name: 'arduino-weather-station' },
    { id: 4, name: 'nrf52840-bluetooth-tracker' },
    { id: 5, name: 'stm32-motor-controller' },
    { id: 6, name: 'teensy-audio-synth' },
    { id: 7, name: 'esp8266-smart-light' },
    { id: 8, name: 'microbit-robot-car' },
    { id: 9, name: 'atmega328p-solar-charger' },
    { id: 10, name: 'beaglebone-iot-gateway' }
  ]

  return (
    <>
      <div className='mx-auto text-center mt-6 max-w-lg'>
        <h1 className='text-4xl font-bold'>{tag}</h1>
        <h2>{tag} schematic and board layout references</h2>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mx-auto px-16 mt-4'>
        {test.map(v => (
          <DesignEntry key={v.id} entry={v} />
        ))}
      </div>
    </>
  )
}

function DesignEntry ({ entry }) {
  return (
    <Link
      href={`/designs/${entry.id}-${entry.name}`}
    >
      <div className='h-56 w-full bg-base-300 hover:bg-base-300/50 rounded-sm ' />
    </Link>
  )
}
