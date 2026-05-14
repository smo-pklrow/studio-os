import { useParams } from 'react-router-dom'

export function TaskDetail() {
  const { clientId, taskId } = useParams()
  return (
    <div className="p-8 text-dark-text">
      <p className="text-dark-muted text-sm">Task detail — {taskId} — Level 3 coming soon.</p>
    </div>
  )
}

export function ClientPortal() {
  const { shareToken } = useParams()
  return (
    <div className="p-8 text-dark-text">
      <p className="text-dark-muted text-sm">Client portal — read-only view for token {shareToken}.</p>
    </div>
  )
}

export function Login() {
  const handleGoogleLogin = async () => {
    const { createClient } = await import('@supabase/supabase-js')
    // supabase.auth.signInWithOAuth is called in the real implementation
    // Stub: import from lib/supabase and call signInWithOAuth({ provider: 'google' })
    alert('Connect Supabase env vars, then implement Google OAuth here.')
  }

  return (
    <div className="min-h-dvh bg-dark-bg flex items-center justify-center">
      <div className="card p-8 w-80 text-center">
        <h1 className="text-lg font-medium text-dark-text mb-2">Studio OS</h1>
        <p className="text-dark-muted text-sm mb-6">Sign in to continue</p>
        <button onClick={handleGoogleLogin} className="btn w-full justify-center">
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
