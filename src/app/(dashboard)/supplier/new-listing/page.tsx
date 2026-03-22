'use client'

import { useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculatePrice } from '@/lib/pricing'
import dynamic from 'next/dynamic'

// @ts-ignore
const SearchBox = dynamic(
  () => import('@mapbox/search-js-react').then(mod => mod.SearchBox),
  { ssr: false }
)

const inputStyle: CSSProperties = {
  backgroundColor: '#D1E8B0',
  borderRadius: '9999px',
  border: 'none',
  padding: '12px 20px',
  color: '#448383',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: CSSProperties = {
  fontWeight: 700,
  color: '#448383',
  fontSize: '15px',
  display: 'block',
  marginBottom: '6px',
  textAlign: 'left',
}

export default function NewListingPage() {
  const router = useRouter()
  const [volume, setVolume] = useState('')
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [availableAt, setAvailableAt] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!coords) {
      setError('Please select an address from the dropdown')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const volumeNum = parseFloat(volume)

    const { oilValuePerLitre } = calculatePrice({
      volumeLitres: volumeNum,
      totalPlatformLitres: 500,
    })

    const basePrice = oilValuePerLitre

    const { error } = await supabase.from('listings').insert({
      supplier_id: user.id,
      volume_litres: volumeNum,
      price_base: basePrice,
      address,
      lat: coords.lat,
      lng: coords.lng,
      available_at: availableAt,
      notes,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/supplier')
  }

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
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '0 24px 48px', maxWidth: '520px', margin: '0 auto' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '16px 0',
      }}>
       <img src="/logo.png" alt="Reflo" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />
        {profileIcon}
      </div>

      {/* Forest */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        <img src="/forest.png" alt="" style={{ height: '180px', objectFit: 'contain', pointerEvents: 'none' }} />
      </div>

      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#448383', margin: '0 0 8px' }}>Hey 👋</h1>
      <p style={{ fontSize: '14px', color: '#62B794', margin: '0 0 28px' }}>
        Post your available used oil for pickup
      </p>

      {error && (
        <p style={{ color: '#448383', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div>
          <label style={labelStyle}>Volume (litres)</label>
          <input
            type="number"
            placeholder="e.g. 50 L"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Pickup address</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '16px', top: '50%',
              transform: 'translateY(-50%)', fontSize: '14px',
              pointerEvents: 'none', zIndex: 1,
            }}>
              🔍
            </span>
            <div style={{ paddingLeft: '40px' }}>
              <SearchBox
                accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
                value={address}
                onChange={(val: string) => {
                  setAddress(val)
                  setCoords(null)
                }}
                onRetrieve={(res: any) => {
                  const feature = res.features[0]
                  setAddress(feature.properties.full_address ?? feature.properties.place_formatted)
                  setCoords({
                    lat: feature.geometry.coordinates[1],
                    lng: feature.geometry.coordinates[0],
                  })
                }}
                options={{ language: 'en', country: 'CA' }}
                theme={{
                  variables: {
                    borderRadius: '12px',
                    border: '1px solid #8BD4B9',
                    boxShadow: 'none',
                    fontFamily: 'inherit',
                    colorBackground: '#ffffff',
                    colorText: '#448383',
                    colorBackgroundHover: '#D1E8B0',
                  },
                  cssText: `
                    input[type="text"],
                    input:not([type]) {
                      border-radius: 9999px !important;
                      background-color: #D1E8B0 !important;
                      border: none !important;
                      color: #448383 !important;
                    }
                  `,
                }}
              />
            </div>
          </div>
          {coords && (
            <p style={{ fontSize: '12px', color: '#62B794', marginTop: '8px' }}>Address confirmed</p>
          )}
        </div>

        <div>
          <label style={labelStyle}>Available from</label>
          <input
            type="datetime-local"
            value={availableAt}
            onChange={(e) => setAvailableAt(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea
            placeholder="e.g. Oil is from deep fryers, already filtered following guide, stored in drums"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            style={{
              backgroundColor: '#D1E8B0',
              borderRadius: '16px',
              border: 'none',
              padding: '12px 16px',
              color: '#448383',
              fontSize: '14px',
              outline: 'none',
              width: '100%',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !coords}
          style={{
            display: 'block',
            margin: '32px auto 0',
            borderRadius: '9999px',
            border: 'none',
            padding: '14px 48px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading || !coords ? 'not-allowed' : 'pointer',
            backgroundColor: '#448383',
            color: '#ffffff',
            opacity: loading || !coords ? 0.6 : 1,
          }}
        >
          {loading ? 'Posting...' : 'Post Listing'}
        </button>

      </div>
    </div>
  )
}