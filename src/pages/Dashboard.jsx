import { useState } from 'react'
import { useClients } from '../hooks/useClients'
import ClientCard from '../components/clients/ClientCard'
import AddClientModal from '../components/clients/AddClientModal'

export default function Dashboard() {
  const { clients, loading, error, createClient, archiveClient } = useClients()
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-medium text-dark-text">Studio OS</h1>
          <p className="text-dark-muted text-sm mt-0.5">
            {loading ? '' : `${clients.length} active client${clients.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
          + New client
        </button>
      </div>

      {loading && (
        <div className="text-dark-muted text-sm">Loading…</div>
      )}

      {error && (
        <p className="text-red-400 text-sm">Failed to load clients.</p>
      )}

      {!loading && !error && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-dark-elevated flex items-center justify-center mb-4 text-dark-subtle text-xl">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clients.map((client, i) => (
            <ClientCard
              key={client.id}
              client={client}
              onArchive={archiveClient}
              className={`animate-fade-up animate-delay-${Math.min(i + 1, 4)}`}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddClientModal
          onClose={() => setShowModal(false)}
          onAdd={createClient}
        />
      )}
    </div>
  )
}
