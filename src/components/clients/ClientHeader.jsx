import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../shared/Toast'

const HEALTH = {
  on_track:        { label: 'On track',        badge: 'badge-green' },
  needs_attention: { label: 'Needs attention',  badge: 'badge-amber' },
  blocked:         { label: 'Blocked',          badge: 'badge-red'   },
  nearly_done:     { label: 'Nearly done',      badge: 'badge-blue'  },
}

const HEALTH_ORDER = ['on_track', 'needs_attention', 'blocked', 'nearly_done']

function formatDate(str) {
  if (!str) return null
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ClientHeader({ client, stats, onHealthChange }) {
  const navigate = useNavigate()
  const toast    = useToast()
  const [healthOpen, setHealthOpen] = useState(false)
  const healthRef = useRef(null)

  useEffect(() => {
    if (!healthOpen) return
    function handle(e) {
      if (healthRef.current && !healthRef.current.contains(e.target)) setHealthOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [healthOpen])

  if (!client) return (
    <div className="border-b px-6 py-5" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="max-w-5xl mx-auto h-14 animate-pulse rounded-lg bg-dark-elevated" />
    </div>
  )

  const health      = HEALTH[client.health] ?? HEALTH.on_track
  const percent     = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const accentColor = client.color || '#1D9E75'

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/portal/${client.share_token}`)
    toast('Client link copied!', 'success')
  }

  return (
    <header className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="max-w-5xl mx-auto px-6 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 mb-4 text-xs text-dark-muted">
          <button
            className="hover:text-dark-text transition-colors"
            onClick={() => navigate('/')}
          >
            All clients
          </button>
          <span className="text-dark-subtle">›</span>
          <span className="text-dark-text">{client.name}</span>
        </nav>

        {/* Main header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">

            {/* Logo / avatar */}
            {client.logo_url ? (
              <img
                src={client.logo_url}
                alt=""
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-dark-border"
                style={{ viewTransitionName: `client-avatar-${client.id}` }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-semibold shrink-0 select-none"
                style={{
                  backgroundColor: accentColor + '28',
                  color: accentColor,
                  viewTransitionName: `client-avatar-${client.id}`,
                }}
              >
                {client.name?.[0]?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h1
                className="leading-none truncate"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--font-size-display-sm)',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-text)',
                }}
              >
                {client.name}
              </h1>
              {client.project_name && (
                <p className="text-sm mt-1 truncate" style={{ color: 'var(--color-muted)' }}>
                  {client.project_name}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">

                {/* Health badge — clickable dropdown */}
                <div className="relative" ref={healthRef}>
                  <button
                    className={`badge ${health.badge} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => setHealthOpen(v => !v)}
                  >
                    {health.label}{stats.total > 0 && ` · ${percent}%`}
                  </button>

                  {healthOpen && (
                    <div className="absolute left-0 top-7 card card-elevated z-10 min-w-[168px] py-1">
                      {HEALTH_ORDER.map(key => {
                        const h = HEALTH[key]
                        return (
                          <button
                            key={key}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-dark-elevated transition-colors flex items-center gap-2"
                            onClick={() => {
                              setHealthOpen(false)
                              if (key !== client.health) onHealthChange?.(key)
                            }}
                          >
                            <span className={`badge ${h.badge}`}>{h.label}</span>
                            {key === client.health && <span className="text-dark-subtle ml-auto">✓</span>}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {client.start_date && (
                  <span className="text-dark-muted text-xs">Started {formatDate(client.start_date)}</span>
                )}
                {client.due_date && (
                  <span className="text-dark-muted text-xs">Due {formatDate(client.due_date)}</span>
                )}
              </div>

              {/* Stats row */}
              {stats.total > 0 && (
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>
                    <span style={{ color: 'var(--color-muted)' }}>{stats.done}</span>/{stats.total} tasks
                  </span>
                  {stats.dueToday > 0 && (
                    <span className="text-xs text-amber-400">
                      {stats.dueToday} due today
                    </span>
                  )}
                  {stats.overdue > 0 && (
                    <span className="text-xs text-red-400">
                      {stats.overdue} overdue
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>
                    Buffer: <span style={{ color: 'var(--color-muted)' }}>—</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <button className="btn shrink-0" onClick={copyLink}>
            <i className="ti ti-share" style={{ fontSize: 'var(--icon-md)' }} />
            Client link
          </button>
        </div>
      </div>
    </header>
  )
}
