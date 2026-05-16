import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const COLORS = {
  amber:  { bg: '#231800', fg: '#FAC775', border: '#3D2E00', accent: '#F4A623' },
  green:  { bg: '#0A2018', fg: '#5DCAA5', border: '#0F3024', accent: '#1D9E75' },
  blue:   { bg: '#0C1E2A', fg: '#85B7EB', border: '#103250', accent: '#378ADD' },
  pink:   { bg: '#280A18', fg: '#F09595', border: '#3D0F28', accent: '#E85C4A' },
  purple: { bg: '#1A0A2A', fg: '#C4A0F0', border: '#280F3D', accent: '#9B59B6' },
}

const COLOR_LIST = Object.keys(COLORS)

const TOOLBAR = [
  { key: 'bold',       render: () => <span style={{ fontWeight: 700, fontSize: '13px' }}>B</span>,  toggle: e => e.chain().focus().toggleBold().run()       },
  { key: 'italic',     render: () => <span style={{ fontStyle: 'italic', fontSize: '13px' }}>I</span>, toggle: e => e.chain().focus().toggleItalic().run()     },
  { key: 'bulletList', render: () => <i className="ti ti-list" style={{ fontSize: '12px' }} />,     toggle: e => e.chain().focus().toggleBulletList().run() },
]

function EditingText({ card, colors, onUpdate, onDone }) {
  const handleSaveRef = useRef(null)
  const [marks, setMarks] = useState({ bold: false, italic: false, bulletList: false })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write something…' }),
    ],
    content: card.content || '',
    autofocus: 'end',
    onBlur: ({ editor }) => {
      const html = editor.getHTML()
      if (html !== '<p></p>' && html !== card.content) onUpdate({ content: html })
      onDone()
    },
    onSelectionUpdate: ({ editor }) => {
      setMarks({ bold: editor.isActive('bold'), italic: editor.isActive('italic'), bulletList: editor.isActive('bulletList') })
    },
    onTransaction: ({ editor }) => {
      setMarks({ bold: editor.isActive('bold'), italic: editor.isActive('italic'), bulletList: editor.isActive('bulletList') })
    },
    editorProps: {
      attributes: {
        class: 'brain-dump-editor',
        style: `color: ${colors.fg};`,
      },
      handleKeyDown: (_view, e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { handleSaveRef.current?.(); return true }
        return false
      },
    },
  })

  // Update ref on every render so the handleKeyDown closure always calls the latest version
  handleSaveRef.current = () => editor?.commands.blur()

  if (!editor) return null

  return (
    <div className="flex-1 p-3 flex flex-col" style={{ minHeight: '110px' }}>
      {/* Mini toolbar */}
      <div
        className="flex items-center gap-px mb-2"
        onMouseDown={e => e.preventDefault()}
      >
        {TOOLBAR.map(btn => (
          <button
            key={btn.key}
            className="w-6 h-6 flex items-center justify-center rounded transition-all"
            style={{
              color: colors.fg,
              backgroundColor: marks[btn.key] ? `${colors.accent}35` : 'transparent',
              opacity: marks[btn.key] ? 1 : 0.38,
            }}
            onClick={() => btn.toggle(editor)}
          >
            {btn.render()}
          </button>
        ))}
        <span className="ml-auto" style={{ color: colors.fg, opacity: 0.2, fontSize: '10px' }}>⌘↵</span>
      </div>
      <EditorContent editor={editor} className="flex-1" />
    </div>
  )
}

function TextCard({ card, colors, onUpdate }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <EditingText
        card={card}
        colors={colors}
        onUpdate={onUpdate}
        onDone={() => setEditing(false)}
      />
    )
  }

  const hasContent = card.content && card.content !== '<p></p>'

  return (
    <div
      className="flex-1 p-4 cursor-text"
      style={{ minHeight: '110px' }}
      onClick={() => setEditing(true)}
    >
      {hasContent ? (
        <div
          className="brain-dump-content"
          style={{ color: colors.fg }}
          dangerouslySetInnerHTML={{ __html: card.content }}
        />
      ) : (
        <span style={{ color: colors.fg, opacity: 0.28, fontSize: '13px' }}>Click to write…</span>
      )}
    </div>
  )
}

function ImageCard({ card }) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-2 rounded-t"
        style={{ minHeight: '180px', backgroundColor: 'rgba(0,0,0,0.2)' }}
      >
        <i className="ti ti-photo-off" style={{ fontSize: '24px', opacity: 0.3 }} />
        <span style={{ fontSize: '11px', opacity: 0.3 }}>Image unavailable</span>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden" style={{ minHeight: '180px' }}>
      <img
        src={card.content}
        alt="Inspiration"
        className="w-full h-full object-cover"
        style={{ minHeight: '180px', maxHeight: '300px', display: 'block' }}
        onError={() => setImgError(true)}
      />
    </div>
  )
}

export default function BrainDumpCard({ card, onUpdate, onDelete }) {
  const colors = COLORS[card.color] ?? COLORS.amber
  const isImage = card.type === 'image'

  return (
    <div
      className="rounded-xl flex flex-col group relative overflow-hidden"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderTop: `3px solid ${colors.accent}`,
      }}
    >
      {isImage ? (
        <ImageCard card={card} />
      ) : (
        <TextCard card={card} colors={colors} onUpdate={onUpdate} />
      )}

      {/* Footer: color swatches + delete — revealed on hover */}
      <div
        className="px-3 pb-3 pt-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <div className="flex gap-1.5">
          {COLOR_LIST.map(c => (
            <button
              key={c}
              className="w-2.5 h-2.5 rounded-full transition-transform hover:scale-125"
              style={{
                backgroundColor: COLORS[c].accent,
                boxShadow: card.color === c
                  ? `0 0 0 2px ${colors.bg}, 0 0 0 3.5px ${COLORS[c].accent}`
                  : 'none',
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
