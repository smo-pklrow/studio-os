import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

function getStatusStyle(value) {
  return STATUS_OPTIONS.find(s => s.value === value) ?? STATUS_OPTIONS[0]
}

function formatDue(str) {
  if (!str) return null
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDueState(task) {
  if (!task.due_date || task.status === 'done') return 'normal'
  const today = new Date().toISOString().split('T')[0]
  if (task.due_date < today) return 'overdue'
  if (task.due_date === today) return 'today'
  return 'normal'
}

export default function TaskRow({ task, onUpdate, onDelete }) {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const [statusOpen, setStatusOpen]   = useState(false)
  const [dateEditing, setDateEditing] = useState(false)
  const [titleEditing, setTitleEditing] = useState(false)
  const [titleValue, setTitleValue]   = useState('')
  const statusRef  = useRef(null)
  const navTimer   = useRef(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  useEffect(() => {
    if (!statusOpen) return
    function handle(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [statusOpen])

  useEffect(() => {
    return () => { if (navTimer.current) clearTimeout(navTimer.current) }
  }, [])

  const isDone   = task.status === 'done'
  const status   = getStatusStyle(task.status)
  const priority = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.normal
  const dueState = getDueState(task)

  function handleTitleClick() {
    if (navTimer.current) {
      clearTimeout(navTimer.current)
      navTimer.current = null
      return
    }
    navTimer.current = setTimeout(() => {
      navTimer.current = null
      navigate(`/client/${clientId}/task/${task.id}`)
    }, 280)
  }

  function handleTitleDoubleClick() {
    if (navTimer.current) {
      clearTimeout(navTimer.current)
      navTimer.current = null
    }
    setTitleEditing(true)
    setTitleValue(task.title)
  }

  function handleTitleSave() {
    if (titleValue.trim() && titleValue.trim() !== task.title) {
      onUpdate({ title: titleValue.trim() })
    }
    setTitleEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      className="group grid items-center gap-3 px-1 py-2 rounded-lg hover:bg-dark-elevated transition-colors"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        gridTemplateColumns: '16px 1fr 120px 72px 72px 28px',
      }}
    >
      {/* Drag handle */}
      <div
        className="flex items-center justify-center text-dark-subtle opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity select-none"
        {...attributes}
        {...listeners}
      >
        ⠿
      </div>

      {/* Checkbox + title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          className="shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors"
          style={{
            backgroundColor: isDone ? 'var(--color-brand)' : 'transparent',
            border: isDone ? 'none' : '1.5px solid var(--border-strong)',
          }}
          onClick={() => onUpdate({ status: isDone ? 'todo' : 'done' })}
        >
          {isDone && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3l2 2 4-4" stroke="var(--color-bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {titleEditing ? (
          <input
            autoFocus
            className="flex-1 min-w-0 text-sm text-dark-text bg-transparent border-b border-brand-green focus:outline-none"
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleTitleSave()
              if (e.key === 'Escape') { setTitleEditing(false); setTitleValue(task.title) }
            }}
            onBlur={handleTitleSave}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          />
        ) : (
          <span
            className={`text-sm truncate select-none ${isDone ? 'text-dark-subtle line-through' : 'text-dark-text hover:underline cursor-pointer'}`}
            onClick={handleTitleClick}
            onDoubleClick={handleTitleDoubleClick}
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Status dropdown */}
      <div className="relative" ref={statusRef}>
        <button
          className={`badge ${status.cls} cursor-pointer w-full justify-center`}
          onClick={() => setStatusOpen(v => !v)}
        >
          {status.label}
        </button>
        {statusOpen && (
          <div className="absolute left-0 top-7 card card-elevated z-20 min-w-[136px] py-1">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className="w-full text-left px-3 py-1.5 text-xs text-dark-text hover:bg-dark-elevated transition-colors"
                onClick={() => { onUpdate({ status: opt.value }); setStatusOpen(false) }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Due date — click to open date picker */}
      <div>
        {dateEditing ? (
          <input
            type="date"
            autoFocus
            className="w-[88px] bg-dark-elevated border border-brand-green rounded px-1.5 py-0.5 text-xs text-dark-text focus:outline-none"
            defaultValue={task.due_date ?? ''}
            onChange={e => {
              onUpdate({ due_date: e.target.value || null })
              setDateEditing(false)
            }}
            onBlur={() => setDateEditing(false)}
            onKeyDown={e => e.key === 'Escape' && setDateEditing(false)}
          />
        ) : (
          <span
            className={`text-xs tabular-nums cursor-pointer hover:underline ${
              dueState === 'overdue' || dueState === 'today'
                ? 'text-amber-400 font-medium'
                : 'text-dark-muted'
            }`}
            onClick={() => setDateEditing(true)}
          >
            {formatDue(task.due_date) ?? '—'}
          </span>
        )}
      </div>

      {/* Priority — click to cycle */}
      <button
        className={`badge ${priority.cls} cursor-pointer hover:opacity-75 transition-opacity`}
        onClick={() => onUpdate({ priority: PRIORITY_CYCLE[task.priority ?? 'normal'] })}
      >
        {priority.label}
      </button>

      {/* Delete */}
      <button
        className="w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-dark-elevated text-dark-subtle hover:text-red-400 transition-all text-base leading-none"
        onClick={onDelete}
      >
        ×
      </button>
    </div>
  )
}
