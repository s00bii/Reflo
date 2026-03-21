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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create account</h1>
        <p className="text-gray-500 mb-6">Join Reflo and start trading oil</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-sm outline-none focus:border-green-500"
        />
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
          className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm outline-none focus:border-green-500"
        />

        <p className="text-sm text-gray-600 mb-2 font-medium">I am a...</p>
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setRole('supplier')}
            className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${
              role === 'supplier'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
            }`}
          >
            Supplier (Restaurant)
          </button>
          <button
            onClick={() => setRole('consumer')}
            className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${
              role === 'consumer'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
            }`}
          >
            Consumer (Converter)
          </button>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-green-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}