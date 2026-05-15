import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const HEALTH = {
  on_track:        { label: 'On track',        badge: 'badge-green' },
  needs_attention: { label: 'Needs attention',  badge: 'badge-amber' },
  blocked:         { label: 'Blocked',          badge: 'badge-red'   },
  nearly_done:     { label: 'Nearly done',      badge: 'badge-blue'  },
}

function formatDate(str) {
  if (!str) return null
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ClientHeader({ client, stats }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  if (!client) return (
    <div className="border-b px-6 py-5" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="max-w-5xl mx-auto h-14 animate-pulse rounded-lg bg-dark-elevated" />
    </div>
  )

  const health = HEALTH[client.health] ?? HEALTH.on_track
  const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const accentColor = client.color || '#1D9E75'

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/portal/${client.share_token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-dark-border"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-semibold shrink-0 select-none"
                style={{ backgroundColor: accentColor + '28', color: accentColor }}
              >
                {client.name?.[0]?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-dark-text font-medium text-xl leading-tight truncate">
                {client.name}{client.project_name && ` — ${client.project_name}`}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`badge ${health.badge}`}>
                  {health.label}{stats.total > 0 && ` · ${percent}%`}
                </span>
                {client.start_date && (
                  <span className="text-dark-muted text-xs">Started {formatDate(client.start_date)}</span>
                )}
                {client.due_date && (
                  <span className="text-dark-muted text-xs">Due {formatDate(client.due_date)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <button className="btn shrink-0" onClick={copyLink}>
            {copied ? 'Copied!' : 'Client link'}
          </button>
        </div>
      </div>
    </header>
  )
}
