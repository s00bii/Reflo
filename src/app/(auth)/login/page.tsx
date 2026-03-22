'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .single()

    if (profile?.role === 'supplier') {
      router.push('/supplier')
    } else {
      router.push('/consumer')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Navbar */}
      <nav style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '16px 40px',
        borderBottom: '1px solid #D1E8B0',
      }}>
        <Link href="/" style={{ textDecoration: 'none', justifySelf: 'start' }}>
          <img src="/logo.png" alt="Reflo" style={{ width: '52px', height: '52px', borderRadius: '50%', cursor: 'pointer' }} />
        </Link>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          {[
            { label: 'HOME', href: '/' },
            { label: 'OIL PREP GUIDE', href: '/oil-prep-guide' },
            { label: 'ABOUT US', href: '/#' },
            { label: 'LOGIN/SIGN UP', href: '/login' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} style={{
              fontSize: '14px',
              fontWeight: label === 'LOGIN/SIGN UP' ? 700 : 400,
              color: '#448383',
              textDecoration: 'none',
              letterSpacing: '0.05em',
            }}>
              {label}
            </Link>
          ))}
        </div>
        <div />
      </nav>

      {/* Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #D1E8B0',
          borderRadius: '24px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img src="/logo.png" alt="Reflo" style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#448383', margin: '0 0 8px' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '14px', color: '#62B794', margin: 0 }}>
              Sign in to your Reflo account
            </p>
          </div>

          {error && (
            <p style={{ color: '#448383', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                backgroundColor: '#D1E8B0',
                borderRadius: '9999px',
                border: 'none',
                padding: '14px 20px',
                color: '#448383',
                fontSize: '14px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                backgroundColor: '#D1E8B0',
                borderRadius: '9999px',
                border: 'none',
                padding: '14px 20px',
                color: '#448383',
                fontSize: '14px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#448383',
              color: '#ffffff',
              borderRadius: '9999px',
              border: 'none',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: '20px',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#62B794', margin: 0 }}>
            No account?{' '}
            <Link href="/signup" style={{ color: '#448383', fontWeight: 600, textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}