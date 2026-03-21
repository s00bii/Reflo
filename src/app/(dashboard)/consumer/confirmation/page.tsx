'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Claim = {
  id: string
  final_price: number
  created_at: string
  listings: {
    volume_litres: number
    price_base: number
    supplier_id: string
  }
}

type ExistingRating = {
  stars: number
  comment: string | null
}

function shortId(id: string) {
  return id.replace(/-/g, '').substring(0, 8).toUpperCase()
}

function StarRow({
  value,
  onSelect,
  disabled,
}: {
  value: number
  onSelect: (n: number) => void
  disabled?: boolean
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(n)}
          onMouseEnter={() => !disabled && setHovered(n)}
          onMouseLeave={() => !disabled && setHovered(0)}
          style={{
            fontSize: '32px',
            lineHeight: 1,
            background: 'none',
            border: 'none',
            padding: '2px',
            cursor: disabled ? 'default' : 'pointer',
            color: n <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.1s',
          }}
          aria-label={`${n} stars`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const claimId = searchParams.get('claimId')
  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)
  const [existingRating, setExistingRating] = useState<ExistingRating | null>(null)
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [thanks, setThanks] = useState(false)

  useEffect(() => {
    async function load() {
      if (!claimId) return
      const supabase = createClient()
      const { data } = await supabase
        .from('claims')
        .select('*, listings(*)')
        .eq('id', claimId)
        .single()
      const row = data as Record<string, unknown> | null
      if (row && row.listings) {
        const l = row.listings as Record<string, unknown> | Record<string, unknown>[]
        const listing = Array.isArray(l) ? l[0] : l
        setClaim({ ...row, listings: listing } as Claim)
      } else {
        setClaim(data as Claim | null)
      }

      const { data: ratingRow } = await supabase
        .from('ratings')
        .select('stars, comment')
        .eq('claim_id', claimId)
        .maybeSingle()
      if (ratingRow) setExistingRating(ratingRow)

      setLoading(false)
    }
    load()
  }, [claimId])

  async function handleSubmitRating() {
    if (!claim || !claimId || stars < 1) return
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('ratings').insert({
      claim_id: claimId,
      consumer_id: user.id,
      supplier_id: claim.listings.supplier_id,
      stars,
      comment: comment.trim() || null,
    })

    setSubmitting(false)
    if (!error) {
      setThanks(true)
    }
  }

  if (loading) return <p className="text-gray-400 text-sm p-10">Loading...</p>
  if (!claim) return <p className="text-gray-400 text-sm p-10">Claim not found</p>

  const oilValueTotal = claim.listings.price_base * claim.listings.volume_litres
  const serviceFee = claim.listings.price_base * claim.listings.volume_litres * 0.05

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Order confirmed</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date(claim.created_at).toLocaleString()}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-green-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <p className="text-white text-sm font-medium">Order #{shortId(claim.id)}</p>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3">
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Oil value</span>
              <span className="text-sm text-gray-900">${oilValueTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Service fee (5%)</span>
              <span className="text-sm text-gray-900">+${serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-green-600">${claim.final_price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        {existingRating && !thanks ? (
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Your rating</p>
            <div className="flex items-center gap-2 text-amber-400 text-xl mb-2">
              <StarRow value={existingRating.stars} onSelect={() => {}} disabled />
            </div>
            {existingRating.comment && (
              <p className="text-sm text-gray-600 italic">&ldquo;{existingRating.comment}&rdquo;</p>
            )}
          </div>
        ) : thanks ? (
          <p className="text-green-600 font-medium text-sm">Thanks for your rating!</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-900 mb-3">Rate this order</p>
            <StarRow value={stars} onSelect={setStars} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the oil quality?"
              rows={3}
              className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 resize-none"
            />
            <button
              type="button"
              onClick={handleSubmitRating}
              disabled={submitting || stars < 1}
              className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit rating'}
            </button>
          </>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-6">
        <p className="text-sm font-medium text-amber-800">Order placed — supplier will prepare your oil for pickup</p>
      </div>

      <Link
        href="/consumer/orders"
        className="w-full block text-center bg-green-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-green-700 mb-3"
      >
        View all orders
      </Link>
      <Link
        href="/consumer"
        className="w-full block text-center border border-gray-200 text-gray-600 rounded-lg py-3 text-sm font-medium hover:border-gray-400"
      >
        Back to listings
      </Link>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<p className="text-gray-400 text-sm p-10">Loading...</p>}>
      <ConfirmationContent />
    </Suspense>
  )
}
