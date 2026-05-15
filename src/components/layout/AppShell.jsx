import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import NavBar from './NavBar.jsx'

export default function AppShell() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [studioName, setStudioName] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login')
      else setUser(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate('/login')
      else setUser(session.user)
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('studio_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data?.studio_name) setStudioName(data.studio_name) })
  }, [user?.id])

  if (!user) return null

  return (
    <div className="min-h-dvh flex flex-col">
      <NavBar user={user} studioName={studioName} />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}
