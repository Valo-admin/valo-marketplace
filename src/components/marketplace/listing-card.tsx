import Image from 'next/image'
import Link from 'next/link'
import { formatGTQ } from '@/lib/format'

export type MarketplaceCardItem = {
  id: number
  title: string
  href: string
  imageUrl: string | null
  categoryName: string
  sellerName: string
  country: string | null
  year: number | null
  listingType: 'fixed_price' | 'auction'
  price: number | null
  currentPrice: number | null
  endsAt: string | null
  allowOffers: boolean
}

export default function ListingCard({ item }: { item: MarketplaceCardItem }) {
  const displayPrice =
    item.listingType === 'auction'
      ? item.currentPrice ?? item.price ?? 0
      : item.price ?? 0

  return (
    <Link
      href={item.href}
      className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,#f8e7bf,transparent_35%),linear-gradient(135deg,#f8fafc,#e2e8f0)]">
            <span className="text-sm font-medium text-slate-500">
              Sin imagen
            </span>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
            {item.categoryName}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
              item.listingType === 'auction'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950 text-white'
            }`}
          >
            {item.listingType === 'auction' ? 'Subasta' : 'Venta directa'}
          </span>

          {item.listingType === 'fixed_price' && item.allowOffers && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
              Acepta ofertas
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            {item.sellerName}
          </p>

          {(item.country || item.year) && (
            <p className="text-xs text-slate-500">
              {[item.country, item.year].filter(Boolean).join(' • ')}
            </p>
          )}
        </div>

        <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-slate-950">
          {item.title}
        </h3>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              {item.listingType === 'auction' ? 'Puja actual' : 'Precio'}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {formatGTQ(displayPrice)}
            </p>

            {item.listingType === 'auction' && item.endsAt && (
              <p className="mt-2 text-xs text-slate-500">
                Cierra: {new Date(item.endsAt).toLocaleString('es-GT')}
              </p>
            )}
          </div>

          <span className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
            Ver pieza
          </span>
        </div>
      </div>
    </Link>
  )
}