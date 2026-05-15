import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePortal } from '../hooks/usePortal'
import logoUrl from '../assets/logo.png'

const STATUS_CONFIG = {
  todo:        { label: 'To do',       cls: 'badge-gray'  },
  in_progress: { label: 'In progress', cls: 'badge-blue'  },
  done:        { label: 'Done',        cls: 'badge-green' },
  blocked:     { label: 'Blocked',     cls: 'badge-red'   },
}

const HEALTH_CONFIG = {
  on_track:        { label: 'On track',        cls: 'badge-green' },
  needs_attention: { label: 'Needs attention', cls: 'badge-amber' },
  blocked:         { label: 'Blocked',         cls: 'badge-red'   },
  nearly_done:     { label: 'Nearly done',     cls: 'badge-blue'  },
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PortalTaskRow({ task }) {
  const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo
  const isDone = task.status === 'done'

  return (
    <div
      className="flex items-center gap-3 px-5 py-2.5"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      <div
        className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
        style={
          isDone
            ? { backgroundColor: 'var(--color-green-bg)', border: '1.5px solid var(--color-green-fg)' }
            : { border: '1.5px solid var(--border-strong)' }
        }
      >
        {isDone && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path
              d="M1.5 4L3.5 6L6.5 2"
              stroke="var(--color-green-fg)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <span
        className="flex-1 text-sm"
        style={{
          color: isDone ? 'var(--color-subtle)' : 'var(--color-text)',
          textDecoration: isDone ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </span>

      <span className={`badge ${status.cls}`}>{status.label}</span>

      {task.due_date && (
        <span className="text-xs shrink-0" style={{ color: 'var(--color-subtle)' }}>
          {formatDate(task.due_date)}
        </span>
      )}
    </div>
  )
}

function PortalTaskGroup({ group }) {
  const [open, setOpen] = useState(true)

  const done       = group.tasks.filter(t => t.status === 'done').length
  const inProgress = group.tasks.filter(t => t.status === 'in_progress').length
  const blocked    = group.tasks.filter(t => t.status === 'blocked').length
  const total      = group.tasks.length

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-dark-elevated"
        style={{ backgroundColor: 'var(--color-elevated)' }}
      >
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 180ms',
            color: 'var(--color-subtle)',
            flexShrink: 0,
          }}
        >
          <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: group.color }} />

        <span className="text-sm font-medium flex-1" style={{ color: 'var(--color-text)' }}>
          {group.name}
        </span>

        <div className="flex items-center gap-2">
          {done       > 0 && <span className="badge badge-green">{done} done</span>}
          {inProgress > 0 && <span className="badge badge-blue">{inProgress} in progress</span>}
          {blocked    > 0 && <span className="badge badge-red">{blocked} blocked</span>}
          <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>
            {total} task{total !== 1 ? 's' : ''}
          </span>
        </div>
      </button>

      {open && (
        <div>
          {group.tasks.length === 0 ? (
            <p className="px-5 py-4 text-xs" style={{ color: 'var(--color-subtle)' }}>
              No tasks in this group.
            </p>
          ) : (
            group.tasks.map(task => <PortalTaskRow key={task.id} task={task} />)
          )}
        </div>
      )}
    </div>
  )
}

export default function ClientPortal() {
  const { shareToken } = useParams()
  const { client, groups, loading, notFound } = usePortal(shareToken)

  const allTasks   = groups.flatMap(g => g.tasks)
  const doneTasks  = allTasks.filter(t => t.status === 'done').length
  const totalTasks = allTasks.length
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 shrink-0"
        style={{
          height: '48px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="Studio OS" className="h-5 w-auto" />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Studio OS</span>
        </div>
        <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>Client View</span>
      </header>

      {/* Body */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{
                borderColor: 'var(--color-brand)',
                borderTopColor: 'transparent',
              }}
            />
          </div>
        ) : notFound ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2 text-center">
            <p className="text-base font-medium" style={{ color: 'var(--color-text)' }}>
              Link not found or expired
            </p>
            <p className="text-sm" style={{ color: 'var(--color-subtle)' }}>
              This shared link may have been removed or is no longer valid.
            </p>
          </div>
        ) : (
          <>
            {/* Client hero */}
            <div className="card p-5 mb-6 flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl shrink-0 overflow-hidden flex items-center justify-center font-bold text-lg text-white"
                style={{ backgroundColor: client.color || 'var(--color-brand)' }}
              >
                {client.logo_url
                  ? <img src={client.logo_url} alt="" className="w-full h-full object-cover" />
                  : client.name[0]?.toUpperCase()
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                    {client.name}
                  </h1>
                  {client.health && (
                    <span className={`badge ${HEALTH_CONFIG[client.health]?.cls ?? 'badge-gray'}`}>
                      {HEALTH_CONFIG[client.health]?.label ?? client.health}
                    </span>
                  )}
                </div>

                {client.project_name && (
                  <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    {client.project_name}
                  </p>
                )}

                {totalTasks > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>
                        {doneTasks} of {totalTasks} tasks complete
                      </span>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-brand)' }}>
                        {progressPct}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Task groups */}
            {totalTasks === 0 ? (
              <div className="flex flex-col items-center py-16">
                <p className="text-sm" style={{ color: 'var(--color-subtle)' }}>No tasks to show yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {groups.map(g => (
                  <PortalTaskGroup key={g.id} group={g} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center shrink-0">
        <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>Powered by Studio OS</p>
      </footer>
    </div>
  )
}
