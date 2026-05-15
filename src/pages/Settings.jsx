import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProfile } from '../hooks/useProfile'

function SectionDivider() {
  return <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />
}

function FieldLabel({ children }) {
  return (
    <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
      {children}
    </span>
  )
}

function Phase3Badge() {
  return (
    <span
      className="badge"
      style={{ backgroundColor: 'var(--color-elevated-hi)', color: 'var(--color-muted)' }}
    >
      Phase 3
    </span>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { profile, loading, updateProfile } = useProfile()

  const [authUser, setAuthUser]     = useState(null)
  const [studioName, setStudioName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved]   = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setAuthUser(user))
  }, [])

  useEffect(() => {
    if (profile) setStudioName(profile.studio_name ?? '')
  }, [profile])

  async function handleSaveStudioName() {
    setSavingName(true)
    await updateProfile({ studio_name: studioName.trim() || null })
    setSavingName(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2500)
  }

  async function handleSignOut() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('tab-'))
      .forEach(k => localStorage.removeItem(k))
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function handleDeleteAccount() {
    await handleSignOut()
  }

  const displayName = authUser?.user_metadata?.full_name ?? authUser?.email ?? 'Studio Owner'
  const email       = authUser?.email
  const avatarUrl   = authUser?.user_metadata?.avatar_url
  const initials    = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col flex-1">
      {/* Page header */}
      <header style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-2xl mx-auto w-full px-6 py-5">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Settings</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtle)' }}>
            Studio preferences and account management
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-4">

        {/* ── Profile ── */}
        <section className="card p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Profile</h2>
          <SectionDivider />

          {/* Avatar + identity */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full shrink-0 overflow-hidden flex items-center justify-center font-semibold text-base text-white"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                : <span>{initials}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {displayName}
              </p>
              {email && (
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-subtle)' }}>{email}</p>
              )}
              <p className="text-xs mt-1" style={{ color: 'var(--color-subtle)' }}>
                Profile photo is managed through your Google account
              </p>
            </div>
          </div>

          <SectionDivider />

          {/* Studio name */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Studio name</FieldLabel>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={studioName}
                onChange={e => setStudioName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveStudioName() }}
                placeholder="e.g. Harvest Creative"
                className="flex-1 rounded-md px-3 py-2 text-sm"
                style={{
                  backgroundColor: 'var(--color-elevated)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--border-default)',
                  outline: 'none',
                }}
                disabled={loading}
              />
              <button
                onClick={handleSaveStudioName}
                disabled={savingName || loading}
                className="btn btn-primary shrink-0"
              >
                {savingName ? 'Saving…' : nameSaved ? '✓ Saved' : 'Save'}
              </button>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
              Shown in the nav bar and to clients in portal links
            </p>
          </div>
        </section>

        {/* ── Notifications ── */}
        <section className="card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Notifications</h2>
            <Phase3Badge />
          </div>
          <SectionDivider />

          <div className="flex flex-col gap-3">
            <FieldLabel>Morning digest</FieldLabel>
            <div className="flex items-center gap-3">
              <select
                disabled
                className="rounded-md px-3 py-2 text-sm"
                style={{
                  backgroundColor: 'var(--color-elevated)',
                  color: 'var(--color-subtle)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                }}
              >
                <option>Mon – Fri</option>
              </select>
              <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>at</span>
              <select
                disabled
                className="rounded-md px-3 py-2 text-sm"
                style={{
                  backgroundColor: 'var(--color-elevated)',
                  color: 'var(--color-subtle)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                }}
              >
                <option>7:00 AM</option>
              </select>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
              Digest timing will be configurable when the Intelligence Layer ships in Phase 3.
            </p>
          </div>
        </section>

        {/* ── Appearance ── */}
        <section className="card p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Appearance</h2>
          <SectionDivider />

          <div className="flex flex-col gap-2">
            <FieldLabel>Theme</FieldLabel>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm"
                style={{
                  backgroundColor: 'var(--color-elevated)',
                  border: '1px solid var(--color-brand)',
                  color: 'var(--color-text)',
                  cursor: 'default',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--color-brand)' }}
                />
                Dark
              </button>
              <button
                disabled
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--color-subtle)',
                  cursor: 'not-allowed',
                  opacity: 0.5,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--color-subtle)' }}
                />
                Light — coming soon
              </button>
            </div>
          </div>
        </section>

        {/* ── Danger zone ── */}
        <section
          className="card p-6 flex flex-col gap-5"
          style={{ borderColor: 'rgba(240,149,149,0.2)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Danger zone</h2>
          <SectionDivider />

          {/* Sign out */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text)' }}>Sign out</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-subtle)' }}>
                Signs you out on this device. Your data is preserved.
              </p>
            </div>
            <button onClick={handleSignOut} className="btn shrink-0">
              Sign out
            </button>
          </div>

          <SectionDivider />

          {/* Delete account */}
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>Delete account</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-subtle)' }}>
                  Permanently removes your account and all studio data. This cannot be undone.
                </p>
              </div>
              {!deleteConfirm && (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="btn shrink-0"
                  style={{ color: 'var(--color-red-fg)', borderColor: 'rgba(240,149,149,0.3)' }}
                >
                  Delete account
                </button>
              )}
            </div>

            {deleteConfirm && (
              <div
                className="rounded-lg p-4 flex flex-col gap-3"
                style={{
                  backgroundColor: 'var(--color-red-bg)',
                  border: '1px solid rgba(240,149,149,0.25)',
                }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--color-red-fg)' }}>
                  Are you sure? This will permanently delete all your clients, tasks, and files.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    className="btn text-xs"
                    style={{
                      backgroundColor: 'var(--color-red-bg)',
                      color: 'var(--color-red-fg)',
                      borderColor: 'rgba(240,149,149,0.4)',
                    }}
                  >
                    Yes, delete everything
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="btn text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
