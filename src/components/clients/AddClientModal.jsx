import { useState, useRef, useEffect } from 'react'

const COLOR_SWATCHES = [
  '#1D9E75', '#378ADD', '#9B59B6', '#E85C4A',
  '#F4A623', '#E91E63', '#00BCD4', '#607D8B',
  '#2ECC71', '#FF5722',
]

const HEALTH_OPTIONS = [
  { value: 'on_track',        label: 'On track',        badge: 'badge-green' },
  { value: 'needs_attention', label: 'Needs attention', badge: 'badge-amber' },
  { value: 'blocked',         label: 'Blocked',         badge: 'badge-red'   },
  { value: 'nearly_done',     label: 'Nearly done',     badge: 'badge-blue'  },
]

export default function AddClientModal({ onClose, onAdd, clients = [] }) {
  useEffect(() => {
    function handle(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  const [name, setName]               = useState('')
  const [projectName, setProjectName] = useState('')
  const [color, setColor]             = useState(COLOR_SWATCHES[0])
  const [health, setHealth]           = useState('on_track')
  const [startDate, setStartDate]     = useState('')
  const [dueDate, setDueDate]         = useState('')
  const [logoFile, setLogoFile]       = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [sourceClientId, setSourceClientId] = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState(null)
  const fileInputRef = useRef(null)

  function handleLogoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function handleRemoveLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    const { error } = await onAdd(
      {
        name: name.trim(),
        project_name: projectName.trim() || null,
        color,
        health,
        start_date: startDate || null,
        due_date: dueDate || null,
      },
      logoFile,
      sourceClientId || null
    )
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

          {/* Name */}
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

          {/* Project name */}
          <div>
            <label className="block text-dark-muted text-xs mb-1.5">Project name</label>
            <input
              className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text placeholder:text-dark-subtle focus:outline-none focus:border-brand-green transition-colors"
              placeholder="Brand refresh 2026"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
            />
          </div>

          {/* Start + Due dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-dark-muted text-xs mb-1.5">Start date</label>
              <input
                type="date"
                className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-green transition-colors"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-dark-muted text-xs mb-1.5">Due date</label>
              <input
                type="date"
                className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-green transition-colors"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Health */}
          <div>
            <label className="block text-dark-muted text-xs mb-2">Health</label>
            <div className="flex items-center gap-2 flex-wrap">
              {HEALTH_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`badge ${opt.badge} cursor-pointer transition-opacity ${health === opt.value ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                  style={health === opt.value ? { outline: '2px solid currentColor', outlineOffset: '2px' } : {}}
                  onClick={() => setHealth(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand color */}
          <div>
            <label className="block text-dark-muted text-xs mb-2">Brand color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_SWATCHES.map(c => (
                <button
                  key={c}
                  type="button"
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px var(--color-bg), 0 0 0 4px ${c}` : 'none',
                  }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Logo upload */}
          <div>
            <label className="block text-dark-muted text-xs mb-2">Logo</label>
            {logoPreview ? (
              <div className="flex items-center gap-3">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-12 h-12 rounded-lg object-cover border border-dark-border"
                />
                <button type="button" className="btn text-xs" onClick={handleRemoveLogo}>
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn w-full justify-center border-dashed text-dark-subtle hover:text-dark-muted"
                onClick={() => fileInputRef.current.click()}
              >
                + Upload logo
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          {/* Copy structure from existing client */}
          {clients.length > 0 && (
            <div>
              <label className="block text-dark-muted text-xs mb-1.5">Copy task structure from</label>
              <select
                className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-green transition-colors"
                value={sourceClientId}
                onChange={e => setSourceClientId(e.target.value)}
              >
                <option value="">— Start fresh —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.project_name ? ` — ${c.project_name}` : ''}
                  </option>
                ))}
              </select>
              {sourceClientId && (
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
                  Task groups and task names will be copied. Status, due dates, and assignees start fresh.
                </p>
              )}
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}

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
