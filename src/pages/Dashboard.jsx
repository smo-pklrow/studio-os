import { useState, useEffect } from 'react'
import { useClients } from '../hooks/useClients'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/shared/Toast'
import ClientRow from '../components/clients/ClientRow'
import AddClientModal from '../components/clients/AddClientModal'
import EditClientModal from '../components/clients/EditClientModal'
import WeekCalendar from '../components/layout/WeekCalendar'
import DigestStrip from '../components/layout/DigestStrip'
import StatsBar from '../components/layout/StatsBar'

function ClientRowSkeleton() {
  return (
    <div className="card p-5 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-lg shrink-0" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
      <div className="flex-1 flex flex-col gap-2.5">
        <div className="h-3 rounded w-32" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
        <div className="h-2 rounded w-48" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
        <div className="h-1.5 rounded w-full mt-0.5" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
        <div className="h-2 rounded w-20" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
        <div className="h-5 rounded w-16" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
        <div className="h-2 rounded w-10" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
      </div>
    </div>
  )
}

function StatsBarSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="card p-4">
          <div className="h-2 rounded w-20 mb-3" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
          <div className="h-8 rounded w-10" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
        </div>
      ))}
    </div>
  )
}

const HEALTH_LABELS = {
  on_track:        'On track',
  needs_attention: 'Needs attention',
  blocked:         'Blocked',
  nearly_done:     'Nearly done',
}

function formatHeaderDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getGreeting(name) {
  const hour = new Date().getHours()
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  return `Good ${time}${name ? `, ${name}` : ''}.`
}

function getInsight(clients) {
  if (clients.length === 0) return formatHeaderDate()
  const totalOverdue = clients.reduce((sum, c) => sum + (c._stats?.overdue ?? 0), 0)
  const needsAttention = clients.filter(c => c.health === 'needs_attention' || c.health === 'blocked').length
  if (totalOverdue > 0) return `${totalOverdue} overdue task${totalOverdue !== 1 ? 's' : ''} across your clients.`
  if (needsAttention > 0) return `${needsAttention} client${needsAttention !== 1 ? 's' : ''} need${needsAttention === 1 ? 's' : ''} attention.`
  return `All ${clients.length} client${clients.length !== 1 ? 's' : ''} on track.`
}

export default function Dashboard() {
  const { clients, loading, error, globalStats, createClient, archiveClient, updateClient, pauseClient, cloneClientStructure } = useClients()
  const toast = useToast()
  const [showAddModal, setShowAddModal]   = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [search, setSearch]               = useState('')
  const [healthFilter, setHealthFilter]   = useState('')
  const [firstName, setFirstName]         = useState(null)
  const [nudgeDismissed, setNudgeDismissed] = useState(
    () => localStorage.getItem('portal-nudge-dismissed') === 'true'
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const name = user?.user_metadata?.full_name ?? user?.user_metadata?.name
      if (name) setFirstName(name.split(' ')[0])
    })
  }, [])

  useEffect(() => {
    function handle(e) {
      const active = document.activeElement
      const editing = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.isContentEditable
      if (!editing && e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowAddModal(true)
      }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  async function handleAddClient(fields, logoFile, sourceClientId) {
    const result = await createClient(fields, logoFile)
    if (!result.error && sourceClientId && result.data?.id) {
      const { error: cloneError } = await cloneClientStructure(sourceClientId, result.data.id)
      if (cloneError) toast('Structure copy failed — client created but tasks were not copied.', 'error')
    }
    return result
  }

  function dismissNudge() {
    localStorage.setItem('portal-nudge-dismissed', 'true')
    setNudgeDismissed(true)
  }

  const filtered = clients.filter(c => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
    const matchesHealth = !healthFilter || c.health === healthFilter
    return matchesSearch && matchesHealth
  })

  const hasFilters = search || healthFilter
  const showNudge  = !nudgeDismissed && !loading && clients.length >= 1

  function shareFirstPortal() {
    const first = filtered[0] ?? clients[0]
    if (!first?.share_token) return
    navigator.clipboard.writeText(`${window.location.origin}/portal/${first.share_token}`)
    toast('Client portal link copied!', 'success')
    dismissNudge()
  }

  return (
    <div className="flex flex-col flex-1">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto w-full px-6 py-6 flex items-end justify-between gap-4">
          <div className="animate-fade-up">
            <h1
              className="leading-tight mb-1"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-display)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                color: 'var(--color-text)',
              }}
            >
              {firstName ? getGreeting(firstName) : formatHeaderDate()}
            </h1>
            {!loading && (
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                {getInsight(clients)}
              </p>
            )}
          </div>
          <button className="btn btn-primary shrink-0" onClick={() => setShowAddModal(true)}>
            + New client
          </button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        <WeekCalendar />
        <DigestStrip />

        {loading ? <StatsBarSkeleton /> : !error && <StatsBar stats={globalStats} />}

        {/* Portal nudge — shown until dismissed */}
        {showNudge && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 animate-fade-up"
            style={{
              backgroundColor: 'var(--color-brand-deep)',
              border: '1px solid var(--border-brand)',
            }}
          >
            <i className="ti ti-share shrink-0" style={{ color: 'var(--color-brand-tint)', fontSize: 'var(--icon-lg)' }} />
            <div className="flex-1 min-w-0 text-sm">
              <span style={{ color: 'var(--color-brand-tint)', fontWeight: 500 }}>Share your client portal</span>
              <span style={{ color: 'var(--color-muted)' }}> — give your client a live view of their project. No login required.</span>
            </div>
            <button
              className="btn btn-primary shrink-0 text-xs"
              style={{ height: '28px', padding: '0 10px' }}
              onClick={shareFirstPortal}
            >
              Copy link
            </button>
            <button
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-dark-elevated transition-colors"
              style={{ color: 'var(--color-muted)' }}
              onClick={dismissNudge}
              aria-label="Dismiss"
            >
              <i className="ti ti-x" style={{ fontSize: 'var(--icon-sm)' }} />
            </button>
          </div>
        )}

        {/* Client list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-dark-text text-sm font-medium">All clients</h2>
            <span className="text-dark-subtle text-xs">Last updated</span>
          </div>

          {/* Search + filter bar */}
          {!loading && !error && clients.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <input
                className="flex-1 bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text placeholder:text-dark-subtle focus:outline-none focus:border-brand-green transition-colors"
                placeholder="Search clients…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                className="bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-green transition-colors"
                value={healthFilter}
                onChange={e => setHealthFilter(e.target.value)}
              >
                <option value="">All health</option>
                {Object.entries(HEALTH_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {hasFilters && (
                <button
                  className="btn text-xs text-dark-subtle"
                  onClick={() => { setSearch(''); setHealthFilter('') }}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => <ClientRowSkeleton key={i} />)}
            </div>
          )}

          {error && <p className="text-red-400 text-sm">Failed to load clients.</p>}

          {/* Zero clients — big CTA */}
          {!loading && !error && clients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: 'var(--color-brand-deep)', color: 'var(--color-brand-tint)' }}
              >
                <i className="ti ti-users" style={{ fontSize: 'var(--icon-2xl)' }} />
              </div>
              <p className="text-dark-text text-sm font-medium mb-1">No clients yet</p>
              <p className="text-dark-muted text-xs mb-6 max-w-xs leading-relaxed">
                Add your first client to start tracking projects, tasks, and sharing a live portal.
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => setShowAddModal(true)}>
                + New client
              </button>
            </div>
          )}

          {/* No matches from filter */}
          {!loading && !error && clients.length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <p className="text-dark-text text-sm font-medium mb-1">No clients match</p>
              <p className="text-dark-muted text-xs mb-4">Try a different name or health filter.</p>
              <button className="btn text-xs" onClick={() => { setSearch(''); setHealthFilter('') }}>
                Clear filters
              </button>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="flex flex-col gap-3">
              {filtered.map((client, i) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  onArchive={archiveClient}
                  onEdit={setEditingClient}
                  onPause={pauseClient}
                  onHealthChange={(id, health) => updateClient(id, { health })}
                  className={`animate-fade-up animate-delay-${Math.min(i + 1, 4)}`}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddClient}
          clients={clients}
        />
      )}

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSave={updateClient}
        />
      )}
    </div>
  )
}
