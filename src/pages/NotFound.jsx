import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-32 text-center animate-fade-in">
      <p className="text-dark-subtle text-xs font-mono tracking-widest mb-4">404</p>
      <h1 className="text-dark-text font-medium text-xl mb-2">Page not found</h1>
      <p className="text-dark-muted text-sm mb-8">This page doesn't exist or was moved.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        Back to studio
      </button>
    </div>
  )
}
