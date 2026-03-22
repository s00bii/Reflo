'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'supplier' | 'consumer'>('supplier')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
        role,
      })
    }

    if (role === 'supplier') {
      router.push('/supplier')
    } else {
      router.push('/consumer')
    }
  }

  const inputStyle = {
    backgroundColor: '#D1E8B0',
    borderRadius: '9999px',
    border: 'none',
    padding: '14px 20px',
    color: '#448383',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
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
              Create account
            </h1>
            <p style={{ fontSize: '14px', color: '#62B794', margin: 0 }}>
              Join Reflo and start trading oil
            </p>
          </div>

          {error && (
            <p style={{ color: '#448383', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Role selector */}
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#448383', margin: '0 0 10px' }}>
            I am a...
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button
              onClick={() => setRole('supplier')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: role === 'supplier' ? '#448383' : '#D1E8B0',
                color: role === 'supplier' ? '#ffffff' : '#448383',
                transition: 'all 0.15s',
              }}
            >
              Supplier (Restaurant)
            </button>
            <button
              onClick={() => setRole('consumer')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: role === 'consumer' ? '#448383' : '#D1E8B0',
                color: role === 'consumer' ? '#ffffff' : '#448383',
                transition: 'all 0.15s',
              }}
            >
              Consumer (Converter)
            </button>
          </div>

          <button
            onClick={handleSignup}
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#62B794', margin: 0 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#448383', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}