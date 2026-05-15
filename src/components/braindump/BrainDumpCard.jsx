import { useState, useRef, useEffect } from 'react'

const COLORS = {
  amber:  { bg: '#231800', fg: '#FAC775', border: '#3D2E00' },
  green:  { bg: '#0A2018', fg: '#5DCAA5', border: '#0F3024' },
  blue:   { bg: '#0C1E2A', fg: '#85B7EB', border: '#103250' },
  pink:   { bg: '#280A18', fg: '#F09595', border: '#3D0F28' },
  purple: { bg: '#1A0A2A', fg: '#C4A0F0', border: '#280F3D' },
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
      className="w-48 min-h-[148px] rounded-xl p-4 flex flex-col gap-3 group relative"
      style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
    >
      {editing ? (
        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent text-sm resize-none focus:outline-none w-full min-h-[80px]"
          style={{ color: colors.fg }}
          value={content}
          onChange={e => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => {
            if (e.key === 'Escape') { setContent(card.content); setEditing(false) }
          }}
        />
      ) : (
        <p
          className="text-sm flex-1 whitespace-pre-wrap break-words cursor-text select-none"
          style={{ color: colors.fg }}
          onClick={() => setEditing(true)}
        >
          {card.content}
        </p>
      )}

      {/* Color swatches — show on hover when not editing */}
      {!editing && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {COLOR_LIST.map(c => (
            <button
              key={c}
              className="w-3 h-3 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: COLORS[c].fg,
                outline: card.color === c ? `2px solid ${COLORS[c].fg}` : 'none',
                outlineOffset: '2px',
              }}
              onClick={() => onUpdate({ color: c })}
            />
          ))}
        </div>
      )}

      {/* Delete button */}
      <button
        className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/20 text-xs leading-none"
        style={{ color: colors.fg }}
        onClick={onDelete}
      >
        ×
      </button>
    </div>
  )
}
