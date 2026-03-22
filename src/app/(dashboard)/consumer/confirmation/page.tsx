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
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
            color: n <= (hovered || value) ? '#E5B923' : '#8BD4B9',
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

  if (loading) {
    return (
      <p style={{ color: '#62B794', fontSize: '14px', padding: '40px 24px' }}>Loading...</p>
    )
  }
  if (!claim) {
    return (
      <p style={{ color: '#62B794', fontSize: '14px', padding: '40px 24px' }}>Claim not found</p>
    )
  }

  const oilValueTotal = claim.listings.price_base * claim.listings.volume_litres
  const serviceFee = claim.listings.price_base * claim.listings.volume_litres * 0.05

  return (
    <div style={{ backgroundColor: '#ffffff', maxWidth: '680px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <img src="/logo.png" alt="Reflo" style={{ width: '52px', height: '52px', borderRadius: '50%', cursor: 'pointer' }} />
        </Link>         <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '2px solid #448383',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#448383" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>

      <p
        style={{
          textAlign: 'center',
          color: '#62B794',
          fontSize: '16px',
          marginBottom: '8px',
        }}
      >
        Hey 👋
      </p>
      <h1
        style={{
          textAlign: 'center',
          color: '#448383',
          fontSize: '26px',
          fontWeight: 700,
          marginBottom: '24px',
          lineHeight: 1.3,
        }}
      >
        Thank you for your order! Below is your confirmation:
      </h1>

      {/* Order number bar */}
      <div
        style={{
          backgroundColor: '#62B794',
          borderRadius: '12px',
          padding: '16px 24px',
        }}
      >
        <p style={{ margin: 0, color: '#ffffff', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' }}>
          Order #{shortId(claim.id)}
        </p>
      </div>

      {/* Receipt */}
      <div
        style={{
          backgroundColor: '#D1E8B0',
          borderRadius: '12px',
          padding: '20px 24px',
          marginTop: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontWeight: 700, color: '#448383', fontSize: '13px', textTransform: 'uppercase' }}>Oil value</span>
          <span style={{ color: '#448383', fontSize: '14px' }}>${oilValueTotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontWeight: 700, color: '#448383', fontSize: '13px', textTransform: 'uppercase' }}>Service fee (5%)</span>
          <span style={{ color: '#448383', fontSize: '14px' }}>+${serviceFee.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 700, color: '#448383', fontSize: '15px', textTransform: 'uppercase' }}>Total:</span>
          <span style={{ color: '#448383', fontSize: '22px', fontWeight: 800 }}>${claim.final_price.toFixed(2)}</span>
        </div>
      </div>

      {/* Rating */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #8BD4B9',
          borderRadius: '16px',
          padding: '20px',
          marginTop: '16px',
        }}
      >
        {existingRating && !thanks ? (
          <div>
            <p style={{ fontWeight: 700, color: '#448383', marginBottom: '8px' }}>Your rating</p>
            <StarRow value={existingRating.stars} onSelect={() => {}} disabled />
            {existingRating.comment && (
              <p style={{ color: '#62B794', fontSize: '14px', fontStyle: 'italic', marginTop: '8px' }}>
                &ldquo;{existingRating.comment}&rdquo;
              </p>
            )}
          </div>
        ) : thanks ? (
          <p style={{ color: '#448383', fontWeight: 600, fontSize: '14px', margin: 0 }}>Thanks for your rating!</p>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                <p style={{ fontWeight: 700, color: '#448383', fontSize: '12px', textTransform: 'uppercase', margin: '0 0 8px' }}>
                  Rate this order from:
                </p>
                <p style={{ color: '#62B794', fontSize: '14px', margin: '0 0 12px' }}>Your supplier</p>
                <StarRow value={stars} onSelect={setStars} />
              </div>
              <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the oil quality? Feel free to write a review."
                  rows={4}
                  style={{
                    backgroundColor: '#D1E8B0',
                    borderRadius: '12px',
                    border: 'none',
                    padding: '12px 16px',
                    color: '#448383',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%',
                    resize: 'none',
                    fontStyle: 'italic',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmitRating}
              disabled={submitting || stars < 1}
              style={{
                marginTop: '16px',
                width: '100%',
                border: 'none',
                borderRadius: '9999px',
                padding: '12px 28px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: submitting || stars < 1 ? 'not-allowed' : 'pointer',
                backgroundColor: '#448383',
                color: '#ffffff',
                opacity: submitting || stars < 1 ? 0.6 : 1,
              }}
            >
              {submitting ? 'Submitting...' : 'Submit rating'}
            </button>
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <Link
          href="/consumer"
          style={{
            fontWeight: 700,
            fontSize: '13px',
            color: '#448383',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}
        >
          ← Back to listings
        </Link>
        <Link
          href="/consumer/orders"
          style={{
            fontWeight: 700,
            fontSize: '13px',
            color: '#448383',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}
        >
          View all orders
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<p style={{ color: '#62B794', fontSize: '14px', padding: '40px 24px' }}>Loading...</p>}>
      <ConfirmationContent />
    </Suspense>
  )
}
