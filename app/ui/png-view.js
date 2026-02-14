'use client'

import React, { useState } from 'react'

const PngView = ({ topPngUrl, bottomPngUrl }) => {
  const [topView, setTopView] = useState(true)
  return (
    <div className='tabs tabs-lift'>
      <input
        type='radio'
        name='pcb_view_tabs'
        className='tab'
        aria-label='Top'
        checked={topView}
        onChange={() => setTopView(true)}
      />
      <div className='tab-content bg-base-100 border-base-300 p-6'>
        <img src={topPngUrl} alt='Top PCB' />
      </div>
      <input
        type='radio'
        name='pcb_view_tabs'
        className='tab'
        aria-label='Bottom'
        checked={!topView}
        onChange={() => setTopView(false)}
      />
      <div className='tab-content bg-base-100 border-base-300 p-6'>
        <img src={bottomPngUrl} alt='Bottom PCB' />
      </div>
    </div>
  )
}

export default PngView
