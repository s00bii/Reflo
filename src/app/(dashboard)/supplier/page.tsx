import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { calculatePrice } from '@/lib/pricing'

export default async function SupplierDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('supplier_id', user.id)
    .order('created_at', { ascending: false })

  const { data: myRatings } = await supabase
    .from('ratings')
    .select('stars')
    .eq('supplier_id', user.id)

  const ratingStars = myRatings ?? []
  const ratingCount = ratingStars.length
  const ratingAvg = ratingCount > 0
    ? ratingStars.reduce((s, r) => s + (r.stars as number), 0) / ratingCount
    : null

  const profileIcon = (
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      border: '2px solid #448383', display: 'flex',
      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#448383" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* Header with forest background */}
      <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden', backgroundColor: '#ffffff' }}>

      {/* Forest spans full width as background */}
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
          objectPosition: 'center bottom',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.85,
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
        </Link>           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {profileIcon}
            <Link
              href="/supplier/new-listing"
              style={{
                borderRadius: '9999px', padding: '10px 22px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                textDecoration: 'none', backgroundColor: '#448383', color: '#ffffff',
                border: 'none',
              }}
            >
              + New Listing
            </Link>
          </div>
        </div>

        {/* Greeting bottom left */}
        <div style={{ position: 'absolute', bottom: 20, left: 24, zIndex: 1 }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#448383', margin: '0 0 4px' }}>
            Hey, {profile?.name ?? 'Supplier'} 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#62B794', margin: 0 }}>
            Manage your oil listings
          </p>
          {ratingAvg !== null && (
            <p style={{ fontSize: '13px', color: '#62B794', margin: '4px 0 0' }}>
              <span style={{ color: '#E5B923' }}>★</span> {ratingAvg.toFixed(1)} average · {ratingCount} review{ratingCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Listings */}
      <div style={{ padding: '16px 24px 40px', maxWidth: '860px', margin: '0 auto' }}>
        {listings && listings.length > 0 ? (
          <div>
            {listings.map((listing, i) => {
              const isNew = i === 0 && listing.status === 'claimed'
              const earnings = (listing.price_base * listing.volume_litres * 0.93).toFixed(2)
              return (
                <div
                  key={listing.id}
                  style={{
                    backgroundColor: '#fefce8',
                    borderRadius: '16px',
                    border: 'none',
                    padding: '20px 24px',
                    marginBottom: '12px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: '#448383', fontSize: '17px', margin: '0 0 6px' }}>
                        {listing.volume_litres} L of Used Oil
                      </p>
                      <p style={{ fontSize: '13px', color: '#62B794', margin: '0 0 3px' }}>
                        {listing.address}
                      </p>
                      <p style={{ fontSize: '13px', color: '#62B794', margin: '0 0 3px' }}>
                        Available: {new Date(listing.available_at).toLocaleDateString()}
                      </p>
                      <p style={{ fontSize: '13px', color: '#62B794', margin: 0 }}>
                        ${listing.price_base.toFixed(2)}/L · {listing.volume_litres}L · after 7% fee
                      </p>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      {isNew && (
                        <span style={{ fontStyle: 'italic', color: '#62B794', fontSize: '13px' }}>NEW! </span>
                      )}
                      <span style={{ fontWeight: 700, color: '#448383', fontSize: '13px', textTransform: 'uppercase' }}>
                        {listing.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <p style={{ fontWeight: 700, color: '#448383', fontSize: '18px', margin: 0 }}>
                      YOU EARN ~${earnings}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '18px', color: '#448383', fontWeight: 600, margin: '0 0 8px' }}>No listings yet</p>
            <p style={{ fontSize: '14px', color: '#62B794', margin: 0 }}>Post your first oil pickup above</p>
          </div>
        )}
      </div>
    </div>
  )
}