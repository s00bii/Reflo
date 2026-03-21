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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-500 mb-6">Sign in to your Reflo account</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-sm outline-none focus:border-green-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-6 text-sm outline-none focus:border-green-500"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{' '}
          <Link href="/signup" className="text-green-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}