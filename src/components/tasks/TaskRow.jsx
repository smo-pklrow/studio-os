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

// Deterministic color per name so each person always gets the same avatar color
const AVATAR_COLORS = ['#378ADD', '#1D9E75', '#E85C4A', '#9B59B6', '#F4A623', '#E91E63', '#00BCD4', '#607D8B']
function nameColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
function nameInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getRecentNames() {
  try { return JSON.parse(localStorage.getItem('assignee-recent') ?? '[]') } catch { return [] }
}
function saveRecentName(name) {
  const next = [name, ...getRecentNames().filter(n => n !== name)].slice(0, 8)
  localStorage.setItem('assignee-recent', JSON.stringify(next))
}

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
  const [statusOpen, setStatusOpen]       = useState(false)
  const [assigneeOpen, setAssigneeOpen]   = useState(false)
  const [assigneeInput, setAssigneeInput] = useState('')
  const [recentNames, setRecentNames]     = useState([])
  const [dateEditing, setDateEditing]     = useState(false)
  const [titleEditing, setTitleEditing]   = useState(false)
  const [titleValue, setTitleValue]       = useState('')
  const [checkPop, setCheckPop]           = useState(false)
  const statusRef   = useRef(null)
  const assigneeRef = useRef(null)
  const navTimer    = useRef(null)
  const prevDone    = useRef(task.status === 'done')

  useEffect(() => {
    const nowDone = task.status === 'done'
    if (nowDone && !prevDone.current) {
      setCheckPop(true)
      const t = setTimeout(() => setCheckPop(false), 280)
      return () => clearTimeout(t)
    }
    prevDone.current = nowDone
  }, [task.status])

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
    if (!assigneeOpen) return
    setAssigneeInput('')
    setRecentNames(getRecentNames())
    function handle(e) {
      if (assigneeRef.current && !assigneeRef.current.contains(e.target)) setAssigneeOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [assigneeOpen])

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

  function handleAssigneeConfirm(name) {
    const trimmed = name.trim()
    if (trimmed) {
      onUpdate({ assigned_to: trimmed })
      saveRecentName(trimmed)
    }
    setAssigneeOpen(false)
  }

  function handleAssigneeClear() {
    onUpdate({ assigned_to: null })
    setAssigneeOpen(false)
  }

  const filteredRecent = recentNames.filter(n =>
    !assigneeInput || n.toLowerCase().includes(assigneeInput.toLowerCase())
  )

  return (
    <div
      ref={setNodeRef}
      className="group grid items-center gap-3 px-1 py-2 rounded-lg hover:bg-dark-elevated transition-colors"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        gridTemplateColumns: '16px 1fr 40px 120px 72px 72px 28px',
      }}
    >
      {/* Drag handle */}
      <div
        className="tooltip flex items-center justify-center text-dark-subtle opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity select-none"
        data-tip="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <i className="ti ti-grip-vertical" style={{ fontSize: '14px' }} />
      </div>

      {/* Checkbox + title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          className="shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors"
          style={{
            backgroundColor: isDone ? 'var(--color-brand)' : 'transparent',
            border: isDone ? 'none' : '1.5px solid var(--border-strong)',
            animation: checkPop ? 'checkbox-pop 280ms var(--ease-out)' : 'none',
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
            className={`tooltip text-sm truncate select-none ${isDone ? 'task-title-done' : 'text-dark-text hover:underline cursor-pointer'}`}
            data-tip="Click to open · Double-click to rename"
            onClick={handleTitleClick}
            onDoubleClick={handleTitleDoubleClick}
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Assignee avatar — click to assign */}
      <div className="relative flex justify-center" ref={assigneeRef}>
        <button
          className="tooltip"
          data-tip={task.assigned_to ? `${task.assigned_to} — click to reassign` : 'Assign to someone'}
          onClick={() => setAssigneeOpen(v => !v)}
        >
          {task.assigned_to ? (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-medium select-none"
              style={{ backgroundColor: nameColor(task.assigned_to), fontSize: '9px', letterSpacing: '0.02em' }}
            >
              {nameInitials(task.assigned_to)}
            </div>
          ) : (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity"
              style={{ border: '1.5px dashed var(--border-strong)', color: 'var(--color-subtle)' }}
            >
              <i className="ti ti-user-plus" style={{ fontSize: '10px' }} />
            </div>
          )}
        </button>

        {assigneeOpen && (
          <div
            className="absolute z-30 card card-elevated py-2 px-2"
            style={{ top: '32px', left: '50%', transform: 'translateX(-50%)', width: '176px' }}
          >
            <input
              autoFocus
              className="w-full rounded-md px-2 py-1.5 text-xs text-dark-text placeholder:text-dark-subtle focus:outline-none mb-2"
              style={{ backgroundColor: 'var(--color-elevated)', border: '1px solid var(--border-default)' }}
              placeholder="Type a name…"
              value={assigneeInput}
              onChange={e => setAssigneeInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && assigneeInput.trim()) handleAssigneeConfirm(assigneeInput)
                if (e.key === 'Escape') setAssigneeOpen(false)
              }}
            />
            {filteredRecent.length > 0 && (
              <>
                <p className="text-xs px-1 mb-1" style={{ color: 'var(--color-subtle)' }}>Recent</p>
                {filteredRecent.map(name => (
                  <button
                    key={name}
                    className="w-full flex items-center gap-2 px-1 py-1 rounded hover:bg-dark-elevated transition-colors text-left"
                    onClick={() => handleAssigneeConfirm(name)}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: nameColor(name), fontSize: '8px', fontWeight: 500 }}
                    >
                      {nameInitials(name)}
                    </div>
                    <span className="text-xs truncate" style={{ color: 'var(--color-text)' }}>{name}</span>
                    {name === task.assigned_to && (
                      <i className="ti ti-check ml-auto shrink-0" style={{ fontSize: '11px', color: 'var(--color-brand)' }} />
                    )}
                  </button>
                ))}
              </>
            )}
            {task.assigned_to && (
              <button
                className="w-full flex items-center gap-2 px-1 py-1.5 rounded hover:bg-dark-elevated transition-colors text-left mt-1"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
                onClick={handleAssigneeClear}
              >
                <i className="ti ti-user-x" style={{ fontSize: '11px', color: 'var(--color-subtle)' }} />
                <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>Remove assignee</span>
              </button>
            )}
          </div>
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
        className={`tooltip badge ${priority.cls} cursor-pointer hover:opacity-75 transition-opacity`}
        data-tip="Click to change priority"
        onClick={() => onUpdate({ priority: PRIORITY_CYCLE[task.priority ?? 'normal'] })}
      >
        {priority.label}
      </button>

      {/* Delete */}
      <button
        className="tooltip w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-dark-elevated text-dark-subtle hover:text-red-400 transition-all"
        data-tip="Delete task"
        aria-label="Delete task"
        onClick={onDelete}
      >
        <i className="ti ti-x" style={{ fontSize: '12px' }} />
      </button>
    </div>
  )
}
