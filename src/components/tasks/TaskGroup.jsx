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

const COL_HEADERS = ['Task', 'Assign', 'Status', 'Due', 'Priority', '']

const GROUP_COLORS = [
  '#378ADD', '#1D9E75', '#E85C4A', '#9B59B6',
  '#F4A623', '#E91E63', '#00BCD4', '#607D8B',
]

export default function TaskGroup({
  group,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onReorder,
  onUpdateGroup,
  onDeleteGroup,
  groupDragHandleProps = null,
  doneToBottom = false,
}) {
  const [collapsed, setCollapsed]         = useState(false)
  const [renaming, setRenaming]           = useState(false)
  const [nameValue, setNameValue]         = useState('')
  const [colorOpen, setColorOpen]         = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isActive, setIsActive]           = useState(false)
  const colorRef  = useRef(null)
  const headerRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { rootMargin: '-8% 0px -80% 0px' }
    )
    if (headerRef.current) observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

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

  const doneCount   = group.tasks.filter(t => t.status === 'done').length
  const activeTasks = doneToBottom ? group.tasks.filter(t => t.status !== 'done') : group.tasks
  const doneTasks   = doneToBottom ? group.tasks.filter(t => t.status === 'done')  : []

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIdx = activeTasks.findIndex(t => t.id === active.id)
    const newIdx = activeTasks.findIndex(t => t.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    onReorder(group.id, arrayMove(activeTasks, oldIdx, newIdx).map(t => t.id))
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
      <div
        ref={headerRef}
        className="task-group-header group flex items-center gap-2.5 py-3"
        style={{ borderBottom: `2px solid ${group.color}73` }}
      >

        {/* Group drag handle — only rendered when parent provides groupDragHandleProps */}
        {groupDragHandleProps && (
          <div
            className="tooltip opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-dark-subtle transition-opacity shrink-0"
            data-tip="Drag to reorder group"
            {...groupDragHandleProps}
          >
            <i className="ti ti-grid-dots" style={{ fontSize: '13px' }} />
          </div>
        )}

        {/* Color dot — click for color picker; glows when group is active in viewport */}
        <div ref={colorRef} className="relative shrink-0">
          <button
            className="tooltip w-3 h-3 rounded-full hover:scale-125 transition-all duration-300 focus:outline-none"
            style={{
              backgroundColor: group.color,
              transform: isActive ? 'scale(1.25)' : 'scale(1)',
              boxShadow: isActive
                ? `0 0 0 4px ${group.color}50`
                : `0 0 0 2px ${group.color}28`,
            }}
            data-tip="Change color"
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
            className="tooltip text-dark-text font-medium text-sm select-none cursor-default"
            data-tip="Double-click to rename"
            onDoubleClick={() => { setRenaming(true); setNameValue(group.name) }}
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
            className="tooltip opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-dark-subtle hover:text-red-400 transition-all"
            data-tip="Delete group"
            onClick={() => setDeleteConfirm(true)}
            aria-label="Delete group"
          >
            <i className="ti ti-x" style={{ fontSize: '12px' }} />
          </button>
        )}

        {/* Collapse toggle */}
        <button
          className="tooltip text-dark-subtle hover:text-dark-muted transition-colors w-6 h-6 flex items-center justify-center"
          data-tip={collapsed ? 'Expand' : 'Collapse'}
          onClick={() => setCollapsed(v => !v)}
          aria-label={collapsed ? 'Expand group' : 'Collapse group'}
        >
          <i className={`ti ${collapsed ? 'ti-chevron-right' : 'ti-chevron-down'}`} style={{ fontSize: '13px' }} />
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Column headers */}
          <div
            className="grid items-center gap-3 px-1 pb-2"
            style={{
              gridTemplateColumns: '16px 1fr 40px 120px 72px 72px 28px',
              borderBottom: '1px solid var(--border-default)',
              marginBottom: '2px',
            }}
          >
            <span />
            {COL_HEADERS.map((h, i) => (
              <span key={i} className="text-dark-subtle text-xs text-center">{h}</span>
            ))}
          </div>

          {/* Sortable active tasks */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activeTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {activeTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onUpdate={fields => onUpdateTask(task.id, fields)}
                  onDelete={() => onDeleteTask(task.id)}
                  groupColor={group.color}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Done tasks pushed to bottom — only when doneToBottom is active */}
          {doneToBottom && doneTasks.length > 0 && (
            <>
              {activeTasks.length > 0 && (
                <div className="flex items-center gap-2 px-1 py-2 mt-1">
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>
                    Completed · {doneTasks.length}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
                </div>
              )}
              {doneTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onUpdate={fields => onUpdateTask(task.id, fields)}
                  onDelete={() => onDeleteTask(task.id)}
                  groupColor={group.color}
                />
              ))}
            </>
          )}

          <AddTaskRow onAdd={title => onCreateTask(group.id, title)} />
        </>
      )}

      <div className="mt-2" style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />
    </div>
  )
}
