'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signOut } from '@/app/auth/actions'

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

export default function MobileMenu({
  isLoggedIn,
  displayName,
  email,
  cartCount = 0,
}: {
  isLoggedIn: boolean
  displayName?: string
  email?: string
  cartCount?: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <Link
          href="/carrito"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm"
          aria-label="Carrito"
        >
          <CartIcon />
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-950">
            {cartCount}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm"
          aria-label="Abrir menú"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-slate-900" />
            <span className="block h-0.5 w-5 rounded-full bg-slate-900" />
            <span className="block h-0.5 w-5 rounded-full bg-slate-900" />
          </div>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-slate-950/55 backdrop-blur-sm lg:hidden">
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
                  Valo
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  Marketplace
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                Cerrar
              </button>
            </div>

            <div className="border-b border-slate-200 px-6 py-5">
              <form action="/marketplace" method="get">
                <input
                  name="q"
                  type="text"
                  placeholder="Buscar piezas..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-amber-400"
                />
              </form>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {isLoggedIn && (
                <div className="mb-6 rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="mt-1 text-xs text-slate-500">{email}</p>
                </div>
              )}

              <nav className="grid gap-2">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Inicio
                </Link>
                <Link
                  href="/marketplace"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Marketplace
                </Link>
                <Link
                  href="/marketplace?type=auction&sort=ending"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Subastas
                </Link>
                <Link
                  href="/marketplace#categorias"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Categorías
                </Link>
                <Link
                  href="/vender/nuevo"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Vender
                </Link>
                <Link
                  href="/carrito"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Carrito ({cartCount})
                </Link>
              </nav>
            </div>

            <div className="border-t border-slate-200 px-6 py-5">
              {isLoggedIn ? (
                <div className="grid gap-3">
                  <Link
                    href="/cuenta"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-800"
                  >
                    Mi cuenta
                  </Link>

                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                    >
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              ) : (
                <div className="grid gap-3">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-800"
                  >
                    Iniciar sesión
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Crear cuenta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}