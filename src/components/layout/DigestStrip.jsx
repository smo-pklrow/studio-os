export default function DigestStrip() {
  return (
    <div
      className="card p-5"
      style={{
        borderColor: 'rgba(147, 130, 255, 0.25)',
        backgroundColor: 'rgba(88, 80, 180, 0.05)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-xs select-none"
            style={{ backgroundColor: 'rgba(147, 130, 255, 0.2)', color: '#9382FF' }}
          >
            ◈
          </div>
          <span className="text-dark-text text-sm font-medium">Morning digest</span>
        </div>
        <span className="text-dark-subtle text-xs">AI · Phase 3</span>
      </div>
      <p className="text-dark-muted text-xs leading-relaxed">
        Your AI-powered briefing — what's due, what's stalled, and open loops across all clients.
        Enabled once the intelligence layer is wired up.
      </p>
    </div>
  )
}
