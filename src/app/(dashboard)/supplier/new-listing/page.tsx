'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculatePrice } from '@/lib/pricing'
import dynamic from 'next/dynamic'

// @ts-ignore
const SearchBox = dynamic(
  () => import('@mapbox/search-js-react').then(mod => mod.SearchBox),
  { ssr: false }
)

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

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">New listing</h1>
      <p className="text-gray-500 text-sm mb-8">Post your available used oil for pickup</p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Volume (litres)</label>
          <input
            type="number"
            placeholder="e.g. 50"
            value={volume}
            onChange={e => setVolume(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Pickup address</label>
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
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: 'none',
                fontFamily: 'inherit',
                colorBackground: '#ffffff',
              }
            }}
          />
          {coords && (
            <p className="text-xs text-green-600 mt-1">Address confirmed</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Available from</label>
          <input
            type="datetime-local"
            value={availableAt}
            onChange={e => setAvailableAt(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Notes (optional)</label>
          <textarea
            placeholder="e.g. Oil is from deep fryers, stored in drums"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !coords}
          className="w-full bg-green-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-green-700 disabled:opacity-50 mt-2"
        >
          {loading ? 'Posting...' : 'Post listing'}
        </button>
      </div>
    </div>
  )
}