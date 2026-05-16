import { useState } from 'react'
import BrainDumpCard from './BrainDumpCard'

const COLORS = ['amber', 'green', 'blue', 'pink', 'purple']

const COLOR_ACCENT = {
  amber:  '#F4A623',
  green:  '#1D9E75',
  blue:   '#378ADD',
  pink:   '#E85C4A',
  purple: '#9B59B6',
}

export default function BrainDumpCanvas({ cards, onCreateCard, onUpdateCard, onDeleteCard }) {
  const [adding, setAdding] = useState(false)
  const [content, setContent] = useState('')
  const [color, setColor] = useState('amber')

  function handleAdd() {
    if (content.trim()) onCreateCard(content.trim(), color)
    setContent('')
    setAdding(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd()
    if (e.key === 'Escape') { setContent(''); setAdding(false) }
  }

  return (
    <div className="flex flex-wrap gap-4 py-2">
      {cards.length === 0 && !adding && (
        <div className="w-full flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--color-elevated)', border: '1px solid var(--border-default)' }}
          >
            <i className="ti ti-bulb" style={{ fontSize: '18px', color: 'var(--color-subtle)' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>No cards yet</p>
          <p className="text-xs mb-6 max-w-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            Add your first thought, concept, or inspiration. This is unstructured — just capture it.
          </p>
          <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Add card</button>
        </div>
      )}

      {cards.map(card => (
        <BrainDumpCard
          key={card.id}
          card={card}
          onUpdate={fields => onUpdateCard(card.id, fields)}
          onDelete={() => onDeleteCard(card.id)}
        />
      ))}

      {/* Add card form */}
      {adding ? (
        <div
          className="w-52 min-h-[160px] rounded-xl flex flex-col overflow-hidden"
          style={{ backgroundColor: 'var(--color-elevated)', border: `1px solid var(--border-default)`, borderTop: `3px solid ${COLOR_ACCENT[color]}` }}
        >
          <div className="flex-1 p-4 pb-2">
            <textarea
              autoFocus
              className="w-full bg-transparent text-sm text-dark-text placeholder:text-dark-subtle resize-none focus:outline-none min-h-[96px] leading-relaxed"
              placeholder="Write something…"
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="px-4 pb-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  className="w-3 h-3 rounded-full transition-transform hover:scale-125"
                  style={{
                    backgroundColor: COLOR_ACCENT[c],
                    boxShadow: color === c ? `0 0 0 2px var(--color-elevated), 0 0 0 3.5px ${COLOR_ACCENT[c]}` : 'none',
                  }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                />
              ))}
            </div>
            <div className="flex gap-1 shrink-0">
              <button className="btn text-xs" style={{ height: '24px', padding: '0 8px' }} onClick={() => { setContent(''); setAdding(false) }}>
                Cancel
              </button>
              <button className="btn btn-primary text-xs" style={{ height: '24px', padding: '0 8px' }} onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      ) : (
        cards.length > 0 && (
          <button
            className="w-52 min-h-[160px] rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
            style={{ border: '2px dashed var(--border-default)', color: 'var(--color-subtle)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
            onClick={() => setAdding(true)}
          >
            <i className="ti ti-plus" style={{ fontSize: '20px' }} />
            <span className="text-xs">Add card</span>
          </button>
        )
      )}
    </div>
  )
}
