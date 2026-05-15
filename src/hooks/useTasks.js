import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function sortedTasks(group) {
  return { ...group, tasks: [...(group.tasks ?? [])].sort((a, b) => a.sort_order - b.sort_order) }
}

export function useTasks(clientId) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!clientId) return
    supabase
      .from('task_groups')
      .select('*, tasks(*)')
      .eq('client_id', clientId)
      .order('sort_order')
      .then(({ data, error }) => {
        if (error) setError(error)
        else setGroups((data ?? []).map(sortedTasks))
        setLoading(false)
      })
  }, [clientId])

  async function createGroup(name, color = '#378ADD') {
    const maxOrder = groups.length > 0 ? Math.max(...groups.map(g => g.sort_order)) : -1
    const { data, error } = await supabase
      .from('task_groups')
      .insert({ client_id: clientId, name, color, sort_order: maxOrder + 1 })
      .select()
      .single()
    if (!error) setGroups(prev => [...prev, { ...data, tasks: [] }])
    return { data, error }
  }

  async function createTask(groupId, title) {
    const group = groups.find(g => g.id === groupId)
    const maxOrder = group?.tasks.length > 0 ? Math.max(...group.tasks.map(t => t.sort_order)) : -1
    const { data, error } = await supabase
      .from('tasks')
      .insert({ group_id: groupId, title, sort_order: maxOrder + 1 })
      .select()
      .single()
    if (!error) {
      setGroups(prev => prev.map(g =>
        g.id === groupId ? { ...g, tasks: [...g.tasks, data] } : g
      ))
    }
    return { data, error }
  }

  async function updateTask(taskId, fields) {
    const { data, error } = await supabase
      .from('tasks')
      .update(fields)
      .eq('id', taskId)
      .select()
      .single()
    if (!error) {
      setGroups(prev => prev.map(g => ({
        ...g,
        tasks: g.tasks.map(t => t.id === taskId ? data : t),
      })))
    }
    return { data, error }
  }

  async function deleteTask(taskId) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (!error) {
      setGroups(prev => prev.map(g => ({
        ...g,
        tasks: g.tasks.filter(t => t.id !== taskId),
      })))
    }
    return { error }
  }

  async function reorderTasks(groupId, newTaskIds) {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g
      const byId = Object.fromEntries(g.tasks.map(t => [t.id, t]))
      return { ...g, tasks: newTaskIds.map((id, i) => ({ ...byId[id], sort_order: i })) }
    }))
    await Promise.all(
      newTaskIds.map((id, i) => supabase.from('tasks').update({ sort_order: i }).eq('id', id))
    )
  }

  return { groups, loading, error, createGroup, createTask, updateTask, deleteTask, reorderTasks }
}
