export default function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => {
    const size = 3 + Math.random() * 5
    const colors = ['#f7c948', '#4ecdc4', '#ff6b6b', '#a78bfa', '#34d399', '#f472b6']
    const color = colors[i % colors.length]
    const left = Math.random() * 100
    const delay = Math.random() * 12
    const duration = 10 + Math.random() * 14

    return (
      <div
        key={i}
        className="particle"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    )
  })

  return <div className="particles">{particles}</div>
}
