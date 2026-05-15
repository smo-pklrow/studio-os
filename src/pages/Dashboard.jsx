import { useState } from 'react'
import { useClients } from '../hooks/useClients'
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

export default function Dashboard() {
  const { clients, loading, error, globalStats, createClient, archiveClient, updateClient, pauseClient } = useClients()
  const [showAddModal, setShowAddModal]   = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [search, setSearch]               = useState('')
  const [healthFilter, setHealthFilter]   = useState('')

  const filtered = clients.filter(c => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
    const matchesHealth = !healthFilter || c.health === healthFilter
    return matchesSearch && matchesHealth
  })

  const hasFilters = search || healthFilter

  return (
    <div className="flex flex-col flex-1">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-dark-text text-sm font-medium">{formatHeaderDate()}</p>
            {!loading && (
              <p className="text-dark-muted text-xs mt-0.5">
                {clients.length} active client{clients.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + New client
          </button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        <WeekCalendar />
        <DigestStrip />

        {loading ? <StatsBarSkeleton /> : !error && <StatsBar stats={globalStats} />}

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
                <i className="ti ti-users" style={{ fontSize: '24px' }} />
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
          onAdd={createClient}
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
