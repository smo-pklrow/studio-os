import { useParams } from 'react-router-dom'

// Level 2 — client board (tasks + brain dump tabs)
export default function ClientBoard() {
  const { clientId } = useParams()
  return (
    <div className="p-8 text-dark-text">
      <p className="text-dark-muted text-sm">Client board — {clientId} — Level 2 coming soon.</p>
    </div>
  )
}
