import Link from 'next/link'
import CategoryGrid from '@/components/marketplace/category-grid'
import ListingListItem, {
  type MarketplaceListItem,
} from '@/components/marketplace/listing-list-item'
import { createClient } from '@/lib/supabase/server'

type ListingRow = {
  id: number
  title: string
  description: string | null
  listing_type: 'fixed_price' | 'auction'
  price: number | null
  country: string | null
  denomination: string | null
  year_start: number | null
  category_id: number | null
  seller_id: string
  allow_offers: boolean
  shipping_mode: 'fixed' | 'cash_on_delivery'
  shipping_price: number | null
  created_at: string
}

type AuctionRow = {
  listing_id: number
  current_price: number | null
  ends_at: string
}

type ImageRow = {
  listing_id: number
  storage_path: string
  is_primary: boolean
  sort_order: number
}

type ProfileRow = {
  id: string
  display_name: string | null
}

type CategoryRow = {
  id: number
  name: string
  slug: string
}

function buildPublicImageUrl(path: string | null) {
  if (!path || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${path}`
}

function sanitizeQuery(value: string) {
  return value.replace(/[%(),]/g, ' ').trim()
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    type?: string
    sort?: string
    category?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const now = new Date().toISOString()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const q = String(params.q ?? '').trim()
  const type =
    params.type === 'auction' || params.type === 'fixed_price'
      ? params.type
      : 'all'
  const sort =
    params.sort === 'price_asc' ||
    params.sort === 'price_desc' ||
    params.sort === 'ending'
      ? params.sort
      : 'newest'
  const categorySlug = String(params.category ?? '').trim()

  const [
    { data: categories },
    { count: allListingsCount },
    { count: activeAuctionCount },
    { count: activeFixedCount },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),

    supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),

    supabase
      .from('auctions')
      .select('*', { count: 'exact', head: true })
      .gt('ends_at', now),

    supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .eq('listing_type', 'fixed_price'),
  ])

  const selectedCategory = (categories ?? []).find(
    (item) => item.slug === categorySlug
  )

  let listingsQuery = supabase
    .from('listings')
    .select(
      'id, title, description, listing_type, price, country, denomination, year_start, category_id, seller_id, allow_offers, shipping_mode, shipping_price, created_at'
    )
    .eq('status', 'published')
    .limit(30)

  if (type !== 'all') {
    listingsQuery = listingsQuery.eq('listing_type', type)
  }

  if (selectedCategory) {
    listingsQuery = listingsQuery.eq('category_id', selectedCategory.id)
  }

  const safeQ = sanitizeQuery(q)
  if (safeQ) {
    listingsQuery = listingsQuery.or(
      `title.ilike.%${safeQ}%,description.ilike.%${safeQ}%,denomination.ilike.%${safeQ}%,country.ilike.%${safeQ}%`
    )
  }

  const { data: listings } = await listingsQuery.order('created_at', {
    ascending: false,
  })

  const listingIds = (listings ?? []).map((item) => item.id)
  const sellerIds = [...new Set((listings ?? []).map((item) => item.seller_id))]

  const [{ data: listingImages }, { data: listingAuctions }, { data: sellers }] =
    await Promise.all([
      listingIds.length > 0
        ? supabase
            .from('listing_images')
            .select('listing_id, storage_path, is_primary, sort_order')
            .in('listing_id', listingIds)
            .order('is_primary', { ascending: false })
            .order('sort_order', { ascending: true })
        : Promise.resolve({ data: [] as ImageRow[] }),

      listingIds.length > 0
        ? supabase
            .from('auctions')
            .select('listing_id, current_price, ends_at')
            .in('listing_id', listingIds)
            .gt('ends_at', now)
        : Promise.resolve({ data: [] as AuctionRow[] }),

      sellerIds.length > 0
        ? supabase.from('profiles').select('id, display_name').in('id', sellerIds)
        : Promise.resolve({ data: [] as ProfileRow[] }),
    ])

  const { data: favorites } =
    user && listingIds.length > 0
      ? await supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', user.id)
          .in('listing_id', listingIds)
      : { data: [] as { listing_id: number }[] }

  const favoriteSet = new Set((favorites ?? []).map((item) => item.listing_id))

  const { data: featuredAuctionRows } = await supabase
    .from('auctions')
    .select('listing_id, current_price, ends_at')
    .gt('ends_at', now)
    .order('ends_at', { ascending: true })
    .limit(4)

  const featuredAuctionIds = (featuredAuctionRows ?? []).map((item) => item.listing_id)

  const { data: featuredAuctionListings } =
    featuredAuctionIds.length > 0
      ? await supabase
          .from('listings')
          .select(
            'id, title, description, listing_type, price, country, denomination, year_start, category_id, seller_id, allow_offers, shipping_mode, shipping_price, created_at'
          )
          .in('id', featuredAuctionIds)
          .eq('status', 'published')
      : { data: [] as ListingRow[] }

  const allRelevantIds = [...new Set([...(listingIds ?? []), ...(featuredAuctionIds ?? [])])]
  const allRelevantSellerIds = [
    ...new Set([
      ...(sellerIds ?? []),
      ...((featuredAuctionListings ?? []).map((item) => item.seller_id)),
    ]),
  ]

  const [{ data: allImages }, { data: allSellers }] = await Promise.all([
    allRelevantIds.length > 0
      ? supabase
          .from('listing_images')
          .select('listing_id, storage_path, is_primary, sort_order')
          .in('listing_id', allRelevantIds)
          .order('is_primary', { ascending: false })
          .order('sort_order', { ascending: true })
      : Promise.resolve({ data: [] as ImageRow[] }),

    allRelevantSellerIds.length > 0
      ? supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', allRelevantSellerIds)
      : Promise.resolve({ data: [] as ProfileRow[] }),
  ])

  const categoryMap = new Map<number, CategoryRow>(
    ((categories ?? []) as CategoryRow[]).map((item) => [item.id, item])
  )

  const sellerMap = new Map<string, ProfileRow>(
    ((allSellers ?? sellers ?? []) as ProfileRow[]).map((item) => [item.id, item])
  )

  const imageMap = new Map<number, string>()
  for (const image of ((allImages ?? listingImages ?? []) as ImageRow[])) {
    if (!imageMap.has(image.listing_id)) {
      imageMap.set(image.listing_id, image.storage_path)
    }
  }

  const auctionMap = new Map<number, AuctionRow>(
    ([...(listingAuctions ?? []), ...(featuredAuctionRows ?? [])] as AuctionRow[]).map(
      (item) => [item.listing_id, item]
    )
  )

  function toListItem(listing: ListingRow): MarketplaceListItem {
    const category = listing.category_id ? categoryMap.get(listing.category_id) : null
    const seller = sellerMap.get(listing.seller_id)
    const auction = auctionMap.get(listing.id)

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      href: `/listings/${listing.id}`,
      imageUrl: buildPublicImageUrl(imageMap.get(listing.id) ?? null),
      categoryName: category?.name ?? 'Pieza numismática',
      sellerName: seller?.display_name?.trim() || 'Vendedor Valo',
      country: listing.country,
      denomination: listing.denomination,
      year: listing.year_start,
      listingType: listing.listing_type,
      price: listing.price,
      currentPrice: auction?.current_price ?? null,
      endsAt: auction?.ends_at ?? null,
      allowOffers: Boolean(listing.allow_offers),
      shippingMode: listing.shipping_mode,
      shippingPrice: listing.shipping_price,
    }
  }

  const marketplaceItems = ((listings ?? []) as ListingRow[]).map(toListItem)

  if (sort === 'price_asc') {
    marketplaceItems.sort((a, b) => {
      const priceA =
        a.listingType === 'auction' ? (a.currentPrice ?? a.price ?? 0) : (a.price ?? 0)
      const priceB =
        b.listingType === 'auction' ? (b.currentPrice ?? b.price ?? 0) : (b.price ?? 0)
      return priceA - priceB
    })
  }

  if (sort === 'price_desc') {
    marketplaceItems.sort((a, b) => {
      const priceA =
        a.listingType === 'auction' ? (a.currentPrice ?? a.price ?? 0) : (a.price ?? 0)
      const priceB =
        b.listingType === 'auction' ? (b.currentPrice ?? b.price ?? 0) : (b.price ?? 0)
      return priceB - priceA
    })
  }

  if (sort === 'ending') {
    marketplaceItems.sort((a, b) => {
      const endA = a.endsAt ? new Date(a.endsAt).getTime() : Number.MAX_SAFE_INTEGER
      const endB = b.endsAt ? new Date(b.endsAt).getTime() : Number.MAX_SAFE_INTEGER
      return endA - endB
    })
  }

  const featuredAuctionMap = new Map<number, ListingRow>(
    ((featuredAuctionListings ?? []) as ListingRow[]).map((item) => [item.id, item])
  )

  const featuredAuctionItems = ((featuredAuctionRows ?? []) as AuctionRow[])
    .map((auction) => featuredAuctionMap.get(auction.listing_id))
    .filter(Boolean)
    .map((listing) => toListItem(listing as ListingRow))

  return (
    <main className="bg-[linear-gradient(180deg,#fcfbf7_0%,#fffdf8_100%)]">
      <section className="sticky top-[89px] z-40 border-b border-slate-200 bg-slate-950/96 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-3 lg:px-10">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300">
                Marketplace activo
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                {marketplaceItems.length} visibles
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                {allListingsCount ?? 0} activos
              </span>

              {q && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-900">
                  {q}
                </span>
              )}
            </div>

            <form
              action="/marketplace"
              method="get"
              className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <input type="hidden" name="q" value={q} />

              <select
                name="category"
                defaultValue={categorySlug}
                className="h-11 rounded-2xl border border-white/15 bg-white px-4 text-sm text-slate-900 outline-none"
              >
                <option value="">Todas</option>
                {(categories ?? []).map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                name="type"
                defaultValue={type}
                className="h-11 rounded-2xl border border-white/15 bg-white px-4 text-sm text-slate-900 outline-none"
              >
                <option value="all">Todo</option>
                <option value="fixed_price">Venta directa</option>
                <option value="auction">Subasta</option>
              </select>

              <select
                name="sort"
                defaultValue={sort}
                className="h-11 rounded-2xl border border-white/15 bg-white px-4 text-sm text-slate-900 outline-none"
              >
                <option value="newest">Más recientes</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="ending">Cierre más próximo</option>
              </select>

              <button
                type="submit"
                className="h-11 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Aplicar
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6 pt-8 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
              Mercado público
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {q ? `Resultados para “${q}”` : 'Todos los listings activos'}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700">
              {activeAuctionCount ?? 0} subastas activas
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700">
              {activeFixedCount ?? 0} ventas directas
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {marketplaceItems.length > 0 ? (
            marketplaceItems.map((item) => (
              <ListingListItem
                key={`market-${item.id}`}
                item={item}
                initialIsFavorite={favoriteSet.has(item.id)}
                isAuthenticated={!!user}
              />
            ))
          ) : (
            <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h3 className="text-2xl font-semibold text-slate-950">
                No encontramos piezas con esos filtros
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                Prueba otra combinación de categoría, tipo o criterio de ordenamiento para descubrir más listings.
              </p>
              <Link
                href="/marketplace"
                className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Ver todo el marketplace
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="subastas" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
              Subastas destacadas
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Cierres próximos del marketplace
            </h2>
          </div>

          <Link
            href="/marketplace?type=auction&sort=ending"
            className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Ver todas las subastas
          </Link>
        </div>

        {featuredAuctionItems.length > 0 ? (
          <div className="space-y-4">
            {featuredAuctionItems.map((item) => (
              <ListingListItem
                key={`auction-${item.id}`}
                item={item}
                initialIsFavorite={favoriteSet.has(item.id)}
                isAuthenticated={!!user}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h3 className="text-2xl font-semibold text-slate-950">
              Aún no hay subastas activas destacadas
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              En cuanto haya cierres próximos, aparecerán aquí como parte de la vitrina pública del mercado.
            </p>
          </div>
        )}
      </section>

      <section id="categorias" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
            Categorías
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Explora por tipo de colección
          </h2>
        </div>

        <CategoryGrid categories={(categories ?? []) as CategoryRow[]} />
      </section>
    </main>
  )
}