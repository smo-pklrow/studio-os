import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePortal(shareToken) {
  const [client, setClient] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!shareToken) {
      setNotFound(true)
      setLoading(false)
      return
    }

    supabase
      .from('clients')
      .select(`
        id, name, project_name, logo_url, color, health, status, due_date,
        task_groups (
          id, name, color, sort_order,
          tasks ( id, title, status, priority, due_date, sort_order )
        )
      `)
      .eq('share_token', shareToken)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
        } else {
          const sorted = (data.task_groups ?? [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(g => ({
              ...g,
              tasks: (g.tasks ?? []).sort((a, b) => a.sort_order - b.sort_order),
            }))
          setClient(data)
          setGroups(sorted)
        }
        setLoading(false)
      })
  }, [shareToken])

  return { client, groups, loading, notFound }
}
