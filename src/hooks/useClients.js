import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TASK_SELECT = `
  *,
  task_groups(
    id,
    tasks(id, status, due_date, updated_at)
  )
`

function computeStats(taskGroups) {
  const today = new Date().toISOString().split('T')[0]
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)) // Monday
  startOfWeek.setHours(0, 0, 0, 0)

  const tasks = (taskGroups ?? []).flatMap(g => g.tasks ?? [])
  const done       = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const todo       = tasks.filter(t => t.status === 'todo').length
  const blocked    = tasks.filter(t => t.status === 'blocked').length
  const overdue    = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length
  const doneThisWeek = tasks.filter(t => t.status === 'done' && new Date(t.updated_at) >= startOfWeek).length

  return {
    total: tasks.length,
    groupCount: (taskGroups ?? []).length,
    done, inProgress, todo, blocked, overdue, doneThisWeek,
  }
}

function enrich(client) {
  return { ...client, _stats: computeStats(client.task_groups) }
}

export function useClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('clients')
      .select(TASK_SELECT)
      .neq('status', 'archived')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error)
        else setClients((data ?? []).map(enrich))
        setLoading(false)
      })
  }, [])

  const globalStats = {
    activeClients: clients.length,
    openTasks:     clients.reduce((s, c) => s + c._stats.inProgress + c._stats.todo, 0),
    overdue:       clients.reduce((s, c) => s + c._stats.overdue, 0),
    doneThisWeek:  clients.reduce((s, c) => s + c._stats.doneThisWeek, 0),
  }

  async function createClient(fields, logoFile) {
    const { data: { user } } = await supabase.auth.getUser()

    let logo_url = null
    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const { data: upload, error: uploadError } = await supabase.storage
        .from('client-logos')
        .upload(`${user.id}/${Date.now()}.${ext}`, logoFile, { contentType: logoFile.type })
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('client-logos').getPublicUrl(upload.path)
        logo_url = publicUrl
      }
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({ ...fields, logo_url, owner_id: user.id })
      .select(TASK_SELECT)
      .single()
    if (!error) setClients(prev => [enrich(data), ...prev])
    return { data, error }
  }

  async function archiveClient(id) {
    const { error } = await supabase.from('clients').update({ status: 'archived' }).eq('id', id)
    if (!error) setClients(prev => prev.filter(c => c.id !== id))
    return { error }
  }

  async function updateClient(id, fields, logoFile) {
    let updatedFields = { ...fields }
    if (logoFile) {
      const { data: { user } } = await supabase.auth.getUser()
      const ext = logoFile.name.split('.').pop()
      const { data: upload, error: uploadError } = await supabase.storage
        .from('client-logos')
        .upload(`${user.id}/${Date.now()}.${ext}`, logoFile, { contentType: logoFile.type })
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('client-logos').getPublicUrl(upload.path)
        updatedFields.logo_url = publicUrl
      }
    }
    const { data, error } = await supabase
      .from('clients')
      .update(updatedFields)
      .eq('id', id)
      .select(TASK_SELECT)
      .single()
    if (!error) setClients(prev => prev.map(c => c.id === id ? enrich(data) : c))
    return { data, error }
  }

  async function pauseClient(id) {
    const client = clients.find(c => c.id === id)
    if (!client) return { error: new Error('Client not found') }
    const newStatus = client.status === 'paused' ? 'active' : 'paused'
    const { data, error } = await supabase
      .from('clients')
      .update({ status: newStatus })
      .eq('id', id)
      .select(TASK_SELECT)
      .single()
    if (!error) setClients(prev => prev.map(c => c.id === id ? enrich(data) : c))
    return { data, error }
  }

  async function cloneClientStructure(sourceClientId, targetClientId) {
    const { data: sourceGroups, error: fetchError } = await supabase
      .from('task_groups')
      .select('id, name, color, sort_order, tasks(id, title, priority, sort_order)')
      .eq('client_id', sourceClientId)
      .order('sort_order')
    if (fetchError || !sourceGroups?.length) return { error: fetchError }

    for (const group of sourceGroups) {
      const { data: newGroup, error: groupError } = await supabase
        .from('task_groups')
        .insert({ client_id: targetClientId, name: group.name, color: group.color, sort_order: group.sort_order })
        .select('id')
        .single()
      if (groupError || !newGroup) continue

      const tasks = (group.tasks ?? [])
      if (tasks.length) {
        await supabase.from('tasks').insert(
          tasks.map(t => ({
            group_id: newGroup.id,
            title: t.title,
            priority: t.priority ?? 'normal',
            sort_order: t.sort_order,
            status: 'todo',
            due_date: null,
            assigned_to: null,
          }))
        )
      }
    }
    return { error: null }
  }

  return { clients, loading, error, globalStats, createClient, archiveClient, updateClient, pauseClient, cloneClientStructure }
}
