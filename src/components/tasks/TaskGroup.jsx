import { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import TaskRow from './TaskRow'
import AddTaskRow from './AddTaskRow'

const COL_HEADERS = ['Task', 'Status', 'Due', 'Priority', '']

const GROUP_COLORS = [
  '#378ADD', '#1D9E75', '#E85C4A', '#9B59B6',
  '#F4A623', '#E91E63', '#00BCD4', '#607D8B',
]

export default function TaskGroup({ group, onCreateTask, onUpdateTask, onDeleteTask, onReorder, onUpdateGroup, onDeleteGroup }) {
  const [collapsed, setCollapsed]         = useState(false)
  const [renaming, setRenaming]           = useState(false)
  const [nameValue, setNameValue]         = useState('')
  const [colorOpen, setColorOpen]         = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const colorRef = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (!colorOpen) return
    function handle(e) {
      if (colorRef.current && !colorRef.current.contains(e.target)) setColorOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [colorOpen])

  const doneCount = group.tasks.filter(t => t.status === 'done').length

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIdx = group.tasks.findIndex(t => t.id === active.id)
    const newIdx = group.tasks.findIndex(t => t.id === over.id)
    onReorder(group.id, arrayMove(group.tasks, oldIdx, newIdx).map(t => t.id))
  }

  function saveRename() {
    if (nameValue.trim() && nameValue.trim() !== group.name) {
      onUpdateGroup(group.id, { name: nameValue.trim() })
    }
    setRenaming(false)
  }

  return (
    <div className="mb-2">
      {/* Group header */}
      <div className="group flex items-center gap-2.5 py-3">

        {/* Color dot — click for color picker */}
        <div ref={colorRef} className="relative shrink-0">
          <button
            className="w-2.5 h-2.5 rounded-full hover:scale-125 transition-transform focus:outline-none"
            style={{ backgroundColor: group.color }}
            onClick={() => setColorOpen(v => !v)}
            aria-label="Change group color"
          />
          {colorOpen && (
            <div className="absolute left-0 top-5 card card-elevated z-10 p-2 flex flex-wrap gap-1.5 w-[116px]">
              {GROUP_COLORS.map(c => (
                <button
                  key={c}
                  className="w-5 h-5 rounded-full hover:scale-110 transition-transform focus:outline-none"
                  style={{
                    backgroundColor: c,
                    boxShadow: c === group.color ? `0 0 0 2px var(--color-bg), 0 0 0 3.5px ${c}` : 'none',
                  }}
                  onClick={() => { onUpdateGroup(group.id, { color: c }); setColorOpen(false) }}
                  aria-label={c}
                />
              ))}
            </div>
          )}
        </div>

        {/* Group name — double-click to rename */}
        {renaming ? (
          <input
            autoFocus
            className="text-dark-text font-medium text-sm bg-transparent border-b border-brand-green focus:outline-none min-w-0"
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') saveRename()
              if (e.key === 'Escape') { setRenaming(false); setNameValue(group.name) }
            }}
            onBlur={saveRename}
          />
        ) : (
          <h3
            className="text-dark-text font-medium text-sm select-none cursor-default"
            onDoubleClick={() => { setRenaming(true); setNameValue(group.name) }}
            title="Double-click to rename"
          >
            {group.name}
          </h3>
        )}

        {/* Task count / delete confirmation */}
        {deleteConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Delete group + all tasks?</span>
            <button
              className="text-xs text-red-400 font-medium hover:text-red-300 transition-colors"
              onClick={() => onDeleteGroup(group.id)}
            >
              Delete
            </button>
            <button
              className="text-xs text-dark-muted hover:text-dark-text transition-colors"
              onClick={() => setDeleteConfirm(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <span className="text-dark-subtle text-xs">
            {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
            {doneCount > 0 && ` · ${doneCount} done`}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Delete trigger — appears on header hover */}
        {!deleteConfirm && !renaming && (
          <button
            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-dark-subtle hover:text-red-400 transition-all text-sm leading-none"
            onClick={() => setDeleteConfirm(true)}
            aria-label="Delete group"
          >
            ×
          </button>
        )}

        {/* Collapse toggle */}
        <button
          className="text-dark-subtle hover:text-dark-muted transition-colors text-xs w-6 h-6 flex items-center justify-center"
          onClick={() => setCollapsed(v => !v)}
          aria-label={collapsed ? 'Expand group' : 'Collapse group'}
        >
          {collapsed ? '▸' : '▾'}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Column headers */}
          <div
            className="grid items-center gap-3 px-1 pb-1"
            style={{ gridTemplateColumns: '16px 1fr 120px 72px 72px 28px' }}
          >
            <span />
            {COL_HEADERS.map((h, i) => (
              <span key={i} className="text-dark-subtle text-xs">{h}</span>
            ))}
          </div>

          {/* Sortable tasks */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={group.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {group.tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onUpdate={fields => onUpdateTask(task.id, fields)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <AddTaskRow onAdd={title => onCreateTask(group.id, title)} />
        </>
      )}

      <div className="mt-2" style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />
    </div>
  )
}
