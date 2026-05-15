import { useState } from 'react'

export default function AddTaskRow({ onAdd }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')

  function commit() {
    if (title.trim()) onAdd(title.trim())
    setTitle('')
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setTitle(''); setEditing(false) }
  }

  if (!editing) {
    return (
      <button
        className="flex items-center gap-2 px-1 py-2 text-dark-subtle hover:text-dark-muted text-xs transition-colors w-full text-left"
        onClick={() => setEditing(true)}
      >
        + Add task
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2.5 px-1 py-1.5">
      <div className="w-4 h-4 rounded shrink-0" style={{ border: '1.5px solid var(--border-strong)' }} />
      <input
        autoFocus
        className="flex-1 bg-transparent text-sm text-dark-text placeholder:text-dark-subtle focus:outline-none"
        placeholder="Task title…"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
      />
    </div>
  )
}
