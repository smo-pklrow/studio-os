import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleLogin = async () => {
    if (loading) return
    setError(null)
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

    if (signInError) {
      setError(signInError.message ?? 'Sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
      <BackgroundField />

      <main className="relative z-10 w-full max-w-sm animate-fade-up">
        <div className="card card-elevated px-8 py-10">
          <div className="flex flex-col items-center text-center">
            <Logomark />

            <h1 className="mt-6 text-[1.375rem] font-medium tracking-tight text-dark-text animate-fade-up animate-delay-1">
              Studio OS
            </h1>
            <p className="mt-1.5 text-sm text-dark-muted animate-fade-up animate-delay-1">
              Client management for solo creatives.
            </p>
          </div>

          <div
            role="separator"
            aria-hidden="true"
            className="my-7 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            aria-busy={loading}
            className="btn btn-lg w-full animate-fade-up animate-delay-2"
          >
            {loading ? <Spinner /> : <GoogleIcon />}
            <span>{loading ? 'Redirecting to Google…' : 'Continue with Google'}</span>
          </button>

          {error && (
            <p
              role="alert"
              className="mt-4 text-center text-xs leading-relaxed text-[#F09595] animate-fade-in"
            >
              {error}
            </p>
          )}

          <p className="mt-6 text-center text-[11px] leading-relaxed text-dark-subtle animate-fade-up animate-delay-3">
            By continuing you agree to the terms of service
            <br />
            and acknowledge the privacy policy.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] tracking-wide text-dark-subtle animate-fade-in animate-delay-4">
          Studio OS · built for solo work
        </p>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------- */
/*  Ambient background — radial brand glows, fine grid, vignette */
/* ------------------------------------------------------------- */

function BackgroundField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {/* Brand glow — top-left */}
      <div
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full blur-3xl animate-drift"
        style={{
          background:
            'radial-gradient(closest-side, rgba(29,158,117,0.22), transparent 70%)',
        }}
      />
      {/* Cooler accent — bottom-right */}
      <div
        className="absolute -bottom-48 -right-32 h-[560px] w-[560px] rounded-full blur-3xl animate-drift"
        style={{
          animationDelay: '-7s',
          background:
            'radial-gradient(closest-side, rgba(15,110,86,0.18), transparent 70%)',
        }}
      />
      {/* Fine grid, masked to fade outward */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------- */
/*  Logomark — layered cards, brand gradient, soft halo          */
/* ------------------------------------------------------------- */

function Logomark() {
  return (
    <div className="relative h-12 w-12 animate-fade-in">
      {/* Brand halo */}
      <div
        className="absolute inset-0 -m-4 rounded-2xl blur-2xl animate-pulse-glow"
        style={{
          background:
            'radial-gradient(closest-side, rgba(29,158,117,0.55), transparent 70%)',
        }}
      />
      <svg
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="studioos-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1D9E75" />
            <stop offset="100%" stopColor="#0F6E56" />
          </linearGradient>
          <linearGradient id="studioos-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9FE1CB" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Back card */}
        <rect x="5" y="5" width="26" height="26" rx="7" fill="#0F6E56" opacity="0.55" />
        {/* Front card */}
        <rect x="17" y="17" width="26" height="26" rx="7" fill="url(#studioos-front)" />
        {/* Front-card highlight stroke */}
        <rect
          x="17.5"
          y="17.5"
          width="25"
          height="25"
          rx="6.5"
          fill="none"
          stroke="url(#studioos-stroke)"
          strokeWidth="1"
        />
        {/* Subtle top sheen */}
        <rect x="18" y="18" width="24" height="2" rx="1" fill="white" opacity="0.08" />
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------- */
/*  Google "G" — official 4-color mark                            */
/* ------------------------------------------------------------- */

function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.614z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}

/* ------------------------------------------------------------- */
/*  Spinner — used while waiting for the OAuth redirect           */
/* ------------------------------------------------------------- */

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
