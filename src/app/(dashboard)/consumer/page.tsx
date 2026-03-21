'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Listing = {
  id: string
  supplier_id: string
  volume_litres: number
  price_base: number
  address: string
  available_at: string
  status: string
  notes: string
  lat: number | null
  lng: number | null
}

const TORONTO_CENTER: [number, number] = [-79.3832, 43.6532]
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11'

function applyMarkerStyles(el: HTMLDivElement, isSelected: boolean, priceLabel: string) {
  el.textContent = priceLabel
  el.style.cssText = [
    'cursor: pointer',
    'user-select: none',
    'border-radius: 9999px',
    'padding: 6px 12px',
    'font-size: 12px',
    'font-weight: 700',
    'color: #ffffff',
    'box-shadow: 0 2px 6px rgba(0,0,0,0.2)',
    `background-color: ${isSelected ? '#15803d' : '#16a34a'}`,
    `transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}`,
    'transition: transform 0.15s ease, background-color 0.15s ease',
    'white-space: nowrap',
  ].join('; ')
}

export default function ConsumerDashboard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [selected, setSelected] = useState<Listing | null>(null)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [profile, setProfile] = useState<{ name: string } | null>(null)
  const [supplierRatingStats, setSupplierRatingStats] = useState<Record<string, { avg: number; count: number }>>({})
  const [mapReady, setMapReady] = useState(false)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker; el: HTMLDivElement }>>(new Map())
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const getPricing = useCallback((listing: Listing) => {
    const base = listing.price_base * listing.volume_litres
    return {
      oilValueTotal: base,
      serviceFee: base * 0.05,
      consumerTotal: base * 1.05,
    }
  }, [])

  // Mount flag — ensures map container has real DOM dimensions
  useEffect(() => {
    setMounted(true)
  }, [])

  // Data fetch
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase
        .from('users').select('name').eq('id', user.id).single()
      setProfile(prof)

      const { data } = await supabase
        .from('listings').select('*').eq('status', 'active')
        .order('created_at', { ascending: false })
      const list = data ?? []
      setListings(list)

      const supplierIds = [...new Set(list.map((l) => l.supplier_id))]
      if (supplierIds.length > 0) {
        const { data: ratingRows } = await supabase
          .from('ratings').select('supplier_id, stars').in('supplier_id', supplierIds)

        const agg: Record<string, { sum: number; count: number }> = {}
        for (const row of ratingRows ?? []) {
          const id = row.supplier_id as string
          if (!agg[id]) agg[id] = { sum: 0, count: 0 }
          agg[id].sum += row.stars as number
          agg[id].count += 1
        }
        const stats: Record<string, { avg: number; count: number }> = {}
        for (const id of supplierIds) {
          const a = agg[id]
          if (a?.count > 0) stats[id] = { avg: a.sum / a.count, count: a.count }
        }
        setSupplierRatingStats(stats)
      }

      setLoading(false)
    }
    load()
  }, [router])

  // Map init — only after mounted so container has real dimensions
  useEffect(() => {
    if (!mounted) return
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim()
    if (!token || mapRef.current) return

    const initMap = () => {
      const container = mapContainerRef.current
      if (!container) return
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        setTimeout(initMap, 100)
        return
      }

      mapboxgl.accessToken = token
      const map = new mapboxgl.Map({
        container,
        style: MAP_STYLE,
        center: TORONTO_CENTER,
        zoom: 11,
      })
      mapRef.current = map

      map.on('load', () => {
        map.resize()
        setMapReady(true)
        setTimeout(() => map.resize(), 200)
      })

      map.on('error', (e) => console.error('[mapbox]', e))

      const resize = () => map.resize()
      window.addEventListener('resize', resize)

      return () => {
        window.removeEventListener('resize', resize)
      }
    }

    const cleanup = initMap()

    return () => {
      cleanup?.()
      setMapReady(false)
      markersRef.current.forEach(({ marker }) => marker.remove())
      markersRef.current.clear()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [mounted])

  // Markers sync
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const withCoords = listings.filter((l) => l.lat != null && l.lng != null)
    const newIds = new Set(withCoords.map((l) => l.id))

    // Remove stale markers
    markersRef.current.forEach(({ marker }, id) => {
      if (!newIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    })

    // Add or update markers
    for (const listing of withCoords) {
      const priceLabel = `$${getPricing(listing).consumerTotal.toFixed(2)}`
      const isSel = selected?.id === listing.id
      const entry = markersRef.current.get(listing.id)

      if (!entry) {
        const el = document.createElement('div')
        applyMarkerStyles(el, isSel, priceLabel)

        el.addEventListener('click', (e) => {
          e.stopPropagation()
          setSelected(listing)
          setClaimModalOpen(false)
        })

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([listing.lng!, listing.lat!])
          .addTo(map)

        markersRef.current.set(listing.id, { marker, el })
      } else {
        applyMarkerStyles(entry.el, isSel, priceLabel)
        entry.marker.setLngLat([listing.lng!, listing.lat!])
      }
    }
  }, [listings, selected, getPricing, mapReady])

  // Fly to selected + scroll card
  useEffect(() => {
    if (!selected) return
    const map = mapRef.current
    if (map && selected.lat != null && selected.lng != null) {
      map.flyTo({ center: [selected.lng, selected.lat], zoom: 14, essential: true })
    }
    cardRefs.current[selected.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selected])

  async function handleClaim() {
    if (!selected) return
    setClaiming(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const base = selected.price_base * selected.volume_litres

    const { data: claimData } = await supabase.from('claims').insert({
      listing_id: selected.id,
      consumer_id: user.id,
      fulfillment: null,
      final_price: base * 1.05,
      delivery_address: null,
    }).select()

    await supabase.from('listings').update({ status: 'claimed' }).eq('id', selected.id)

    setListings((prev) => prev.filter((l) => l.id !== selected.id))
    setSelected(null)
    setClaimModalOpen(false)
    setClaiming(false)

    if (claimData?.[0]) {
      router.push(`/consumer/confirmation?claimId=${claimData[0].id}`)
    }
  }

  // ─── Styles ───────────────────────────────────────────────────────────────

  const shell: CSSProperties = {
    position: 'fixed', inset: 0, display: 'flex',
    flexDirection: 'row', overflow: 'hidden',
  }

  const mapCol: CSSProperties = {
    position: 'relative', width: '58%',
    height: '100%', backgroundColor: '#e5e7eb',
  }

  const mapInner: CSSProperties = {
    position: 'absolute', top: 0, left: 0,
    right: 0, bottom: 0, width: '100%', height: '100%',
  }

  const listCol: CSSProperties = {
    width: '42%', height: '100%',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', backgroundColor: '#fff',
    borderLeft: '1px solid #e5e7eb',
  }

  const stickyHeader: CSSProperties = {
    position: 'sticky', top: 0, backgroundColor: '#fff',
    zIndex: 10, padding: '16px',
    borderBottom: '1px solid #f3f4f6', flexShrink: 0,
  }

  const listScroll: CSSProperties = {
    flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px',
  }

  const cardBase: CSSProperties = {
    backgroundColor: '#fff', borderRadius: '12px',
    border: '1px solid #e5e7eb', padding: '16px',
    marginBottom: '12px', cursor: 'pointer', boxSizing: 'border-box',
  }

  const cardSelected: CSSProperties = {
    ...cardBase,
    border: '2px solid #16a34a',
    boxShadow: '0 0 0 3px rgba(22,163,74,0.15)',
  }

  return (
    <div style={shell}>

      {/* Map */}
      <div style={mapCol}>
        {mounted && <div ref={mapContainerRef} style={mapInner} />}
        {!mounted && (
          <div style={{ ...mapInner, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading map...</p>
          </div>
        )}
      </div>

      {/* Listings */}
      <div style={listCol}>
        <header style={stickyHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                Hey, {profile?.name ?? 'Converter'} 👋
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                {listings.length} listing{listings.length !== 1 ? 's' : ''} available
              </div>
            </div>
            <Link
              href="/consumer/orders"
              style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Orders →
            </Link>
          </div>
        </header>

        <div style={listScroll}>
          {loading && <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading listings...</p>}

          {!loading && listings.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '60px 0' }}>
              <p style={{ fontSize: '18px', margin: '0 0 8px' }}>No active listings</p>
              <p style={{ fontSize: '14px', margin: 0 }}>Check back soon</p>
            </div>
          )}

          {!loading && listings.map((listing) => {
            const pricing = getPricing(listing)
            const rstats = supplierRatingStats[listing.supplier_id]
            const isSelected = selected?.id === listing.id

            return (
              <div
                key={listing.id}
                ref={(el) => { cardRefs.current[listing.id] = el }}
                onClick={() => { setSelected(listing); setClaimModalOpen(false) }}
                style={isSelected ? cardSelected : cardBase}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: '#111827', margin: 0 }}>
                      {listing.volume_litres}L of used oil
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0' }}>
                      {listing.address}
                    </p>
                    {rstats ? (
                      <p style={{ fontSize: '13px', color: '#d97706', margin: '4px 0 0' }}>
                        ★ {rstats.avg.toFixed(1)}{' '}
                        <span style={{ color: '#b45309' }}>({rstats.count} reviews)</span>
                      </p>
                    ) : (
                      <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>No reviews yet</p>
                    )}
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>
                      Available: {new Date(listing.available_at).toLocaleDateString()}
                    </p>
                    {listing.notes && (
                      <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0', fontStyle: 'italic' }}>
                        {listing.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: '15px', color: '#16a34a', margin: 0 }}>
                      ${pricing.consumerTotal.toFixed(2)}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>pickup price</p>
                  </div>
                </div>

                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setClaimModalOpen(true) }}
                    style={{
                      marginTop: '12px', width: '100%', border: 'none',
                      borderRadius: '8px', backgroundColor: '#16a34a',
                      color: '#fff', fontSize: '14px', fontWeight: 600,
                      padding: '10px 16px', cursor: 'pointer',
                    }}
                  >
                    Claim this listing →
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Claim modal */}
      {claimModalOpen && selected && (() => {
        const pricing = getPricing(selected)
        return (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
            onClick={() => setClaimModalOpen(false)}
          >
            <div
              style={{
                width: '100%', maxWidth: '520px', background: '#fff',
                borderRadius: '20px 20px 0 0', padding: '24px',
                maxHeight: '90vh', overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                Claim this listing
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px' }}>
                {selected.address} · {selected.volume_litres}L
              </p>

              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Oil value</span>
                  <span style={{ fontSize: '14px', color: '#111827' }}>${pricing.oilValueTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Service fee (5%)</span>
                  <span style={{ fontSize: '14px', color: '#111827' }}>+${pricing.serviceFee.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a' }}>${pricing.consumerTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClaim}
                disabled={claiming}
                style={{
                  width: '100%', border: 'none', borderRadius: '10px',
                  backgroundColor: claiming ? '#86efac' : '#16a34a',
                  color: '#fff', fontSize: '14px', fontWeight: 600,
                  padding: '12px', cursor: claiming ? 'not-allowed' : 'pointer',
                }}
              >
                {claiming ? 'Claiming...' : 'Confirm claim'}
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}