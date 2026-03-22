import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'

/** Always read fresh claims after a new claim (avoid stale RSC cache). */
export const dynamic = 'force-dynamic'

type ClaimRow = {
  id: string
  status: string
  created_at: string
  final_price: number
  listing_id: string
}

type ListingInfo = {
  id: string
  volume_litres: number
  address: string
}

type RatingRow = {
  claim_id: string
  stars: number
  comment: string | null
}

function shortId(id: string) {
  return id.replace(/-/g, '').substring(0, 8).toUpperCase()
}

export default async function ConsumerOrdersPage() {
  noStore()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: claimsData, error: claimsError } = await supabase
    .from('claims')
    .select('id, status, created_at, final_price, listing_id')
    .eq('consumer_id', user.id)
    .order('created_at', { ascending: false })

  if (claimsError) {
    console.error('[consumer/orders] claims query:', claimsError.message)
  }

  const rows = (claimsData ?? []) as ClaimRow[]
  const listingIds = [...new Set(rows.map((c) => c.listing_id).filter(Boolean))]

  let listingsById = new Map<string, ListingInfo>()
  if (listingIds.length > 0) {
    const { data: listingRows, error: listingsError } = await supabase
      .from('listings')
      .select('id, volume_litres, address')
      .in('id', listingIds)

    if (listingsError) {
      console.error('[consumer/orders] listings query:', listingsError.message)
    }

    for (const l of listingRows ?? []) {
      listingsById.set((l as ListingInfo).id, l as ListingInfo)
    }
  }

  const claimIds = rows.map((c) => c.id)
  let ratingsByClaim = new Map<string, RatingRow>()
  if (claimIds.length > 0) {
    const { data: ratingRows } = await supabase
      .from('ratings')
      .select('claim_id, stars, comment')
      .in('claim_id', claimIds)

    for (const r of ratingRows ?? []) {
      ratingsByClaim.set(r.claim_id as string, r as RatingRow)
    }
  }

  const profileIcon = (
    <div
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
  )

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* Header with forest background */}
      <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden' }}>
        <img
          src="/forest.png"
          alt=""
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '240px',
            objectFit: 'cover',
            objectPosition: 'center top',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.85,
            transform: 'scaleY(-1)'
          }}
        />
        {/* Top bar */}
        <div style={{
          position: 'absolute', top: 16, left: 24, right: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 1,
        }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <img src="/logo.png" alt="Reflo" style={{ width: '52px', height: '52px', borderRadius: '50%', cursor: 'pointer' }} />
        </Link>          {profileIcon}
        </div>
        {/* Greeting bottom left */}
        <div style={{ position: 'absolute', bottom: 20, left: 24, zIndex: 1 }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#448383', margin: '0 0 4px' }}>
            Hey 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#62B794', margin: 0 }}>Your orders</p>
        </div>
        {/* Back link bottom right */}
        <div style={{ position: 'absolute', bottom: 20, right: 24, zIndex: 1 }}>
          <Link
            href="/consumer"
            style={{
              fontWeight: 700, fontSize: '13px', color: '#448383',
              textDecoration: 'none', textTransform: 'uppercase',
            }}
          >
            ← Back to listings
          </Link>
        </div>
      </div>

      <div style={{ padding: '16px 24px 40px' }}>

      {claimsError && (
        <p style={{ color: '#448383', fontSize: '14px', marginBottom: '16px' }} role="alert">
          Could not load orders. Check Supabase RLS allows select on claims for your user.
        </p>
      )}

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#62B794', padding: '48px 0' }}>
          <p style={{ fontSize: '18px', color: '#448383', margin: '0 0 8px' }}>No orders yet</p>
          <p style={{ fontSize: '14px', margin: 0 }}>Claim a listing to see it here</p>
        </div>
      ) : (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          {rows.map((claim) => {
            const listing = listingsById.get(claim.listing_id)
            const rating = ratingsByClaim.get(claim.id)
            return (
              <div
                key={claim.id}
                style={{
                  backgroundColor: '#D1E8B0',
                  borderRadius: '16px',
                  border: 'none',
                  padding: '20px 24px',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: '#448383', fontSize: '16px', margin: '0 0 4px' }}>
                      {listing?.volume_litres ?? 0}L · {listing?.address ?? '—'}
                    </p>
                    <p style={{ fontSize: '13px', color: '#62B794', margin: 0 }}>
                      {new Date(claim.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    style={{
                      fontWeight: 700,
                      color: '#448383',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    {claim.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <p style={{ fontWeight: 700, color: '#448383', fontSize: '18px', margin: 0 }}>
                    ${claim.final_price.toFixed(2)}
                  </p>
                </div>

                <div style={{ marginTop: '12px' }}>
                  {rating ? (
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#448383', margin: 0 }}>
                        <span style={{ color: '#E5B923' }}>★</span> {rating.stars}/5
                      </p>
                      {rating.comment && (
                        <p style={{ fontSize: '14px', color: '#62B794', fontStyle: 'italic', margin: '8px 0 0' }}>
                          &ldquo;{rating.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={`/consumer/confirmation?claimId=${claim.id}`}
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#448383',
                        textDecoration: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Rate this order →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      </div>
    </div>
  )
}