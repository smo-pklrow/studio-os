import { useState } from 'react'
import { useClients } from '../hooks/useClients'
import ClientRow from '../components/clients/ClientRow'
import AddClientModal from '../components/clients/AddClientModal'
import WeekCalendar from '../components/layout/WeekCalendar'
import DigestStrip from '../components/layout/DigestStrip'
import StatsBar from '../components/layout/StatsBar'

function formatHeaderDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const { clients, loading, error, globalStats, createClient, archiveClient } = useClients()
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="min-h-dvh flex flex-col">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-sm bg-brand-green" />
              <h1 className="text-dark-text font-medium text-base">Studio OS</h1>
            </div>
            <p className="text-dark-muted text-xs mt-0.5 pl-6">
              {formatHeaderDate()}
              {!loading && (
                <> · {clients.length} active client{clients.length !== 1 ? 's' : ''}</>
              )}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New client
          </button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        <WeekCalendar />
        <DigestStrip />

        {!loading && !error && <StatsBar stats={globalStats} />}

        {/* Client list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-dark-text text-sm font-medium">All clients</h2>
            <span className="text-dark-subtle text-xs">Last updated</span>
          </div>

          {loading && (
            <p className="text-dark-muted text-sm">Loading…</p>
          )}

          {error && (
            <p className="text-red-400 text-sm">Failed to load clients.</p>
          )}

          {!loading && !error && clients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-dark-subtle text-xl select-none"
                style={{ backgroundColor: 'var(--color-elevated)' }}
              >
                ◈
              </div>
              <p className="text-dark-text text-sm font-medium mb-1">No clients yet</p>
              <p className="text-dark-muted text-xs mb-6">Add your first client to get started.</p>
              <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
                + New client
              </button>
            </div>
          )}

          {!loading && !error && clients.length > 0 && (
            <div className="flex flex-col gap-3">
              {clients.map((client, i) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  onArchive={archiveClient}
                  className={`animate-fade-up animate-delay-${Math.min(i + 1, 4)}`}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showModal && (
        <AddClientModal
          onClose={() => setShowModal(false)}
          onAdd={createClient}
        />
      )}
    </div>
  )
}
