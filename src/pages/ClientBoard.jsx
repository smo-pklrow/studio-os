import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useClient } from '../hooks/useClient'
import { useTasks } from '../hooks/useTasks'
import { useBrainDump } from '../hooks/useBrainDump'
import ClientHeader from '../components/clients/ClientHeader'
import TaskGroup from '../components/tasks/TaskGroup'
import BrainDumpCanvas from '../components/braindump/BrainDumpCanvas'

const GROUP_COLORS = ['#378ADD', '#1D9E75', '#E85C4A', '#9B59B6', '#F4A623', '#E91E63', '#00BCD4']

function TaskGroupSkeleton() {
  return (
    <div className="mb-8 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
        <div className="h-3 rounded w-28" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
        <div className="h-2 rounded w-12 ml-1" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
      </div>
      <div className="card overflow-hidden">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
            <div className="flex-1 h-3 rounded" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
            <div className="h-5 rounded w-16" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
            <div className="h-2 rounded w-8" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
            <div className="h-2 rounded w-14" style={{ backgroundColor: 'var(--color-elevated-hi)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SortableGroup({ group, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
    >
      <TaskGroup
        group={group}
        groupDragHandleProps={{ ...attributes, ...listeners }}
        {...props}
      />
    </div>
  )
}

function getTab(clientId) {
  return localStorage.getItem(`tab-${clientId}`) ?? 'tasks'
}

export default function ClientBoard() {
  const { clientId } = useParams()
  const [tab, setTab] = useState(() => getTab(clientId))
  const [addingGroup, setAddingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [doneToBottom, setDoneToBottom] = useState(
    () => localStorage.getItem(`done-bottom-${clientId}`) === 'true'
  )
  const addGroupInputRef = useRef(null)

  const { client, updateClient } = useClient(clientId)
  const { groups, loading, createGroup, createTask, updateTask, deleteTask, reorderTasks, updateGroup, deleteGroup, reorderGroups } = useTasks(clientId)
  const { cards, createCard, createImageCard, updateCard, deleteCard } = useBrainDump(clientId)

  const groupSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Dynamic browser theme-color matches client brand color
  useEffect(() => {
    if (!client?.color) return
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta) }
    meta.content = client.color
    return () => { meta.content = '#1E1E1C' }
  }, [client?.color])

  // N shortcut — open new group form when on tasks tab
  useEffect(() => {
    function handle(e) {
      const active  = document.activeElement
      const editing = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.isContentEditable
      if (!editing && e.key === 'n' && !e.metaKey && !e.ctrlKey && tab === 'tasks') {
        e.preventDefault()
        setAddingGroup(true)
        setTimeout(() => addGroupInputRef.current?.focus(), 50)
      }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [tab])

  const allTasks = groups.flatMap(g => g.tasks)
  const today = new Date().toISOString().split('T')[0]
  const stats = {
    total:    allTasks.length,
    done:     allTasks.filter(t => t.status === 'done').length,
    overdue:  allTasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length,
    dueToday: allTasks.filter(t => t.due_date === today && t.status !== 'done').length,
  }

  function switchTab(t) {
    setTab(t)
    localStorage.setItem(`tab-${clientId}`, t)
  }

  function toggleDoneToBottom() {
    const next = !doneToBottom
    setDoneToBottom(next)
    localStorage.setItem(`done-bottom-${clientId}`, String(next))
  }

  function handleGroupDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIdx = groups.findIndex(g => g.id === active.id)
    const newIdx = groups.findIndex(g => g.id === over.id)
    reorderGroups(arrayMove(groups, oldIdx, newIdx).map(g => g.id))
  }

  async function handleAddGroup(e) {
    e.preventDefault()
    if (!newGroupName.trim()) return
    const color = GROUP_COLORS[groups.length % GROUP_COLORS.length]
    await createGroup(newGroupName.trim(), color)
    setNewGroupName('')
    setAddingGroup(false)
  }

  return (
    <div className="flex flex-col flex-1">

      <ClientHeader client={client} stats={stats} onHealthChange={health => updateClient({ health })} />

      {/* Tab bar */}
      <div className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-6">
          {[['tasks', 'Tasks'], ['braindump', 'Brain dump']].map(([value, label]) => (
            <button
              key={value}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === value
                  ? 'border-brand-green text-dark-text'
                  : 'border-transparent text-dark-muted hover:text-dark-text'
              }`}
              onClick={() => switchTab(value)}
            >
              {label}
            </button>
          ))}

          {/* Done-to-bottom toggle — only visible on tasks tab */}
          {tab === 'tasks' && (
            <button
              className={`tooltip ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors ${
                doneToBottom
                  ? 'text-brand-green bg-brand-green/10'
                  : 'text-dark-subtle hover:text-dark-muted'
              }`}
              data-tip={doneToBottom ? 'Done tasks sorted to bottom — click to disable' : 'Sort done tasks to bottom'}
              onClick={toggleDoneToBottom}
            >
              <i className="ti ti-checks" style={{ fontSize: '13px' }} />
              Done last
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-6">

        {/* ── Tasks tab ───────────────────────────────────────── */}
        {tab === 'tasks' && (
          <div>
            {loading && (
              <div>
                <TaskGroupSkeleton />
                <TaskGroupSkeleton />
              </div>
            )}

            {!loading && groups.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                <p className="text-dark-text text-sm font-medium mb-1">No task groups yet</p>
                <p className="text-dark-muted text-xs mb-6">Add a group to start organizing tasks.</p>
              </div>
            )}

            <DndContext
              sensors={groupSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleGroupDragEnd}
            >
              <SortableContext items={groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
                {groups.map(group => (
                  <SortableGroup
                    key={group.id}
                    group={group}
                    onCreateTask={createTask}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    onReorder={reorderTasks}
                    onUpdateGroup={updateGroup}
                    onDeleteGroup={deleteGroup}
                    doneToBottom={doneToBottom}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* New group */}
            <div className="mt-4">
              {addingGroup ? (
                <form onSubmit={handleAddGroup} className="flex items-center gap-2">
                  <input
                    ref={addGroupInputRef}
                    autoFocus
                    className="bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text placeholder:text-dark-subtle focus:outline-none focus:border-brand-green transition-colors"
                    placeholder="Group name…"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && setAddingGroup(false)}
                    onBlur={() => { if (!newGroupName.trim()) setAddingGroup(false) }}
                  />
                  <button type="submit" className="btn btn-primary">Add</button>
                  <button type="button" className="btn" onClick={() => setAddingGroup(false)}>Cancel</button>
                </form>
              ) : (
                <button className="btn text-dark-subtle" onClick={() => setAddingGroup(true)}>
                  + New group
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Brain dump tab ──────────────────────────────────── */}
        {tab === 'braindump' && (
          <>
            {/* Explanation strip — always visible */}
            <div
              className="mb-6 p-4 rounded-xl flex gap-3"
              style={{ backgroundColor: 'var(--color-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--border-default)' }}
              >
                <i className="ti ti-bulb" style={{ fontSize: '15px', color: 'var(--color-brand)' }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Brain dump</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  Your unfiltered thinking space for this client. Drop rough concepts, visual inspiration, directions, and ideas before they become tasks. No structure needed — just capture it.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2.5">
                  {[
                    { icon: 'ti-text-size', label: 'Rich text — bold, italic, lists' },
                    { icon: 'ti-photo', label: 'Add images or paste screenshots (⌘V)' },
                    { icon: 'ti-palette', label: 'Hover card to recolor or delete' },
                  ].map(({ icon, label }) => (
                    <span key={label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-subtle)' }}>
                      <i className={`ti ${icon}`} style={{ fontSize: '11px' }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <BrainDumpCanvas
              cards={cards}
              onCreateCard={createCard}
              onCreateImageCard={createImageCard}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
            />
          </>
        )}
      </main>
    </div>
  )
}
