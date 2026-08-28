export const OG_IMAGE_SIZE = { width: 1200, height: 630 }

export function ogLayout ({ title, subtitle }) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        padding: '80px',
        textAlign: 'center'
      }}
    >
      <div style={{ display: 'flex', fontSize: 28, opacity: 0.7, marginBottom: 24 }}>
        Open App Note
      </div>
      <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ display: 'flex', fontSize: 32, marginTop: 24, opacity: 0.85 }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}
