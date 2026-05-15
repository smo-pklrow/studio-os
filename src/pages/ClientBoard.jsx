import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useClient } from '../hooks/useClient'
import { useTasks } from '../hooks/useTasks'
import { useBrainDump } from '../hooks/useBrainDump'
import ClientHeader from '../components/clients/ClientHeader'
import TaskGroup from '../components/tasks/TaskGroup'
import BrainDumpCanvas from '../components/braindump/BrainDumpCanvas'

const GROUP_COLORS = ['#378ADD', '#1D9E75', '#E85C4A', '#9B59B6', '#F4A623', '#E91E63', '#00BCD4']

function getTab(clientId) {
  return localStorage.getItem(`tab-${clientId}`) ?? 'tasks'
}

export default function ClientBoard() {
  const { clientId } = useParams()
  const [tab, setTab] = useState(() => getTab(clientId))
  const [addingGroup, setAddingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const { client } = useClient(clientId)
  const { groups, loading, createGroup, createTask, updateTask, deleteTask, reorderTasks } = useTasks(clientId)
  const { cards, createCard, updateCard, deleteCard } = useBrainDump(clientId)

  const allTasks = groups.flatMap(g => g.tasks)
  const today = new Date().toISOString().split('T')[0]
  const stats = {
    total: allTasks.length,
    done: allTasks.filter(t => t.status === 'done').length,
    overdue: allTasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length,
  }

  function switchTab(t) {
    setTab(t)
    localStorage.setItem(`tab-${clientId}`, t)
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
    <div className="min-h-dvh flex flex-col">

      <ClientHeader client={client} stats={stats} />

      {/* Tab bar */}
      <div className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6 flex gap-6">
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
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-6">

        {/* ── Tasks tab ───────────────────────────────────────── */}
        {tab === 'tasks' && (
          <div>
            {loading && (
              <p className="text-dark-muted text-sm">Loading…</p>
            )}

            {!loading && groups.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                <p className="text-dark-text text-sm font-medium mb-1">No task groups yet</p>
                <p className="text-dark-muted text-xs mb-6">Add a group to start organizing tasks.</p>
              </div>
            )}

            {groups.map(group => (
              <TaskGroup
                key={group.id}
                group={group}
                onCreateTask={createTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onReorder={reorderTasks}
              />
            ))}

            {/* New group */}
            <div className="mt-4">
              {addingGroup ? (
                <form onSubmit={handleAddGroup} className="flex items-center gap-2">
                  <input
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
          <BrainDumpCanvas
            cards={cards}
            onCreateCard={createCard}
            onUpdateCard={updateCard}
            onDeleteCard={deleteCard}
          />
        )}
      </main>
    </div>
  )
}
