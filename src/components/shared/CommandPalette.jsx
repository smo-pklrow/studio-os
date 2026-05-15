import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const PLACEHOLDER_ITEMS = [
  { icon: 'ti-users',           label: 'Go to dashboard',        hint: 'All clients' },
  { icon: 'ti-settings',        label: 'Open settings',          hint: 'Profile, studio name' },
  { icon: 'ti-sparkles',        label: 'AI tools',               hint: 'Coming in Phase 3' },
  { icon: 'ti-calendar-event',  label: 'Calendar integrations',  hint: 'Coming in Phase 3' },
]

export default function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('')
  const inputRef  = useRef(null)
  const navigate  = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handle(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  const items = PLACEHOLDER_ITEMS.filter(item =>
    !query || item.label.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(item) {
    if (item.label === 'Go to dashboard') { navigate('/'); onClose() }
    else if (item.label === 'Open settings') { navigate('/settings'); onClose() }
    else onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      style={{ backgroundColor: 'var(--color-overlay)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg card card-elevated animate-fade-up overflow-hidden"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <i className="ti ti-search shrink-0" style={{ fontSize: '16px', color: 'var(--color-muted)' }} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-dark-subtle"
            style={{ color: 'var(--color-text)' }}
            placeholder="Search or jump to…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd
            className="shrink-0 text-xs px-1.5 py-0.5 rounded"
            style={{
              fontFamily: 'var(--font-sans)',
              backgroundColor: 'var(--color-elevated)',
              color: 'var(--color-subtle)',
              border: '1px solid var(--border-default)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="py-1 max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs" style={{ color: 'var(--color-subtle)' }}>
              No results for "{query}"
            </p>
          ) : (
            items.map(item => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-dark-elevated transition-colors"
                onClick={() => handleSelect(item)}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-elevated)', color: 'var(--color-muted)' }}
                >
                  <i className={`ti ${item.icon}`} style={{ fontSize: '14px' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>{item.label}</span>
                  {item.hint && (
                    <span className="text-xs ml-2" style={{ color: 'var(--color-subtle)' }}>{item.hint}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 py-2 border-t text-xs"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--color-subtle)' }}
        >
          <span><kbd style={{ fontFamily: 'var(--font-sans)' }}>↵</kbd> select</span>
          <span><kbd style={{ fontFamily: 'var(--font-sans)' }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ fontFamily: 'var(--font-sans)' }}>ESC</kbd> close</span>
          <span className="ml-auto">Studio OS</span>
        </div>
      </div>
    </div>
  )
}
