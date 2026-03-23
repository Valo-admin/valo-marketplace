import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { clearCartAction, removeCartItemAction } from '@/app/commerce/actions'
import { formatGTQ } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'

type CartRow = {
  id: number
  listing_id: number
  quantity: number
  created_at: string
}

type ListingRow = {
  id: number
  title: string
  price: number | null
  listing_type: 'fixed_price' | 'auction'
  shipping_mode: 'fixed' | 'cash_on_delivery'
  shipping_price: number | null
  status: string
}

type ImageRow = {
  listing_id: number
  storage_path: string
  is_primary: boolean
  sort_order: number
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

export default async function CarritoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Inicia sesión para ver tu carrito.')
  }

  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('id, listing_id, quantity, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const cartRows = (cartItems ?? []) as CartRow[]

  if (cartRows.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
            Carrito
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Tu carrito está vacío
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Aún no has agregado piezas. Explora el marketplace y construye tu primera compra.
          </p>

          <div className="mt-8">
            <Link
              href="/marketplace"
              className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Ir al marketplace
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const listingIds = cartRows.map((item) => item.listing_id)

  const [{ data: listings }, { data: images }] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, price, listing_type, shipping_mode, shipping_price, status')
      .in('id', listingIds),

    supabase
      .from('listing_images')
      .select('listing_id, storage_path, is_primary, sort_order')
      .in('listing_id', listingIds)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true }),
  ])

  const listingMap = new Map<number, ListingRow>(
    ((listings ?? []) as ListingRow[]).map((item) => [item.id, item])
  )

  const imageMap = new Map<number, string>()
  for (const image of (images ?? []) as ImageRow[]) {
    if (!imageMap.has(image.listing_id)) {
      imageMap.set(image.listing_id, image.storage_path)
    }
  }

  const items = cartRows
    .map((cart) => {
      const listing = listingMap.get(cart.listing_id)
      if (!listing) return null

      const price = listing.price ?? 0
      const shipping =
        listing.shipping_mode === 'fixed'
          ? (listing.shipping_price ?? 0)
          : 0

      return {
        cartItemId: cart.id,
        listingId: listing.id,
        title: listing.title,
        price,
        shipping,
        shippingText: shippingText(listing),
        imageUrl: buildPublicImageUrl(imageMap.get(listing.id) ?? null),
      }
    })
    .filter(Boolean) as {
      cartItemId: number
      listingId: number
      title: string
      price: number
      shipping: number
      shippingText: string
      imageUrl: string | null
    }[]

  const subtotal = items.reduce((acc, item) => acc + item.price, 0)
  const shippingTotal = items.reduce((acc, item) => acc + item.shipping, 0)
  const total = subtotal + shippingTotal

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
            Carrito
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Tu selección para compra
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Revisa tus piezas antes de pasar a la fase de orden y pago.
          </p>
        </div>

        <form action={clearCartAction}>
          <button
            type="submit"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Vaciar carrito
          </button>
        </form>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          {items.map((item) => (
            <article
              key={item.cartItemId}
              className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="grid gap-4 md:grid-cols-[130px_minmax(0,1fr)]">
                <Link
                  href={`/listings/${item.listingId}`}
                  className="block overflow-hidden rounded-[22px] bg-slate-100"
                >
                  <div className="relative aspect-square w-full md:w-[130px]">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        Sin imagen
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <Link href={`/listings/${item.listingId}`}>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                        {item.title}
                      </h2>
                    </Link>

                    <p className="mt-3 text-sm text-slate-600">
                      {item.shippingText}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Precio</p>
                      <p className="text-2xl font-semibold text-slate-950">
                        {formatGTQ(item.price)}
                      </p>
                    </div>

                    <form action={removeCartItemAction.bind(null, item.cartItemId)}>
                      <button
                        type="submit"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Quitar
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="space-y-5 xl:sticky xl:top-[104px]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
              Resumen
            </p>

            <div className="mt-5 grid gap-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatGTQ(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Envío fijo</span>
                <span>{formatGTQ(shippingTotal)}</span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between text-base font-semibold text-slate-950">
                  <span>Total</span>
                  <span>{formatGTQ(total)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white opacity-60"
            >
              Siguiente fase: crear orden y pagar
            </button>

            <p className="mt-3 text-xs leading-6 text-slate-500">
              En el siguiente sprint conectaremos este resumen con la creación de órdenes,
              la comisión de Valo y la pasarela de pago.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}