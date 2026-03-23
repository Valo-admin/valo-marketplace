import Link from 'next/link'
import { notFound } from 'next/navigation'
import ListingGallery from '@/components/listings/listing-gallery'
import ListingShareButton from '@/components/listings/listing-share-button'
import FavoriteButton from '@/components/commerce/favorite-button'
import AddToCartButton from '@/components/commerce/add-to-cart-button'
import { formatGTQ } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'

type ListingRow = {
  id: number
  title: string
  description: string | null
  listing_type: 'fixed_price' | 'auction'
  status: string
  price: number | null
  currency: string | null
  country: string | null
  denomination: string | null
  year_start: number | null
  year_end: number | null
  metal: string | null
  grade: string | null
  category_id: number | null
  seller_id: string
  allow_offers: boolean
  shipping_mode: 'fixed' | 'cash_on_delivery'
  shipping_price: number | null
  is_certified: boolean | null
  certification_company: string | null
  certification_number: string | null
  created_at: string
}

type ListingImageRow = {
  storage_path: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
}

type AuctionRow = {
  start_price: number | null
  current_price: number | null
  reserve_price: number | null
  starts_at: string
  ends_at: string
}

type ProfileRow = {
  display_name: string | null
  city: string | null
  country: string | null
  kyc_status: string | null
}

type CategoryRow = {
  name: string
  slug: string
}

function buildPublicImageUrl(path: string | null) {
  if (!path || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${path}`
}

function shippingText(listing: ListingRow) {
  if (listing.shipping_mode === 'fixed' && listing.shipping_price !== null) {
    return `Envío: ${formatGTQ(listing.shipping_price)}`
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

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const listingId = Number(id)

  if (!Number.isFinite(listingId)) {
    notFound()
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: listing } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      description,
      listing_type,
      status,
      price,
      currency,
      country,
      denomination,
      year_start,
      year_end,
      metal,
      grade,
      category_id,
      seller_id,
      allow_offers,
      shipping_mode,
      shipping_price,
      is_certified,
      certification_company,
      certification_number,
      created_at
    `)
    .eq('id', listingId)
    .eq('status', 'published')
    .maybeSingle()

  if (!listing) {
    notFound()
  }

  const [{ data: images }, { data: auction }, { data: seller }, { data: category }] =
    await Promise.all([
      supabase
        .from('listing_images')
        .select('storage_path, alt_text, is_primary, sort_order')
        .eq('listing_id', listing.id)
        .order('is_primary', { ascending: false })
        .order('sort_order', { ascending: true }),

      listing.listing_type === 'auction'
        ? supabase
            .from('auctions')
            .select('start_price, current_price, reserve_price, starts_at, ends_at')
            .eq('listing_id', listing.id)
            .maybeSingle()
        : Promise.resolve({ data: null as AuctionRow | null }),

      supabase
        .from('profiles')
        .select('display_name, city, country, kyc_status')
        .eq('id', listing.seller_id)
        .maybeSingle(),

      listing.category_id
        ? supabase
            .from('categories')
            .select('name, slug')
            .eq('id', listing.category_id)
            .maybeSingle()
        : Promise.resolve({ data: null as CategoryRow | null }),
    ])

  const { data: favorite } =
    user
      ? await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', listing.id)
          .maybeSingle()
      : { data: null }

  const isFavorite = Boolean(favorite)

  const galleryImages =
    (images ?? []).map((image: ListingImageRow, index) => ({
      url: buildPublicImageUrl(image.storage_path) ?? '',
      alt: image.alt_text || `${listing.title} - imagen ${index + 1}`,
    })) ?? []

  const displayPrice =
    listing.listing_type === 'auction'
      ? auction?.current_price ?? auction?.start_price ?? 0
      : listing.price ?? 0

  const loginHref = `/login?message=${encodeURIComponent('Inicia sesión para continuar con esta acción.')}`
  const tertiaryActionHref = user ? '#oferta' : loginHref

  const sellerName =
    seller?.display_name?.trim() ||
    'Vendedor Valo'

  const specs = [
    listing.country ? { label: 'País', value: listing.country } : null,
    listing.denomination ? { label: 'Denominación', value: listing.denomination } : null,
    listing.year_start ? { label: 'Año', value: String(listing.year_start) } : null,
    listing.metal ? { label: 'Metal', value: listing.metal } : null,
    listing.grade ? { label: 'Grado', value: listing.grade } : null,
    category?.name ? { label: 'Categoría', value: category.name } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <main className="bg-[linear-gradient(180deg,#fcfbf7_0%,#fffdf8_100%)] pb-28 lg:pb-12">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            ← Volver al marketplace
          </Link>

          <div className="flex items-center gap-3">
            <FavoriteButton
              listingId={listing.id}
              initialIsFavorite={isFavorite}
              isAuthenticated={!!user}
              variant="icon"
            />
            <ListingShareButton title={listing.title} />
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
                  Vendido por
                </span>

                <span className="font-semibold uppercase tracking-[0.18em] text-amber-600">
                  {sellerName}
                </span>

                {seller?.city && (
                  <span>
                    • {seller.city}
                    {seller.country ? `, ${seller.country}` : ''}
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                {listing.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                {category?.name && (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryChipClass(
                      category.name
                    )}`}
                  >
                    {category.name}
                  </span>
                )}

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${listingTypeChipClass(
                    listing.listing_type
                  )}`}
                >
                  {listing.listing_type === 'auction' ? 'Subasta' : 'Venta directa'}
                </span>

                {listing.allow_offers && listing.listing_type === 'fixed_price' && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Acepta ofertas
                  </span>
                )}

                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {shippingText(listing)}
                </span>

                {listing.is_certified && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Certificada
                  </span>
                )}

                {listing.listing_type === 'auction' && auction?.ends_at && (
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Cierra {new Date(auction.ends_at).toLocaleString('es-GT')}
                  </span>
                )}
              </div>

              <div className="mt-6">
                <ListingGallery images={galleryImages} title={listing.title} />
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
                  Descripción
                </p>
                <div className="mt-4 text-sm leading-8 text-slate-700">
                  {listing.description ? (
                    <p>{listing.description}</p>
                  ) : (
                    <p>El vendedor aún no agregó una descripción detallada.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
                  Ficha de la pieza
                </p>

                <div className="mt-4 grid gap-4">
                  {specs.map((spec) => (
                    <div key={spec.label} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {spec.label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {(listing.is_certified || listing.certification_company || listing.certification_number) && (
              <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
                  Certificación
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Estado
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {listing.is_certified ? 'Certificada' : 'No indicada'}
                    </p>
                  </div>

                  {listing.certification_company && (
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Certificadora
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {listing.certification_company}
                      </p>
                    </div>
                  )}

                  {listing.certification_number && (
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Número
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {listing.certification_number}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <aside id="buy-box" className="space-y-5 xl:sticky xl:top-[104px]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {listing.listing_type === 'auction' ? 'Puja actual' : 'Precio'}
              </p>

              <p className="mt-2 text-[2.4rem] font-semibold tracking-tight text-slate-950">
                {formatGTQ(displayPrice)}
              </p>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Envío
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {shippingText(listing)}
                  </p>
                </div>

                {listing.listing_type === 'auction' && auction?.ends_at && (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Cierre
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {new Date(auction.ends_at).toLocaleString('es-GT')}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Vendedor
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {sellerName}
                  </p>
                </div>
              </div>

              <div id="acciones" className="mt-6 grid gap-3">
                {listing.listing_type === 'auction' ? (
                  <>
                    <Link
                      href={user ? '#acciones' : loginHref}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Pujar ahora
                    </Link>

                    <FavoriteButton
                      listingId={listing.id}
                      initialIsFavorite={isFavorite}
                      isAuthenticated={!!user}
                      variant="button"
                    />
                  </>
                ) : (
                  <>
                    <AddToCartButton
                      listingId={listing.id}
                      isAuthenticated={!!user}
                      label="Comprar ahora"
                      mode="buy"
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                    />

                    <AddToCartButton
                      listingId={listing.id}
                      isAuthenticated={!!user}
                      label="Agregar al carrito"
                      mode="cart"
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                    />

                    {listing.allow_offers && (
                      <Link
                        href={tertiaryActionHref}
                        className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Hacer oferta
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
                Confianza Valo
              </p>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <p>• Marketplace público con experiencia premium</p>
                <p>• Información estructurada para numismática real</p>
                <p>• Compra y venta con identidad clara de vendedor</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {listing.listing_type === 'auction' ? 'Puja actual' : 'Precio'}
            </p>
            <p className="truncate text-xl font-semibold text-slate-950">
              {formatGTQ(displayPrice)}
            </p>
          </div>

          {listing.listing_type === 'auction' ? (
            <Link
              href={user ? '#acciones' : loginHref}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Pujar
            </Link>
          ) : (
            <AddToCartButton
              listingId={listing.id}
              isAuthenticated={!!user}
              label="Comprar"
              mode="buy"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            />
          )}
        </div>
      </div>
    </main>
  )
}