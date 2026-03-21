import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'


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
  const ratingAvg =
    ratingCount > 0
      ? ratingStars.reduce((s, r) => s + (r.stars as number), 0) / ratingCount
      : null

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    claimed: 'bg-amber-100 text-amber-700',
    completed: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Hey, {profile?.name ?? 'Supplier'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your oil listings</p>
          {ratingAvg !== null ? (
            <p className="text-amber-500 text-sm mt-2">
              ★ {ratingAvg.toFixed(1)} average · {ratingCount} reviews
            </p>
          ) : (
            <p className="text-gray-400 text-sm mt-2">No reviews yet</p>
          )}
        </div>
        <Link
          href="/supplier/new-listing"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
        >
          + New listing
        </Link>
      </div>

      {listings && listings.length > 0 ? (
        <div className="flex flex-col gap-4">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{listing.volume_litres}L of used oil</p>
                  <p className="text-sm text-gray-500 mt-1">{listing.address}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Available: {new Date(listing.available_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[listing.status]}`}>
                  {listing.status}
                </span>
              </div>
              <p className="text-green-600 font-semibold mt-3">
                You earn ~${(listing.price_base * listing.volume_litres * 0.93).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">
                ${listing.price_base.toFixed(2)}/L · {listing.volume_litres}L · after 7% fee
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No listings yet</p>
          <p className="text-sm mt-1">Post your first oil pickup above</p>
        </div>
      )}
    </div>
    
  )
  
}
