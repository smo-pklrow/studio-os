import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { flushSync } from 'react-dom'

const HEALTH = {
  on_track:        { badge: 'badge-green', label: 'On track',        color: '#1D9E75' },
  needs_attention: { badge: 'badge-amber', label: 'Needs attention',  color: '#F4A623' },
  blocked:         { badge: 'badge-red',   label: 'Blocked',          color: '#E85C4A' },
  nearly_done:     { badge: 'badge-blue',  label: 'Nearly done',      color: '#378ADD' },
}

const HEALTH_ORDER = ['on_track', 'needs_attention', 'blocked', 'nearly_done']

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function ClientRow({ client, onArchive, onEdit, onPause, onHealthChange, className = '' }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen]         = useState(false)
  const [healthOpen, setHealthOpen]     = useState(false)
  const [animatedPct, setAnimatedPct]   = useState(0)
  const menuRef   = useRef(null)
  const healthRef = useRef(null)

  const health      = HEALTH[client.health] ?? HEALTH.on_track
  const accentColor = client.color || health.color
  const stats       = client._stats ?? {}
  const percent     = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const isPaused    = client.status === 'paused'

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatedPct(percent))
    return () => cancelAnimationFrame(frame)
  }, [percent])

  const metaParts = [
    client.project_name,
    stats.groupCount > 0 && `${stats.groupCount} group${stats.groupCount !== 1 ? 's' : ''}`,
    stats.total > 0 && `${stats.total} task${stats.total !== 1 ? 's' : ''}`,
  ].filter(Boolean)

  useEffect(() => {
    if (!menuOpen) return
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  useEffect(() => {
    if (!healthOpen) return
    function handle(e) {
      if (healthRef.current && !healthRef.current.contains(e.target)) setHealthOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [healthOpen])

  return (
    <div
      className={`card card-interactive group relative flex items-center gap-4 p-5 ${className}`}
      style={isPaused
        ? { borderColor: 'rgba(244,166,35,0.35)', opacity: 0.75 }
        : { borderLeftColor: accentColor, borderLeftWidth: '3px' }
      }
      onClick={() => {
        if (!document.startViewTransition) { navigate(`/client/${client.id}`); return }
        document.startViewTransition(() => flushSync(() => navigate(`/client/${client.id}`)))
      }}
    >
      {/* Avatar */}
      {client.logo_url ? (
        <img
          src={client.logo_url}
          alt=""
          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-dark-border"
          style={{ viewTransitionName: `client-avatar-${client.id}` }}
        />
      ) : (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 select-none"
          style={{ backgroundColor: accentColor + '28', color: accentColor, viewTransitionName: `client-avatar-${client.id}` }}
        >
          {client.name?.[0]?.toUpperCase()}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 min-w-0">
        <h3 className="text-dark-text font-medium text-sm mb-0.5">{client.name}</h3>

        {metaParts.length > 0 && (
          <p className="text-dark-muted text-xs mb-3">{metaParts.join(' · ')}</p>
        )}

        {/* Progress bar */}
        <div className="progress-bar mb-2">
          <div
            className="progress-fill"
            style={{ width: `${animatedPct}%`, background: isPaused ? '#F4A623' : health.color }}
          />
        </div>

        {/* Status counts */}
        <div className="flex items-center gap-2 flex-wrap">
          {stats.done > 0 && (
            <span className="badge badge-green">{stats.done} done</span>
          )}
          {stats.inProgress > 0 && (
            <span className="badge badge-blue">{stats.inProgress} in progress</span>
          )}
          {stats.todo > 0 && (
            <span className="text-dark-muted text-xs">{stats.todo} to do</span>
          )}
          {stats.overdue > 0 && (
            <span className="badge badge-red">{stats.overdue} overdue</span>
          )}
          {stats.blocked > 0 && (
            <span className="badge badge-red">{stats.blocked} blocked</span>
          )}
          {stats.total === 0 && (
            <span className="text-dark-subtle text-xs">No tasks yet</span>
          )}
        </div>
      </div>

      {/* Right — health badge + status + timestamp */}
      <div className="shrink-0 flex flex-col items-end gap-2 ml-2">
        {/* Health badge — clickable */}
        <div className="relative" ref={healthRef}>
          <button
            className={`badge ${health.badge} cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={e => { e.stopPropagation(); setHealthOpen(v => !v) }}
          >
            {health.label}
          </button>

          {healthOpen && (
            <div className="absolute right-0 top-7 card card-elevated z-10 min-w-[160px] py-1">
              {HEALTH_ORDER.map(key => {
                const h = HEALTH[key]
                return (
                  <button
                    key={key}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-dark-elevated transition-colors flex items-center gap-2"
                    onClick={e => {
                      e.stopPropagation()
                      setHealthOpen(false)
                      if (key !== client.health) onHealthChange?.(client.id, key)
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

        {isPaused && <span className="badge badge-amber">Paused</span>}
        <span className="text-dark-subtle text-xs">{relativeTime(client.updated_at)}</span>
      </div>

      {/* Three-dot menu */}
      <button
        className="tooltip shrink-0 w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-dark-elevated text-dark-subtle hover:text-dark-muted transition-all"
        data-tip="More options"
        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
        aria-label="Client options"
      >
        <i className="ti ti-dots" style={{ fontSize: '16px' }} />
      </button>

      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-3 top-14 card card-elevated z-10 min-w-[148px] py-1"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-2 text-xs text-dark-text hover:bg-dark-elevated transition-colors"
            onClick={() => { setMenuOpen(false); onEdit?.(client) }}
          >
            Edit client
          </button>
          <button
            className="w-full text-left px-3 py-2 text-xs text-dark-muted hover:bg-dark-elevated transition-colors"
            onClick={() => { setMenuOpen(false); onPause?.(client.id) }}
          >
            {isPaused ? 'Unpause client' : 'Pause client'}
          </button>
          <div className="border-t my-1" style={{ borderColor: 'var(--border-subtle)' }} />
          <button
            className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-dark-elevated transition-colors"
            onClick={() => { setMenuOpen(false); onArchive(client.id) }}
          >
            Archive client
          </button>
        </div>
      )}
    </div>
  )
}
