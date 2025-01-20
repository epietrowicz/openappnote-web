function BoardView ({ iBomUrl }) {
  return (
    <iframe
      src={iBomUrl}
      width='100%'
      height='100%'
      style={{ border: 'none' }}
    />
  )
}

export default BoardView
