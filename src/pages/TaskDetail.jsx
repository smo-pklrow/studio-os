import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy, useSortable, arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTaskDetail } from '../hooks/useTaskDetail'

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To do',       cls: 'badge-gray'  },
  { value: 'in_progress', label: 'In progress',  cls: 'badge-blue'  },
  { value: 'done',        label: 'Done',         cls: 'badge-green' },
  { value: 'blocked',     label: 'Blocked',      cls: 'badge-red'   },
]
const PRIORITY_STYLE = {
  high:   { label: 'High',   cls: 'badge-amber' },
  normal: { label: 'Normal', cls: 'badge-gray'  },
  low:    { label: 'Low',    cls: 'badge-gray'  },
}
const PRIORITY_CYCLE = { normal: 'high', high: 'low', low: 'normal' }

function getStatus(val) { return STATUS_OPTIONS.find(s => s.value === val) ?? STATUS_OPTIONS[0] }
function formatDate(str) {
  if (!str) return null
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function formatNoteDate(str) {
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

// ─── Sortable inspo tile ──────────────────────────────────────────────────────

function SortableInspoTile({ item, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  let domain = ''
  if (item.type === 'link') {
    try { domain = new URL(item.content).hostname.replace('www.', '') } catch { domain = '' }
  }

  return (
    <div
      ref={setNodeRef}
      className="relative group rounded-lg overflow-hidden"
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1 }}
      {...attributes}
      {...listeners}
    >
      {item.type === 'image' ? (
        <div className="aspect-square bg-dark-elevated">
          <img src={item.content} alt={item.caption || ''} className="w-full h-full object-cover" />
          {item.caption && (
            <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/60">
              <p className="text-xs text-white truncate">{item.caption}</p>
            </div>
          )}
        </div>
      ) : item.type === 'link' ? (
        <div className="p-2.5 min-h-[72px] flex flex-col justify-end bg-dark-elevated border border-dark-border">
          {domain && <p className="text-xs text-dark-subtle truncate mb-0.5">{domain}</p>}
          <p className="text-xs text-dark-text font-medium leading-snug line-clamp-3">
            {item.caption || item.content}
          </p>
        </div>
      ) : (
        <div
          className="p-2.5 min-h-[72px] flex flex-col justify-end"
          style={{ backgroundColor: 'var(--color-amber-bg)' }}
        >
          <p className="text-xs leading-snug line-clamp-4" style={{ color: 'var(--color-amber-fg)' }}>
            {item.content}
          </p>
        </div>
      )}
      <button
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-black/50 text-white text-xs flex items-center justify-center transition-opacity"
        onClick={e => { e.stopPropagation(); onDelete() }}
        onPointerDown={e => e.stopPropagation()}
      >
        ×
      </button>
    </div>
  )
}

// ─── Section card header ──────────────────────────────────────────────────────

function SectionHeader({ label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-3.5 h-3.5 border rounded-sm shrink-0" style={{ borderColor: 'var(--border-strong)' }} />
      <span className="text-sm font-medium text-dark-text">{label}</span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TaskDetail() {
  const { clientId, taskId } = useParams()
  const navigate = useNavigate()

  const {
    task, subtasks, notes, files, inspoItems, taskLinks, loading,
    updateTask, createSubtask, updateSubtask, deleteSubtask,
    createNote, deleteNote, uploadFile, deleteFile, getFileUrl,
    createInspoItem, deleteInspoItem, reorderInspoItems,
    createTaskLink, deleteTaskLink,
  } = useTaskDetail(taskId)

  // Title
  const [titleEditing, setTitleEditing] = useState(false)
  const [titleValue, setTitleValue]     = useState('')
  // Description
  const [descEditing, setDescEditing]   = useState(false)
  const [descValue, setDescValue]       = useState('')
  // Status dropdown
  const [statusOpen, setStatusOpen]     = useState(false)
  const statusRef = useRef(null)
  // Due date
  const [dateEditing, setDateEditing]   = useState(false)
  // Subtask add
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [newSubtask, setNewSubtask]       = useState('')
  // Note add
  const [newNote, setNewNote] = useState('')
  // Inspo add
  const [inspoMode, setInspoMode]       = useState(null) // null | 'note' | 'link' | 'image'
  const [inspoContent, setInspoContent] = useState('')
  const [inspoCaption, setInspoCaption] = useState('')
  // Task link add
  const [addingLink, setAddingLink]     = useState(false)
  const [linkUrl, setLinkUrl]           = useState('')
  const [linkLabel, setLinkLabel]       = useState('')
  // File upload
  const fileInputRef = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (!statusOpen) return
    function handle(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [statusOpen])

  function handleTitleSave() {
    if (titleValue.trim() && titleValue.trim() !== task?.title) updateTask({ title: titleValue.trim() })
    setTitleEditing(false)
  }

  function handleDescSave() {
    if (descValue !== (task?.description ?? '')) updateTask({ description: descValue || null })
    setDescEditing(false)
  }

  async function handleAddSubtask(e) {
    e.preventDefault()
    if (!newSubtask.trim()) return
    await createSubtask(newSubtask.trim())
    setNewSubtask('')
    setAddingSubtask(false)
  }

  async function handleAddNote() {
    if (!newNote.trim()) return
    await createNote(newNote.trim())
    setNewNote('')
  }

  async function handleAddInspo(e) {
    e.preventDefault()
    if (!inspoContent.trim()) return
    await createInspoItem(inspoMode, inspoContent.trim(), inspoCaption.trim())
    setInspoContent('')
    setInspoCaption('')
    setInspoMode(null)
  }

  async function handleAddLink(e) {
    e.preventDefault()
    if (!linkUrl.trim() || !linkLabel.trim()) return
    await createTaskLink(linkUrl.trim(), linkLabel.trim())
    setLinkUrl('')
    setLinkLabel('')
    setAddingLink(false)
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    await uploadFile(file)
    fileInputRef.current.value = ''
  }

  async function handleDownload(file) {
    const url = await getFileUrl(file.storage_path)
    if (url) window.open(url, '_blank')
  }

  function handleInspoDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIdx = inspoItems.findIndex(i => i.id === active.id)
    const newIdx = inspoItems.findIndex(i => i.id === over.id)
    reorderInspoItems(arrayMove(inspoItems, oldIdx, newIdx).map(i => i.id))
  }

  const client    = task?.task_groups?.clients
  const group     = task?.task_groups
  const status    = getStatus(task?.status)
  const priority  = PRIORITY_STYLE[task?.priority] ?? PRIORITY_STYLE.normal

  if (loading) return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <p className="text-dark-muted text-sm">Loading…</p>
    </div>
  )

  if (!task) return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <p className="text-dark-muted text-sm">Task not found.</p>
      <button className="btn mt-4" onClick={() => navigate(-1)}>Go back</button>
    </div>
  )

  return (
    <div className="flex flex-col flex-1">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6 py-5">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-4 text-xs text-dark-muted flex-wrap">
            <button className="hover:text-dark-text transition-colors" onClick={() => navigate('/')}>All clients</button>
            <span className="text-dark-subtle">›</span>
            <button className="hover:text-dark-text transition-colors" onClick={() => navigate(`/client/${clientId}`)}>
              {client?.name}
            </button>
            <span className="text-dark-subtle">›</span>
            <span className="text-dark-subtle">{group?.name}</span>
            <span className="text-dark-subtle">›</span>
            <span className="text-dark-text truncate max-w-[160px]">{task.title}</span>
          </nav>

          {/* Title */}
          {titleEditing ? (
            <input
              autoFocus
              className="text-2xl font-semibold text-dark-text bg-transparent border-b-2 border-brand-green w-full focus:outline-none mb-4"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleTitleSave()
                if (e.key === 'Escape') { setTitleEditing(false); setTitleValue(task.title) }
              }}
              onBlur={handleTitleSave}
            />
          ) : (
            <h1
              className="text-2xl font-semibold text-dark-text cursor-pointer hover:opacity-80 transition-opacity mb-4"
              onClick={() => { setTitleEditing(true); setTitleValue(task.title) }}
            >
              {task.title}
            </h1>
          )}

          {/* Status / due / priority chips */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Status */}
            <div className="relative" ref={statusRef}>
              <button
                className={`badge ${status.cls} cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => setStatusOpen(v => !v)}
              >
                {status.label}
              </button>
              {statusOpen && (
                <div className="absolute left-0 top-7 card card-elevated z-20 min-w-[148px] py-1">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-dark-elevated transition-colors flex items-center gap-2"
                      onClick={() => { updateTask({ status: opt.value }); setStatusOpen(false) }}
                    >
                      <span className={`badge ${opt.cls}`}>{opt.label}</span>
                      {opt.value === task.status && <span className="text-dark-subtle ml-auto">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Due date */}
            {dateEditing ? (
              <input
                type="date"
                autoFocus
                className="badge badge-gray bg-dark-elevated border border-brand-green rounded text-xs focus:outline-none px-2 py-1"
                defaultValue={task.due_date ?? ''}
                onChange={e => { updateTask({ due_date: e.target.value || null }); setDateEditing(false) }}
                onBlur={() => setDateEditing(false)}
                onKeyDown={e => e.key === 'Escape' && setDateEditing(false)}
              />
            ) : (
              <button
                className="badge badge-gray cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setDateEditing(true)}
              >
                {task.due_date ? `Due ${formatDate(task.due_date)}` : 'No due date'}
              </button>
            )}

            {/* Priority */}
            <button
              className={`badge ${priority.cls} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => updateTask({ priority: PRIORITY_CYCLE[task.priority ?? 'normal'] })}
            >
              {priority.label} priority
            </button>
          </div>
        </div>
      </header>

      {/* ── Two-column main ───────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-6">
        <div className="flex gap-6 items-start">

          {/* ── Left column ───────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Description */}
            <div className="card p-5">
              <SectionHeader label="Description" />
              {descEditing ? (
                <textarea
                  autoFocus
                  className="w-full text-sm text-dark-text bg-transparent focus:outline-none resize-none min-h-[80px]"
                  value={descValue}
                  onChange={e => setDescValue(e.target.value)}
                  onBlur={handleDescSave}
                  onKeyDown={e => e.key === 'Escape' && setDescEditing(false)}
                  placeholder="Add a description…"
                />
              ) : (
                <div
                  className={`text-sm cursor-pointer min-h-[40px] leading-relaxed ${task.description ? 'text-dark-text' : 'text-dark-subtle'}`}
                  onClick={() => { setDescEditing(true); setDescValue(task.description ?? '') }}
                >
                  {task.description || 'Add a description…'}
                </div>
              )}
            </div>

            {/* Subtasks */}
            <div className="card p-5">
              <SectionHeader label="Subtasks" />
              <div className="flex flex-col">
                {subtasks.map(s => (
                  <div key={s.id} className="group flex items-center gap-2.5 py-1.5">
                    <button
                      className="shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: s.done ? 'var(--color-brand)' : 'transparent',
                        border: s.done ? 'none' : '1.5px solid var(--border-strong)',
                      }}
                      onClick={() => updateSubtask(s.id, { done: !s.done })}
                    >
                      {s.done && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3l2 2 4-4" stroke="var(--color-bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span className={`text-sm flex-1 ${s.done ? 'line-through text-dark-subtle' : 'text-dark-text'}`}>
                      {s.title}
                    </span>
                    <button
                      className="opacity-0 group-hover:opacity-100 text-dark-subtle hover:text-red-400 text-sm w-5 h-5 flex items-center justify-center transition-all"
                      onClick={() => deleteSubtask(s.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {addingSubtask ? (
                <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-2">
                  <input
                    autoFocus
                    className="flex-1 bg-transparent border-b border-brand-green text-sm text-dark-text focus:outline-none placeholder:text-dark-subtle"
                    placeholder="Subtask title…"
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && setAddingSubtask(false)}
                    onBlur={() => { if (!newSubtask.trim()) setAddingSubtask(false) }}
                  />
                  <button type="submit" className="btn btn-primary text-xs py-1">Add</button>
                </form>
              ) : (
                <button
                  className="flex items-center gap-1.5 text-xs text-dark-subtle hover:text-dark-muted mt-2 transition-colors"
                  onClick={() => setAddingSubtask(true)}
                >
                  + Add subtask
                </button>
              )}
            </div>

            {/* Notes */}
            <div className="card p-5">
              <SectionHeader label="Notes" />

              {notes.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                  {notes.map(n => (
                    <div
                      key={n.id}
                      className="group relative border-l-2 pl-3 py-0.5"
                      style={{ borderColor: 'var(--color-brand)' }}
                    >
                      <p className="text-sm text-dark-text leading-relaxed">{n.body}</p>
                      <span className="text-xs text-dark-subtle mt-1 block">
                        You · {formatNoteDate(n.created_at)}
                      </span>
                      <button
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-dark-subtle hover:text-red-400 text-sm w-5 h-5 flex items-center justify-center transition-all"
                        onClick={() => deleteNote(n.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border rounded-lg p-3" style={{ borderColor: 'var(--border-default)' }}>
                <textarea
                  className="w-full bg-transparent text-sm text-dark-text placeholder:text-dark-subtle focus:outline-none resize-none"
                  placeholder="Add a note…"
                  value={newNote}
                  rows={2}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && newNote.trim()) {
                      e.preventDefault()
                      handleAddNote()
                    }
                  }}
                />
                {newNote.trim() && (
                  <div className="flex justify-end mt-2">
                    <button className="btn btn-primary text-xs py-1" onClick={handleAddNote}>
                      Save note
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Claude panel shell */}
            <div className="card p-5" style={{ borderColor: 'rgba(29,158,117,0.25)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: 'var(--color-brand)' }} />
                  <span className="text-sm font-medium text-dark-text">Claude</span>
                </div>
                <span className="badge badge-green text-xs">Phase 3</span>
              </div>
              <p className="text-xs text-dark-muted leading-relaxed">
                Claude will know this client's full context — brain dump, tasks, notes, and key decisions. It will surface proactive suggestions and draft content here.
              </p>
            </div>
          </div>

          {/* ── Right sidebar ─────────────────────────────────── */}
          <div className="flex flex-col gap-4" style={{ width: '272px', flexShrink: 0 }}>

            {/* Linked calendar — Phase 3 shell */}
            <div className="card p-4">
              <SectionHeader label="Linked calendar" />
              <div
                className="border border-dashed rounded-lg p-3 text-center"
                style={{ borderColor: 'var(--border-default)' }}
              >
                <p className="text-xs text-dark-subtle">Google Calendar connected in Phase 3</p>
              </div>
            </div>

            {/* Gmail threads */}
            <div className="card p-4">
              <SectionHeader label="Gmail threads" />

              {taskLinks.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {taskLinks.map(link => {
                    let domain = ''
                    try { domain = new URL(link.url).hostname.replace('www.', '') } catch {}
                    return (
                      <div key={link.id} className="group flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-dark-text hover:underline block truncate"
                          >
                            {link.label}
                          </a>
                          {domain && <p className="text-xs text-dark-subtle truncate">{domain}</p>}
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 shrink-0 text-dark-subtle hover:text-red-400 text-sm w-4 h-4 flex items-center justify-center transition-all"
                          onClick={() => deleteTaskLink(link.id)}
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {addingLink ? (
                <form onSubmit={handleAddLink} className="flex flex-col gap-2">
                  <input
                    autoFocus
                    className="w-full bg-dark-elevated border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-dark-text placeholder:text-dark-subtle focus:outline-none focus:border-brand-green transition-colors"
                    placeholder="Thread URL"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                  />
                  <input
                    className="w-full bg-dark-elevated border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-dark-text placeholder:text-dark-subtle focus:outline-none focus:border-brand-green transition-colors"
                    placeholder="Label (e.g. Sarah K. — moodboard)"
                    value={linkLabel}
                    onChange={e => setLinkLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && setAddingLink(false)}
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary text-xs py-1 flex-1 justify-center">Save</button>
                    <button type="button" className="btn text-xs py-1" onClick={() => setAddingLink(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button
                  className="flex items-center gap-1.5 text-xs text-dark-subtle hover:text-dark-muted transition-colors"
                  onClick={() => setAddingLink(true)}
                >
                  + Link thread
                </button>
              )}
            </div>

            {/* Inspo board */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <SectionHeader label="Inspo board" />
                <span className="text-xs text-dark-subtle -mt-3">drag to reorder</span>
              </div>

              {inspoItems.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleInspoDragEnd}>
                  <SortableContext items={inspoItems.map(i => i.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {inspoItems.map(item => (
                        <SortableInspoTile
                          key={item.id}
                          item={item}
                          onDelete={() => deleteInspoItem(item.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {inspoMode ? (
                <form onSubmit={handleAddInspo} className="flex flex-col gap-2">
                  {inspoMode === 'note' ? (
                    <textarea
                      autoFocus
                      className="w-full bg-dark-elevated border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-dark-text placeholder:text-dark-subtle focus:outline-none focus:border-brand-green transition-colors resize-none"
                      placeholder="Note content…"
                      rows={3}
                      value={inspoContent}
                      onChange={e => setInspoContent(e.target.value)}
                    />
                  ) : inspoMode === 'image' ? (
                    <input
                      autoFocus
                      className="w-full bg-dark-elevated border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-dark-text placeholder:text-dark-subtle focus:outline-none focus:border-brand-green transition-colors"
                      placeholder="Image URL"
                      value={inspoContent}
                      onChange={e => setInspoContent(e.target.value)}
                    />
                  ) : (
                    <input
                      autoFocus
                      className="w-full bg-dark-elevated border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-dark-text placeholder:text-dark-subtle focus:outline-none focus:border-brand-green transition-colors"
                      placeholder="URL"
                      value={inspoContent}
                      onChange={e => setInspoContent(e.target.value)}
                    />
                  )}
                  {inspoMode !== 'note' && (
                    <input
                      className="w-full bg-dark-elevated border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-dark-text placeholder:text-dark-subtle focus:outline-none focus:border-brand-green transition-colors"
                      placeholder="Caption (optional)"
                      value={inspoCaption}
                      onChange={e => setInspoCaption(e.target.value)}
                      onKeyDown={e => e.key === 'Escape' && setInspoMode(null)}
                    />
                  )}
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary text-xs py-1 flex-1 justify-center">Add</button>
                    <button type="button" className="btn text-xs py-1" onClick={() => setInspoMode(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <button className="text-xs text-dark-subtle hover:text-dark-muted transition-colors" onClick={() => setInspoMode('note')}>+ Note</button>
                  <span className="text-dark-subtle text-xs">·</span>
                  <button className="text-xs text-dark-subtle hover:text-dark-muted transition-colors" onClick={() => setInspoMode('link')}>+ Link</button>
                  <span className="text-dark-subtle text-xs">·</span>
                  <button className="text-xs text-dark-subtle hover:text-dark-muted transition-colors" onClick={() => setInspoMode('image')}>+ Image URL</button>
                </div>
              )}
            </div>

            {/* Files */}
            <div className="card p-4">
              <SectionHeader label="Files" />

              {files.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {files.map(f => {
                    const ext = f.filename.split('.').pop()?.toLowerCase()
                    const isPdf = ext === 'pdf'
                    const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
                    return (
                      <div key={f.id} className="group flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded flex items-center justify-center shrink-0 text-xs font-mono font-bold uppercase ${
                            isPdf ? 'bg-red-900/40 text-red-400' : isImg ? 'bg-blue-900/40 text-blue-400' : 'bg-dark-elevated text-dark-subtle'
                          }`}
                        >
                          {ext}
                        </div>
                        <div className="flex-1 min-w-0">
                          <button
                            className="text-xs font-medium text-dark-text hover:underline block truncate text-left w-full"
                            onClick={() => handleDownload(f)}
                          >
                            {f.filename}
                          </button>
                          <p className="text-xs text-dark-subtle">
                            {formatBytes(f.size_bytes)}{f.size_bytes ? ' · ' : ''}{formatNoteDate(f.created_at)}
                          </p>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 shrink-0 text-dark-subtle hover:text-red-400 text-sm w-4 h-4 flex items-center justify-center transition-all"
                          onClick={() => deleteFile(f.id, f.storage_path)}
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              <button
                className="flex items-center gap-1.5 text-xs text-dark-subtle hover:text-dark-muted transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                + Upload file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
