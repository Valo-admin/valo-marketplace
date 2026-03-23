'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult =
  | { ok: true; favorited?: boolean; added?: boolean }
  | {
      ok: false
      reason: 'unauthenticated' | 'not_found' | 'invalid_listing' | 'error'
      message?: string
    }

export async function toggleFavoriteAction(input: {
  listingId: number
}): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, reason: 'unauthenticated' }
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', input.listingId)
    .eq('status', 'published')
    .maybeSingle()

  if (!listing) {
    return { ok: false, reason: 'not_found' }
  }

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', input.listingId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id)
      .eq('user_id', user.id)

    if (error) {
      return { ok: false, reason: 'error', message: error.message }
    }

    revalidatePath('/marketplace')
    revalidatePath(`/listings/${input.listingId}`)
    return { ok: true, favorited: false }
  }

  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    listing_id: input.listingId,
  })

  if (error) {
    return { ok: false, reason: 'error', message: error.message }
  }

  revalidatePath('/marketplace')
  revalidatePath(`/listings/${input.listingId}`)
  return { ok: true, favorited: true }
}

export async function addToCartAction(input: {
  listingId: number
}): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, reason: 'unauthenticated' }
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('id, listing_type, status')
    .eq('id', input.listingId)
    .maybeSingle()

  if (!listing) {
    return { ok: false, reason: 'not_found' }
  }

  if (listing.status !== 'published' || listing.listing_type !== 'fixed_price') {
    return { ok: false, reason: 'invalid_listing' }
  }

  const { error } = await supabase.from('cart_items').upsert(
    {
      user_id: user.id,
      listing_id: input.listingId,
      quantity: 1,
    },
    {
      onConflict: 'user_id,listing_id',
      ignoreDuplicates: false,
    }
  )

  if (error) {
    return { ok: false, reason: 'error', message: error.message }
  }

  revalidatePath('/marketplace')
  revalidatePath(`/listings/${input.listingId}`)
  revalidatePath('/carrito')
  return { ok: true, added: true }
}

export async function removeCartItemAction(cartItemId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', user.id)

  revalidatePath('/carrito')
  revalidatePath('/marketplace')
}

export async function clearCartAction() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase.from('cart_items').delete().eq('user_id', user.id)

  revalidatePath('/carrito')
  revalidatePath('/marketplace')
}   