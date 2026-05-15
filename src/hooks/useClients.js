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

  async function createClient(fields, logoFile) {
    const { data: { user } } = await supabase.auth.getUser()

    let logo_url = null
    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { data: upload, error: uploadError } = await supabase.storage
        .from('client-logos')
        .upload(path, logoFile, { contentType: logoFile.type })
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('client-logos')
          .getPublicUrl(upload.path)
        logo_url = publicUrl
      }
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({ ...fields, logo_url, owner_id: user.id })
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
