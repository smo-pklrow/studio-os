import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const TASK_SELECT = '*, task_groups(id, name, clients(id, name))'

export function useTaskDetail(taskId) {
  const [task, setTask]           = useState(null)
  const [subtasks, setSubtasks]   = useState([])
  const [notes, setNotes]         = useState([])
  const [files, setFiles]         = useState([])
  const [inspoItems, setInspoItems] = useState([])
  const [taskLinks, setTaskLinks] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const userIdRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) userIdRef.current = user.id
    })
  }, [])

  useEffect(() => {
    if (!taskId) return
    setLoading(true)
    Promise.all([
      supabase.from('tasks').select(TASK_SELECT).eq('id', taskId).single(),
      supabase.from('subtasks').select('*').eq('task_id', taskId).order('sort_order'),
      supabase.from('notes').select('*').eq('task_id', taskId).order('created_at'),
      supabase.from('files').select('*').eq('task_id', taskId).order('created_at'),
      supabase.from('inspo_items').select('*').eq('task_id', taskId).order('sort_order'),
      supabase.from('task_links').select('*').eq('task_id', taskId).order('created_at'),
    ]).then(([taskRes, subtasksRes, notesRes, filesRes, inspoRes, linksRes]) => {
      if (taskRes.error) setError(taskRes.error)
      else setTask(taskRes.data)
      setSubtasks(subtasksRes.data ?? [])
      setNotes(notesRes.data ?? [])
      setFiles(filesRes.data ?? [])
      setInspoItems(inspoRes.data ?? [])
      setTaskLinks(linksRes.data ?? [])
      setLoading(false)
    })
  }, [taskId])

  async function updateTask(fields) {
    const { data, error } = await supabase
      .from('tasks').update(fields).eq('id', taskId).select(TASK_SELECT).single()
    if (!error) setTask(data)
    return { data, error }
  }

  async function createSubtask(title) {
    const maxOrder = subtasks.length > 0 ? Math.max(...subtasks.map(s => s.sort_order)) : -1
    const { data, error } = await supabase
      .from('subtasks').insert({ task_id: taskId, title, sort_order: maxOrder + 1 }).select().single()
    if (!error) setSubtasks(prev => [...prev, data])
    return { data, error }
  }

  async function updateSubtask(id, fields) {
    const { data, error } = await supabase
      .from('subtasks').update(fields).eq('id', id).select().single()
    if (!error) setSubtasks(prev => prev.map(s => s.id === id ? data : s))
    return { data, error }
  }

  async function deleteSubtask(id) {
    const { error } = await supabase.from('subtasks').delete().eq('id', id)
    if (!error) setSubtasks(prev => prev.filter(s => s.id !== id))
    return { error }
  }

  async function createNote(body) {
    const userId = userIdRef.current
    if (!userId) return { error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('notes').insert({ task_id: taskId, author_id: userId, body }).select().single()
    if (!error) setNotes(prev => [...prev, data])
    return { data, error }
  }

  async function deleteNote(id) {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (!error) setNotes(prev => prev.filter(n => n.id !== id))
    return { error }
  }

  async function uploadFile(file) {
    const userId = userIdRef.current
    if (!userId) return { error: new Error('Not authenticated') }
    const ext = file.name.split('.').pop()
    const path = `${userId}/${taskId}/${Date.now()}.${ext}`
    const { data: upload, error: uploadError } = await supabase.storage
      .from('task-files').upload(path, file, { contentType: file.type })
    if (uploadError) return { error: uploadError }
    const { data, error } = await supabase
      .from('files')
      .insert({ task_id: taskId, uploaded_by: userId, filename: file.name, storage_path: upload.path, size_bytes: file.size, mime_type: file.type })
      .select().single()
    if (!error) setFiles(prev => [...prev, data])
    return { data, error }
  }

  async function deleteFile(id, storagePath) {
    await supabase.storage.from('task-files').remove([storagePath])
    const { error } = await supabase.from('files').delete().eq('id', id)
    if (!error) setFiles(prev => prev.filter(f => f.id !== id))
    return { error }
  }

  async function getFileUrl(storagePath) {
    const { data, error } = await supabase.storage
      .from('task-files').createSignedUrl(storagePath, 120)
    return error ? null : data.signedUrl
  }

  async function createInspoItem(type, content, caption = '') {
    const maxOrder = inspoItems.length > 0 ? Math.max(...inspoItems.map(i => i.sort_order)) : -1
    const { data, error } = await supabase
      .from('inspo_items').insert({ task_id: taskId, type, content, caption, sort_order: maxOrder + 1 }).select().single()
    if (!error) setInspoItems(prev => [...prev, data])
    return { data, error }
  }

  async function deleteInspoItem(id) {
    const { error } = await supabase.from('inspo_items').delete().eq('id', id)
    if (!error) setInspoItems(prev => prev.filter(i => i.id !== id))
    return { error }
  }

  async function reorderInspoItems(newIds) {
    const byId = Object.fromEntries(inspoItems.map(i => [i.id, i]))
    setInspoItems(newIds.map((id, idx) => ({ ...byId[id], sort_order: idx })))
    await Promise.all(newIds.map((id, idx) =>
      supabase.from('inspo_items').update({ sort_order: idx }).eq('id', id)
    ))
  }

  async function createTaskLink(url, label) {
    const { data, error } = await supabase
      .from('task_links').insert({ task_id: taskId, url, label }).select().single()
    if (!error) setTaskLinks(prev => [...prev, data])
    return { data, error }
  }

  async function deleteTaskLink(id) {
    const { error } = await supabase.from('task_links').delete().eq('id', id)
    if (!error) setTaskLinks(prev => prev.filter(l => l.id !== id))
    return { error }
  }

  return {
    task, subtasks, notes, files, inspoItems, taskLinks, loading, error,
    updateTask, createSubtask, updateSubtask, deleteSubtask,
    createNote, deleteNote, uploadFile, deleteFile, getFileUrl,
    createInspoItem, deleteInspoItem, reorderInspoItems,
    createTaskLink, deleteTaskLink,
  }
}
