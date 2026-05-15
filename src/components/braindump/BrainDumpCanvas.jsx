import { useState } from 'react'
import BrainDumpCard from './BrainDumpCard'

const COLORS = ['amber', 'green', 'blue', 'pink', 'purple']

const COLOR_DOT = {
  amber:  '#FAC775',
  green:  '#5DCAA5',
  blue:   '#85B7EB',
  pink:   '#F09595',
  purple: '#C4A0F0',
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
        <div className="w-full flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>No brain dump cards yet</p>
          <p className="text-xs mb-6" style={{ color: 'var(--color-subtle)' }}>
            Drop thoughts, concepts, and visual ideas here.
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
          className="w-48 min-h-[148px] rounded-xl p-4 flex flex-col gap-3"
          style={{ backgroundColor: 'var(--color-elevated)', border: '1px solid var(--border-default)' }}
        >
          <textarea
            autoFocus
            className="flex-1 bg-transparent text-sm text-dark-text placeholder:text-dark-subtle resize-none focus:outline-none min-h-[80px]"
            placeholder="Write something…"
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  className="w-3.5 h-3.5 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: COLOR_DOT[c],
                    outline: color === c ? `2px solid ${COLOR_DOT[c]}` : 'none',
                    outlineOffset: '2px',
                  }}
                  onClick={() => setColor(c)}
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
        <button
          className="w-48 min-h-[148px] rounded-xl flex flex-col items-center justify-center gap-2 text-dark-subtle hover:text-dark-muted transition-colors"
          style={{ border: '2px dashed var(--border-default)' }}
          onClick={() => setAdding(true)}
        >
          <span className="text-2xl leading-none select-none">+</span>
          <span className="text-xs">Add card</span>
        </button>
      )}
    </div>
  )
}
