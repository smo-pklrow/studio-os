import { useState, useEffect } from 'react'

function useCountUp(target, duration = 650) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    let start = null
    let frame
    function tick(ts) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return count
}

function StatTile({ label, value, alert }) {
  const animated = useCountUp(value ?? 0)
  return (
    <div className="card p-4">
      <p className="text-dark-muted text-xs mb-2">{label}</p>
      <p className={`text-3xl font-medium tabular-nums ${alert ? 'text-red-400' : 'text-dark-text'}`}>
        {animated}
      </p>
    </div>
  )
}

export default function StatsBar({ stats }) {
  const tiles = [
    { label: 'Active clients', value: stats.activeClients, alert: false },
    { label: 'Open tasks',     value: stats.openTasks,     alert: false },
    { label: 'Overdue',        value: stats.overdue,       alert: stats.overdue > 0 },
    { label: 'Done this week', value: stats.doneThisWeek,  alert: false },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {tiles.map(tile => (
        <StatTile key={tile.label} {...tile} />
      ))}
    </div>
  )
}
