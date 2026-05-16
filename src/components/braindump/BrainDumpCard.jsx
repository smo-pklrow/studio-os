import { useState, useRef, useEffect } from 'react'

const COLORS = {
  amber:  { bg: '#231800', fg: '#FAC775', border: '#3D2E00', accent: '#F4A623' },
  green:  { bg: '#0A2018', fg: '#5DCAA5', border: '#0F3024', accent: '#1D9E75' },
  blue:   { bg: '#0C1E2A', fg: '#85B7EB', border: '#103250', accent: '#378ADD' },
  pink:   { bg: '#280A18', fg: '#F09595', border: '#3D0F28', accent: '#E85C4A' },
  purple: { bg: '#1A0A2A', fg: '#C4A0F0', border: '#280F3D', accent: '#9B59B6' },
}

const COLOR_LIST = Object.keys(COLORS)

export default function BrainDumpCard({ card, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(card.content)
  const textareaRef = useRef(null)
  const colors = COLORS[card.color] ?? COLORS.amber

  useEffect(() => {
    if (editing) textareaRef.current?.focus()
  }, [editing])

  function handleBlur() {
    const trimmed = content.trim()
    if (trimmed && trimmed !== card.content) onUpdate({ content: trimmed })
    else setContent(card.content)
    setEditing(false)
  }

  return (
    <div
      className="w-52 min-h-[160px] rounded-xl flex flex-col group relative overflow-hidden"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderTop: `3px solid ${colors.accent}`,
      }}
    >
      {/* Content area */}
      <div className="flex-1 p-4 pb-2">
        {editing ? (
          <textarea
            ref={textareaRef}
            className="w-full h-full bg-transparent text-sm resize-none focus:outline-none min-h-[96px]"
            style={{ color: colors.fg }}
            value={content}
            onChange={e => setContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={e => {
              if ((e.key === 'Enter' && (e.metaKey || e.ctrlKey))) handleBlur()
              if (e.key === 'Escape') { setContent(card.content); setEditing(false) }
            }}
          />
        ) : (
          <p
            className="text-sm whitespace-pre-wrap break-words cursor-text select-none leading-relaxed"
            style={{ color: colors.fg }}
            onClick={() => setEditing(true)}
          >
            {card.content}
          </p>
        )}
      </div>

      {/* Footer — color swatches + delete, revealed on hover */}
      <div className="px-4 pb-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1.5">
          {COLOR_LIST.map(c => (
            <button
              key={c}
              className="w-3 h-3 rounded-full transition-transform hover:scale-125"
              style={{
                backgroundColor: COLORS[c].accent,
                boxShadow: card.color === c ? `0 0 0 2px ${colors.bg}, 0 0 0 3.5px ${COLORS[c].accent}` : 'none',
              }}
              onClick={() => onUpdate({ color: c })}
              aria-label={`Change color to ${c}`}
            />
          ))}
        </div>
        <button
          className="tooltip w-5 h-5 flex items-center justify-center rounded hover:bg-black/20 transition-colors"
          style={{ color: colors.fg }}
          data-tip="Delete card"
          aria-label="Delete card"
          onClick={onDelete}
        >
          <i className="ti ti-x" style={{ fontSize: '11px' }} />
        </button>
      </div>
    </div>
  )
}
