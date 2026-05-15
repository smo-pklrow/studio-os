import { useState } from 'react'

export default function AddClientModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    const { error } = await onAdd({
      name: name.trim(),
      project_name: projectName.trim() || null,
    })
    setSubmitting(false)
    if (error) setError(error.message)
    else onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-overlay)' }}
      onClick={onClose}
    >
      <div
        className="card card-elevated w-full max-w-md mx-4 p-6 animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-dark-text font-medium text-base mb-5">New client</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-dark-muted text-xs mb-1.5">Client name *</label>
            <input
              className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text placeholder:text-dark-subtle focus:outline-none focus:border-brand-green transition-colors"
              placeholder="Acme Studio"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-dark-muted text-xs mb-1.5">Project name</label>
            <input
              className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text placeholder:text-dark-subtle focus:outline-none focus:border-brand-green transition-colors"
              placeholder="Brand refresh 2026"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!name.trim() || submitting}
            >
              {submitting ? 'Adding…' : 'Add client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
