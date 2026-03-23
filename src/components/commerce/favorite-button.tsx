'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toggleFavoriteAction } from '@/app/commerce/actions'

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-6.7-4.35-9.2-8.08C.8 9.92 2.1 5.5 6 4.6c2.1-.48 4.12.27 6 2.34 1.88-2.07 3.9-2.82 6-2.34 3.9.9 5.2 5.32 3.2 8.32C18.7 16.65 12 21 12 21z" />
    </svg>
  )
}

export default function FavoriteButton({
  listingId,
  initialIsFavorite = false,
  isAuthenticated = false,
  variant = 'icon',
}: {
  listingId: number
  initialIsFavorite?: boolean
  isAuthenticated?: boolean
  variant?: 'icon' | 'button'
}) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isAuthenticated) {
      router.push('/login?message=Inicia sesión para guardar favoritos.')
      return
    }

    const next = !isFavorite
    setIsFavorite(next)

    startTransition(async () => {
      const result = await toggleFavoriteAction({ listingId })

      if (!result.ok) {
        setIsFavorite(!next)

        if (result.reason === 'unauthenticated') {
          router.push('/login?message=Inicia sesión para guardar favoritos.')
        }

        return
      }

      setIsFavorite(Boolean(result.favorited))
      router.refresh()
    })
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
          isFavorite
            ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
            : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
        } ${isPending ? 'opacity-70' : ''}`}
      >
        <HeartIcon filled={isFavorite} />
        {isFavorite ? 'Guardado' : 'Favorito'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition ${
        isFavorite
          ? 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50'
          : 'border-slate-200 bg-white/95 text-slate-700 hover:bg-white'
      } ${isPending ? 'opacity-70' : ''}`}
    >
      <HeartIcon filled={isFavorite} />
    </button>
  )
}