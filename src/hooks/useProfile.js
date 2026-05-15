import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) setError(error)
      else setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  async function updateProfile(fields) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', user.id)
      .select()
      .single()
    if (!error) setProfile(prev => ({ ...prev, ...data }))
    return { data, error }
  }

  return { profile, loading, error, updateProfile }
}
