'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { signOut } from '@/app/auth/actions'

export default function UserNav({
  displayName,
  email,
}: {
  displayName: string
  email: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials =
    displayName
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur transition hover:bg-white"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
          {initials}
        </div>

        <div className="hidden text-left xl:block">
          <p className="max-w-[160px] truncate text-sm font-semibold text-slate-900">
            {displayName}
          </p>
          <p className="max-w-[160px] truncate text-xs text-slate-500">
            {email}
          </p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-80 rounded-[28px] border border-slate-200 bg-white p-3 shadow-2xl">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="mt-1 text-xs text-slate-500">{email}</p>
          </div>

          <div className="mt-3 grid gap-2">
            <Link
              href="/cuenta"
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Mi cuenta
            </Link>

            <Link
              href="/vender/nuevo"
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Publicar una pieza
            </Link>

            <Link
              href="/"
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Ir al marketplace
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}