import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useClient(clientId) {
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!clientId) return
    supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error)
        else setClient(data)
        setLoading(false)
      })
  }, [clientId])

  async function updateClient(fields) {
    const { data, error } = await supabase
      .from('clients')
      .update(fields)
      .eq('id', clientId)
      .select()
      .single()
    if (!error) setClient(data)
    return { data, error }
  }

  return { client, loading, error, updateClient }
}
