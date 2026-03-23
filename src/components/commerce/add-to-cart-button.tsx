'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { addToCartAction } from '@/app/commerce/actions'

export default function AddToCartButton({
  listingId,
  isAuthenticated = false,
  label,
  mode = 'cart',
  className,
}: {
  listingId: number
  isAuthenticated?: boolean
  label: string
  mode?: 'cart' | 'buy'
  className?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [justAdded, setJustAdded] = useState(false)

  function handleClick() {
    if (!isAuthenticated) {
      router.push('/login?message=Inicia sesión para continuar con tu compra.')
      return
    }

    startTransition(async () => {
      const result = await addToCartAction({ listingId })

      if (!result.ok) {
        if (result.reason === 'unauthenticated') {
          router.push('/login?message=Inicia sesión para continuar con tu compra.')
        }
        return
      }

      if (mode === 'buy') {
        router.push('/carrito')
        return
      }

      setJustAdded(true)
      router.refresh()

      window.setTimeout(() => {
        setJustAdded(false)
      }, 1500)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      {isPending ? 'Procesando...' : justAdded ? 'Agregado' : label}
    </button>
  )
}