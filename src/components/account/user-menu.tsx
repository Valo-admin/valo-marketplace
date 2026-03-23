'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function UserMenu({
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
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:bg-slate-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
          {initials}
        </div>

        <div className="text-left">
          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500">{email}</p>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+10px)] z-20 w-72 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="mt-1 text-xs text-slate-500">{email}</p>
          </div>

          <div className="mt-3 grid gap-2">
            <Link
              href="/cuenta"
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Editar cuenta
            </Link>

            <Link
              href="/vender/nuevo"
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Publicar una pieza
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}