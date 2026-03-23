import Link from 'next/link'
import MobileMenu from './mobile-menu'
import UserNav from './user-nav'
import { createClient } from '@/lib/supabase/server'

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7" />
    </svg>
  )
}

export default async function SiteHeader() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let displayName = 'Usuario'
  let email = ''
  let cartCount = 0

  if (user) {
    email = user.email ?? ''

    const [{ data: profile }, { count }] = await Promise.all([
      supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle(),

      supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ])

    displayName =
      profile?.display_name?.trim() ||
      user.email?.split('@')[0] ||
      'Usuario'

    cartCount = count ?? 0
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4 lg:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold tracking-[0.2em] text-white transition group-hover:scale-[1.02]">
            V
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-600">
              Valo
            </p>
            <p className="text-lg font-semibold tracking-tight text-slate-950">
              Marketplace
            </p>
          </div>
        </Link>

        <form
          action="/marketplace"
          method="get"
          className="mx-2 hidden flex-1 lg:block"
        >
          <div className="relative">
            <input
              name="q"
              type="text"
              placeholder="Buscar monedas, billetes, medallas, certificaciones, países, años..."
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 pr-36 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400"
            />

            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Buscar
            </button>
          </div>
        </form>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <Link
            href="/carrito"
            className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-50"
            aria-label="Carrito"
          >
            <CartIcon />
            <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-slate-950">
              {cartCount}
            </span>
          </Link>

          <Link
            href="/vender/nuevo"
            className="inline-flex items-center rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Publicar una pieza
          </Link>

          {user ? (
            <UserNav displayName={displayName} email={email} />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/login"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>

        <div className="ml-auto lg:hidden">
          <MobileMenu
            isLoggedIn={!!user}
            displayName={displayName}
            email={email}
            cartCount={cartCount}
          />
        </div>
      </div>
    </header>
  )
}