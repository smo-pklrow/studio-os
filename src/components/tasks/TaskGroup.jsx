import { useState } from 'react'
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

export default function TaskGroup({ group, onCreateTask, onUpdateTask, onDeleteTask, onReorder }) {
  const [collapsed, setCollapsed] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const doneCount = group.tasks.filter(t => t.status === 'done').length

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIdx = group.tasks.findIndex(t => t.id === active.id)
    const newIdx = group.tasks.findIndex(t => t.id === over.id)
    onReorder(group.id, arrayMove(group.tasks, oldIdx, newIdx).map(t => t.id))
  }

  return (
    <div className="mb-2">
      {/* Group header */}
      <div className="flex items-center gap-2.5 py-3">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
        <h3 className="text-dark-text font-medium text-sm">{group.name}</h3>
        <span className="text-dark-subtle text-xs">
          {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
          {doneCount > 0 && ` · ${doneCount} done`}
        </span>
        <button
          className="ml-auto text-dark-subtle hover:text-dark-muted transition-colors text-xs w-6 h-6 flex items-center justify-center"
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
