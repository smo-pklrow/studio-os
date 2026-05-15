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
        <div key={tile.label} className="card p-4">
          <p className="text-dark-muted text-xs mb-2">{tile.label}</p>
          <p className={`text-3xl font-medium tabular-nums ${tile.alert ? 'text-red-400' : 'text-dark-text'}`}>
            {tile.value}
          </p>
        </div>
      ))}
    </div>
  )
}
