import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('clients')
      .select('*')
      .neq('status', 'archived')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error)
        else setClients(data ?? [])
        setLoading(false)
      })
  }, [])

  async function createClient(fields) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...fields, owner_id: user.id })
      .select()
      .single()
    if (!error) setClients(prev => [data, ...prev])
    return { data, error }
  }

  async function archiveClient(id) {
    const { error } = await supabase
      .from('clients')
      .update({ status: 'archived' })
      .eq('id', id)
    if (!error) setClients(prev => prev.filter(c => c.id !== id))
    return { error }
  }

  async function updateClient(id, fields) {
    const { data, error } = await supabase
      .from('clients')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (!error) setClients(prev => prev.map(c => c.id === id ? data : c))
    return { data, error }
  }

  return { clients, loading, error, createClient, archiveClient, updateClient }
}
