export default function Settings() {
  return (
    <div className="flex flex-col flex-1">
      <header className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto w-full px-6 py-5">
          <h1 className="text-dark-text font-medium text-xl">Settings</h1>
          <p className="text-dark-muted text-xs mt-1">Studio preferences and account — coming in Phase 2F.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-4">
        <div className="card p-6 flex flex-col gap-1">
          <p className="text-dark-text text-sm font-medium">Profile</p>
          <p className="text-dark-muted text-xs">Display name, avatar, and studio name.</p>
        </div>
        <div className="card p-6 flex flex-col gap-1">
          <p className="text-dark-text text-sm font-medium">Notifications</p>
          <p className="text-dark-muted text-xs">Morning digest schedule and delivery preferences.</p>
        </div>
        <div className="card p-6 flex flex-col gap-1">
          <p className="text-dark-text text-sm font-medium">Appearance</p>
          <p className="text-dark-muted text-xs">Theme and display options.</p>
        </div>
        <div className="card p-6 flex flex-col gap-1" style={{ borderColor: 'rgba(240,149,149,0.2)' }}>
          <p className="text-dark-text text-sm font-medium">Danger zone</p>
          <p className="text-dark-muted text-xs">Delete account and data.</p>
        </div>
      </main>
    </div>
  )
}
