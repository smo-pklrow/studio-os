import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const STATUS_BADGE = {
  active:   'badge-green',
  paused:   'badge-amber',
  archived: 'badge-gray',
}

const HEALTH_BADGE = {
  on_track:        'badge-green',
  needs_attention: 'badge-amber',
  blocked:         'badge-red',
  nearly_done:     'badge-blue',
}

const HEALTH_LABEL = {
  on_track:        'On track',
  needs_attention: 'Needs attention',
  blocked:         'Blocked',
  nearly_done:     'Nearly done',
}

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

export default function ClientCard({ client, onArchive, className = '' }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div
      className={`card card-interactive group relative p-5 flex flex-col gap-3 ${className}`}
      onClick={() => navigate(`/client/${client.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-dark-text font-medium text-sm leading-snug truncate">{client.name}</h3>
          {client.project_name && (
            <p className="text-dark-muted text-xs mt-0.5 truncate">{client.project_name}</p>
          )}
        </div>
        <button
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-dark-elevated text-dark-subtle hover:text-dark-muted transition-all"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
          aria-label="Client options"
        >
          <span className="tracking-widest text-sm leading-none select-none">···</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`badge ${STATUS_BADGE[client.status]}`}>
          {client.status}
        </span>
        <span className={`badge ${HEALTH_BADGE[client.health]}`}>
          {HEALTH_LABEL[client.health]}
        </span>
      </div>

      <p className="text-dark-subtle text-xs mt-auto">
        Updated {relativeTime(client.updated_at)}
      </p>

      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-3 top-12 card card-elevated z-10 min-w-[148px] py-1"
          onClick={e => e.stopPropagation()}
        >
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
