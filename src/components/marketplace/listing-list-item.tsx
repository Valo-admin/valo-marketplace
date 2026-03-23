import Image from 'next/image'
import Link from 'next/link'
import { formatGTQ } from '@/lib/format'
import FavoriteButton from '@/components/commerce/favorite-button'
import AddToCartButton from '@/components/commerce/add-to-cart-button'

export type MarketplaceListItem = {
  id: number
  title: string
  description: string | null
  href: string
  imageUrl: string | null
  categoryName: string
  sellerName: string
  country: string | null
  denomination: string | null
  year: number | null
  listingType: 'fixed_price' | 'auction'
  price: number | null
  currentPrice: number | null
  endsAt: string | null
  allowOffers: boolean
  shippingMode: 'fixed' | 'cash_on_delivery'
  shippingPrice: number | null
}

function shippingText(item: MarketplaceListItem) {
  if (item.shippingMode === 'fixed' && item.shippingPrice !== null) {
    return `Envío: ${formatGTQ(item.shippingPrice)}`
  }

  return 'Pago de envío contra entrega'
}

function categoryChipClass(categoryName: string) {
  const name = categoryName.toLowerCase()

  if (name.includes('moneda')) return 'bg-sky-50 text-sky-700 border-sky-200'
  if (name.includes('billete')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (name.includes('medalla')) return 'bg-amber-50 text-amber-700 border-amber-200'
  if (name.includes('token') || name.includes('exonumia')) return 'bg-violet-50 text-violet-700 border-violet-200'
  if (name.includes('lote')) return 'bg-rose-50 text-rose-700 border-rose-200'
  if (name.includes('bibli')) return 'bg-cyan-50 text-cyan-700 border-cyan-200'

  return 'bg-slate-100 text-slate-700 border-slate-200'
}

function listingTypeChipClass(listingType: 'fixed_price' | 'auction') {
  if (listingType === 'auction') {
    return 'bg-amber-100 text-amber-800 border-amber-200'
  }

  return 'bg-slate-950 text-white border-slate-950'
}

export default function ListingListItem({
  item,
  initialIsFavorite = false,
  isAuthenticated = false,
}: {
  item: MarketplaceListItem
  initialIsFavorite?: boolean
  isAuthenticated?: boolean
}) {
  const displayPrice =
    item.listingType === 'auction'
      ? item.currentPrice ?? item.price ?? 0
      : item.price ?? 0

  return (
    <article className="group rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:shadow-xl">
      <div className="grid items-center gap-4 lg:grid-cols-[150px_minmax(0,1fr)_240px] xl:grid-cols-[160px_minmax(0,1fr)_250px]">
        <div className="relative">
          <Link
            href={item.href}
            className="block h-fit overflow-hidden rounded-[22px] bg-slate-100"
          >
            <div className="relative aspect-square w-full lg:w-[150px] xl:w-[160px]">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,#f8e7bf,transparent_35%),linear-gradient(135deg,#f8fafc,#e2e8f0)]">
                  <span className="text-sm font-medium text-slate-500">
                    Sin imagen
                  </span>
                </div>
              )}
            </div>
          </Link>

          <div className="absolute right-3 top-3">
            <FavoriteButton
              listingId={item.id}
              initialIsFavorite={initialIsFavorite}
              isAuthenticated={isAuthenticated}
              variant="icon"
            />
          </div>
        </div>

        <div className="min-w-0 self-center">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-slate-500">
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
              Vendido por
            </span>

            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
              {item.sellerName}
            </span>
          </div>

          <Link href={item.href}>
            <h3 className="mt-2 text-[1.85rem] font-semibold leading-tight tracking-tight text-slate-950 transition group-hover:text-slate-700">
              {item.title}
            </h3>
          </Link>

          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryChipClass(
                item.categoryName
              )}`}
            >
              {item.categoryName}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${listingTypeChipClass(
                item.listingType
              )}`}
            >
              {item.listingType === 'auction' ? 'Subasta' : 'Venta directa'}
            </span>

            {item.listingType === 'fixed_price' && item.allowOffers && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Acepta ofertas
              </span>
            )}

            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {shippingText(item)}
            </span>

            {item.listingType === 'auction' && item.endsAt && (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Cierra {new Date(item.endsAt).toLocaleString('es-GT')}
              </span>
            )}
          </div>
        </div>

        <div className="self-center rounded-[22px] border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {item.listingType === 'auction' ? 'Puja actual' : 'Precio'}
          </p>

          <p className="mt-2 text-[1.75rem] font-semibold tracking-tight text-slate-950">
            {formatGTQ(displayPrice)}
          </p>

          <p className="mt-2 text-sm leading-5 text-slate-500">
            {shippingText(item)}
          </p>

          {item.listingType === 'auction' && item.price && (
            <p className="mt-1 text-sm text-slate-500">
              Base: {formatGTQ(item.price)}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            {item.listingType === 'auction' ? (
              <>
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Ofertar
                </Link>

                <FavoriteButton
                  listingId={item.id}
                  initialIsFavorite={initialIsFavorite}
                  isAuthenticated={isAuthenticated}
                  variant="button"
                />
              </>
            ) : (
              <>
                <AddToCartButton
                  listingId={item.id}
                  isAuthenticated={isAuthenticated}
                  label="Comprar"
                  mode="buy"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                />

                <AddToCartButton
                  listingId={item.id}
                  isAuthenticated={isAuthenticated}
                  label="Carrito"
                  mode="cart"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}