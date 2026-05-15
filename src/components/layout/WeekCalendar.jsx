const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function getWeekDays() {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function isSameDay(a, b) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

function fmt(date, opts) {
  return date.toLocaleDateString('en-US', opts)
}

export default function WeekCalendar() {
  const today = new Date()
  const days = getWeekDays()
  const rangeLabel = `${fmt(days[0], { month: 'short', day: 'numeric' })} – ${fmt(days[4], { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-dark-text text-sm font-medium">This week</h2>
        <span className="text-dark-subtle text-xs">{rangeLabel}</span>
      </div>

      <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
      <div className="grid grid-cols-5 gap-3" style={{ minWidth: '420px' }}>
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          return (
            <div
              key={i}
              className={`card p-4 flex flex-col gap-3 ${isToday ? 'border-brand-green' : ''}`}
            >
              <div>
                <p className={`text-xs font-medium ${isToday ? 'text-brand-green' : 'text-dark-muted'}`}>
                  {DAY_LABELS[i]}
                </p>
                <p className="text-dark-text text-2xl font-medium mt-0.5 tabular-nums">
                  {day.getDate()}
                </p>
              </div>
              <p className="text-dark-subtle text-xs">No events</p>
            </div>
          )
        })}
      </div>
      </div>
    </section>
  )
}
