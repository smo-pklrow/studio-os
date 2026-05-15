import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import logoUrl from '../../assets/logo.png'

export default function NavBar({ user }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  async function handleSignOut() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('tab-'))
      .forEach(k => localStorage.removeItem(k))
    await supabase.auth.signOut()
    navigate('/login')
  }

  const avatarUrl = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'Studio Owner'
  const email = user?.email
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const isSettings = location.pathname === '/settings'

  return (
    <nav
      className="flex items-center justify-between px-6 shrink-0"
      style={{
        height: '48px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
        <img src={logoUrl} alt="Studio OS" className="h-5 w-auto" />
        <span className="text-dark-text font-medium text-sm">Studio OS</span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <Link
          to="/settings"
          className={`text-xs transition-colors ${
            isSettings ? 'text-dark-text' : 'text-dark-muted hover:text-dark-text'
          }`}
        >
          Settings
        </Link>

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="User menu"
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              : <span>{initials}</span>
            }
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 card card-elevated z-50 min-w-[200px] py-1 animate-fade-in">
              <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <p className="text-dark-text text-xs font-medium truncate">{displayName}</p>
                {email && <p className="text-dark-subtle text-xs truncate mt-0.5">{email}</p>}
              </div>
              <Link
                to="/settings"
                className="block px-3 py-2 text-xs text-dark-muted hover:text-dark-text hover:bg-dark-elevated transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />
              <button
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-dark-elevated transition-colors"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
