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

const statusStyles: Record<string, string> = {
  active: 'bg-gray-100 text-gray-700',
  claimed: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
}

export default async function ConsumerOrdersPage() {
  noStore()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Avoid nested embed — it can fail if FK hint/RLS on listings differs from direct select
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Your orders</h1>
        <p className="text-gray-500 text-sm mt-1">All your claims and ratings</p>
      </div>

      {claimsError && (
        <p className="text-red-600 text-sm mb-4" role="alert">
          Could not load orders. Check Supabase RLS allows <code className="bg-red-50 px-1 rounded">select</code> on{' '}
          <code className="bg-red-50 px-1 rounded">claims</code> for your user.
        </p>
      )}

      {rows.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No orders yet</p>
          <p className="text-sm mt-1">Claim a listing to see it here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((claim) => {
            const listing = listingsById.get(claim.listing_id)
            const rating = ratingsByClaim.get(claim.id)
            const badgeClass = statusStyles[claim.status] ?? 'bg-gray-100 text-gray-700'
            return (
              <div key={claim.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">Order #{shortId(claim.id)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {listing?.volume_litres ?? 0}L · {listing?.address ?? '—'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(claim.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${badgeClass}`}>
                      {claim.status}
                    </span>
                    <p className="text-green-600 font-semibold">${claim.final_price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  {rating ? (
                    <div>
                      <p className="text-amber-500 text-sm font-medium">
                        ★ {rating.stars}/5
                      </p>
                      {rating.comment && (
                        <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{rating.comment}&rdquo;</p>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={`/consumer/confirmation?claimId=${claim.id}`}
                      className="inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
                    >
                      View this order
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
