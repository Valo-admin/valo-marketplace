import Link from 'next/link'
import CategoryGrid from '@/components/marketplace/category-grid'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [
    { count: allListingsCount },
    { count: activeAuctionCount },
    { count: activeFixedCount },
    { data: categories },
  ] = await Promise.all([
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

    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  return (
    <main className="bg-[linear-gradient(180deg,#fcfbf7_0%,#fffdf8_100%)]">
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-10 lg:px-10 lg:pb-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
              Marketplace premium de numismática
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-[3rem] lg:leading-[1.04]">
              Descubre piezas extraordinarias en un marketplace hecho para coleccionistas serios.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Explora libremente monedas, billetes, medallas y coleccionables.
              Regístrate solo cuando quieras comprar, vender o interactuar con el mercado.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/marketplace"
                className="inline-flex items-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Entrar al marketplace
              </Link>

              <Link
                href="/vender/nuevo"
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Vender una pieza
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Listings activos
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                {allListingsCount ?? 0}
              </p>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Subastas activas
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                {activeAuctionCount ?? 0}
              </p>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Ventas directas
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                {activeFixedCount ?? 0}
              </p>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-slate-950 p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                Experiencia Valo
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Mercado público, subastas activas, compra directa y experiencia premium para numismática real.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="categorias" className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
            Categorías
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Explora por tipo de colección
          </h2>
        </div>

        <CategoryGrid categories={categories ?? []} />
      </section>
    </main>
  )
}