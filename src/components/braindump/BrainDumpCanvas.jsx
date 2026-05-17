import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import BrainDumpCard from './BrainDumpCard'
import { useToast } from '../shared/Toast'

const COLORS = {
  amber:  { bg: '#231800', fg: '#FAC775', border: '#3D2E00', accent: '#F4A623' },
  green:  { bg: '#0A2018', fg: '#5DCAA5', border: '#0F3024', accent: '#1D9E75' },
  blue:   { bg: '#0C1E2A', fg: '#85B7EB', border: '#103250', accent: '#378ADD' },
  pink:   { bg: '#280A18', fg: '#F09595', border: '#3D0F28', accent: '#E85C4A' },
  purple: { bg: '#1A0A2A', fg: '#C4A0F0', border: '#280F3D', accent: '#9B59B6' },
}

const COLOR_LIST = Object.keys(COLORS)

const TOOLBAR = [
  { key: 'bold',       render: () => <span style={{ fontWeight: 700, fontSize: 'var(--icon-md)' }}>B</span>,  toggle: e => e.chain().focus().toggleBold().run()       },
  { key: 'italic',     render: () => <span style={{ fontStyle: 'italic', fontSize: 'var(--icon-md)' }}>I</span>, toggle: e => e.chain().focus().toggleItalic().run()     },
  { key: 'bulletList', render: () => <i className="ti ti-list" style={{ fontSize: 'var(--icon-sm)' }} />,     toggle: e => e.chain().focus().toggleBulletList().run() },
]

function AddTextCardForm({ onSave, onCancel }) {
  const [color, setColor] = useState('amber')
  const colors = COLORS[color]
  const onSaveRef = useRef(onSave)
  const onCancelRef = useRef(onCancel)
  onSaveRef.current = onSave
  onCancelRef.current = onCancel

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write something…' }),
    ],
    autofocus: true,
    editorProps: {
      attributes: {
        class: 'brain-dump-editor',
      },
      handleKeyDown: (_view, e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          // Read fresh values via refs to avoid stale closure
          const html = _view.dom.closest('[data-add-form]')
            ?.__editorGetHTML?.()
          // Fallback: trigger blur which calls onSave via the effect below
          document.activeElement?.blur()
          return true
        }
        if (e.key === 'Escape') { onCancelRef.current(); return true }
        return false
      },
    },
  })

  // Simpler ⌘Enter: listen globally while this form is mounted
  useEffect(() => {
    function handle(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const html = editor?.getHTML()
        if (html && html !== '<p></p>') onSaveRef.current(html, color)
        else onCancelRef.current()
      }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [editor, color])

  function handleSave() {
    const html = editor?.getHTML()
    if (html && html !== '<p></p>') onSave(html, color)
    else onCancel()
  }

  const [marks, setMarks] = useState({ bold: false, italic: false, bulletList: false })
  useEffect(() => {
    if (!editor) return
    const sync = () => setMarks({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      bulletList: editor.isActive('bulletList'),
    })
    editor.on('selectionUpdate', sync)
    editor.on('transaction', sync)
    return () => { editor.off('selectionUpdate', sync); editor.off('transaction', sync) }
  }, [editor])

  return (
    <div
      className="rounded-xl flex flex-col overflow-hidden"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderTop: `3px solid ${colors.accent}`,
        minHeight: '180px',
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-px px-3 pt-3 pb-1"
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
      </div>

      {/* Editor */}
      <div className="flex-1 px-4 pb-2" style={{ minHeight: '80px' }}>
        <EditorContent
          editor={editor}
          className="w-full"
          style={{ color: colors.fg }}
        />
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 flex items-center justify-between" style={{ borderTop: `1px solid ${colors.border}` }}>
        <div className="flex gap-1.5">
          {COLOR_LIST.map(c => (
            <button
              key={c}
              className="w-3 h-3 rounded-full transition-transform hover:scale-125"
              style={{
                backgroundColor: COLORS[c].accent,
                boxShadow: color === c ? `0 0 0 2px ${colors.bg}, 0 0 0 3.5px ${COLORS[c].accent}` : 'none',
              }}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
        </div>
        <div className="flex gap-1 shrink-0">
          <button className="btn text-xs" style={{ height: '24px', padding: '0 8px' }} onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary text-xs" style={{ height: '24px', padding: '0 8px' }} onClick={handleSave}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

function UploadingSkeleton() {
  return (
    <div
      className="rounded-xl animate-pulse overflow-hidden"
      style={{
        backgroundColor: 'var(--color-elevated)',
        border: '1px solid var(--border-default)',
        borderTop: '3px solid var(--border-strong)',
        minHeight: '220px',
      }}
    >
      <div className="p-4 flex flex-col gap-2.5 mt-2">
        <div className="h-2.5 rounded-full w-3/5" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
        <div className="h-2.5 rounded-full w-4/5" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
        <div className="h-2.5 rounded-full w-2/5" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
      </div>
      <div className="mx-4 mt-3 rounded-lg" style={{ height: '100px', backgroundColor: 'var(--color-elevated-hi)' }} />
    </div>
  )
}

export default function BrainDumpCanvas({ cards, onCreateCard, onCreateImageCard, onUpdateCard, onDeleteCard }) {
  const [addMode, setAddMode] = useState(null) // null | 'text'
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const toast = useToast()

  // Clipboard paste: detect image and upload
  useEffect(() => {
    async function handlePaste(e) {
      const active = document.activeElement
      if (active?.isContentEditable || active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return
      const items = Array.from(e.clipboardData?.items ?? [])
      const imageItem = items.find(item => item.type.startsWith('image/'))
      if (!imageItem) return
      e.preventDefault()
      const file = imageItem.getAsFile()
      if (!file) return
      setUploading(true)
      const result = await onCreateImageCard(file, 'amber')
      setUploading(false)
      if (result?.error) {
        toast('Image upload failed — make sure the brain-dump-images bucket exists and is set to Public in Supabase Storage', 'error')
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [onCreateImageCard, toast])

  async function handleFileSelected(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    const result = await onCreateImageCard(file, 'amber')
    setUploading(false)
    if (result?.error) {
      toast('Image upload failed — make sure the brain-dump-images bucket exists and is set to Public in Supabase Storage', 'error')
    }
  }

  async function handleAddText(html, color) {
    await onCreateCard(html, color, 'sticky')
    setAddMode(null)
  }

  const showGrid = cards.length > 0 || addMode || uploading

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center gap-2 mb-5">
        <button
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:border-white/20"
          style={{
            backgroundColor: 'var(--color-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--color-muted)',
          }}
          onClick={() => setAddMode('text')}
        >
          <i className="ti ti-text-size" style={{ fontSize: 'var(--icon-md)' }} />
          Text note
        </button>
        <button
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:border-white/20"
          style={{
            backgroundColor: 'var(--color-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--color-muted)',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <i className="ti ti-photo" style={{ fontSize: 'var(--icon-md)' }} />
          Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />
        <span className="ml-auto text-xs hidden sm:block" style={{ color: 'var(--color-subtle)' }}>
          <kbd
            className="px-1 py-0.5 rounded text-xs"
            style={{
              backgroundColor: 'var(--color-elevated)',
              border: '1px solid var(--border-strong)',
              fontFamily: 'inherit',
              color: 'var(--color-muted)',
            }}
          >⌘V</kbd>
          {' '}to paste a screenshot
        </span>
      </div>

      {/* Empty state */}
      {!showGrid && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--color-elevated)', border: '1px solid var(--border-default)' }}
          >
            <i className="ti ti-bulb" style={{ fontSize: 'var(--icon-xl)', color: 'var(--color-subtle)' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>No cards yet</p>
          <p className="text-xs mb-6 max-w-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            Capture rough concepts, visual inspo, and ideas before they become tasks.
          </p>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary" onClick={() => setAddMode('text')}>
              <i className="ti ti-text-size" style={{ fontSize: 'var(--icon-md)' }} />
              Text note
            </button>
            <button className="btn" onClick={() => fileInputRef.current?.click()}>
              <i className="ti ti-photo" style={{ fontSize: 'var(--icon-md)' }} />
              Image
            </button>
          </div>
        </div>
      )}

      {/* Card grid */}
      {showGrid && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem',
            alignItems: 'start',
          }}
        >
          {cards.map(card => (
            <BrainDumpCard
              key={card.id}
              card={card}
              onUpdate={fields => onUpdateCard(card.id, fields)}
              onDelete={() => onDeleteCard(card.id)}
            />
          ))}

          {addMode === 'text' && (
            <AddTextCardForm
              onSave={handleAddText}
              onCancel={() => setAddMode(null)}
            />
          )}

          {uploading && <UploadingSkeleton />}
        </div>
      )}
    </div>
  )
}
