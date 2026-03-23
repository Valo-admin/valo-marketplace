'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type UploadedImage = {
  path: string
  publicUrl?: string
  name?: string
}

function encodeError(message: string) {
  return `/vender/nuevo?error=${encodeURIComponent(message)}`
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function parseNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const parsed = Number(raw.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

function parseImages(value: FormDataEntryValue | null): UploadedImage[] {
  try {
    const parsed = JSON.parse(String(value ?? '[]'))
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.path === 'string' &&
        item.path.length > 0
    )
  } catch {
    return []
  }
}

export async function createListing(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Inicia sesión para publicar una pieza.')
  }

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const listingType = String(formData.get('listingType') ?? 'fixed_price')
  const categoryId = parseNumber(formData.get('categoryId'))
  const price = parseNumber(formData.get('price'))
  const startPrice = parseNumber(formData.get('startPrice'))
  const reservePrice = parseNumber(formData.get('reservePrice'))
  const denomination = String(formData.get('denomination') ?? '').trim()
  const country = String(formData.get('country') ?? 'Guatemala').trim()
  const year = parseNumber(formData.get('year'))
  const metal = String(formData.get('metal') ?? '').trim()
  const grade = String(formData.get('grade') ?? '').trim()
  const isCertified = String(formData.get('isCertified') ?? 'false') === 'true'
  const certificationCompany = String(formData.get('certificationCompany') ?? '').trim()
  const certificationNumber = String(formData.get('certificationNumber') ?? '').trim()
  const startsAt = String(formData.get('startsAt') ?? '').trim()
  const endsAt = String(formData.get('endsAt') ?? '').trim()
  const allowOffers = String(formData.get('allowOffers') ?? 'false') === 'true'
  const shippingMode = String(formData.get('shippingMode') ?? 'cash_on_delivery')
  const shippingPrice = parseNumber(formData.get('shippingPrice'))
  const uploadedImages = parseImages(formData.get('uploadedImages'))

  if (!title || !description || !categoryId) {
    redirect(encodeError('Completa título, categoría y descripción.'))
  }

  if (uploadedImages.length === 0) {
    redirect(encodeError('Sube al menos una imagen antes de publicar.'))
  }

  if (listingType === 'fixed_price' && !price) {
    redirect(encodeError('Ingresa el precio en quetzales para venta directa.'))
  }

  if (listingType === 'auction' && (!startPrice || !startsAt || !endsAt)) {
    redirect(encodeError('Completa precio inicial, fecha de inicio y fin de la subasta.'))
  }

  if (shippingMode !== 'fixed' && shippingMode !== 'cash_on_delivery') {
    redirect(encodeError('Selecciona un modo de envío válido.'))
  }

  if (shippingMode === 'fixed' && (!shippingPrice || shippingPrice < 0)) {
    redirect(encodeError('Ingresa el costo de envío en quetzales.'))
  }

  const slugBase = slugify(title) || 'listing'

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      seller_id: user.id,
      category_id: categoryId,
      title,
      slug: `${slugBase}-${Date.now()}`,
      description,
      listing_type: listingType === 'auction' ? 'auction' : 'fixed_price',
      status: 'published',
      price: listingType === 'fixed_price' ? price : null,
      currency: 'GTQ',
      allow_offers: listingType === 'fixed_price' ? allowOffers : false,
      shipping_mode: shippingMode,
      shipping_price: shippingMode === 'fixed' ? shippingPrice : null,
      country,
      denomination: denomination || null,
      year_start: year,
      year_end: year,
      metal: metal || null,
      grade: grade || null,
      is_certified: isCertified,
      certification_company: isCertified ? certificationCompany || null : null,
      certification_number: isCertified ? certificationNumber || null : null,
    })
    .select('id')
    .single()

  if (listingError || !listing) {
    redirect(encodeError(listingError?.message ?? 'No pudimos crear el listing.'))
  }

  const imageRows = uploadedImages.map((image, index) => ({
    listing_id: listing.id,
    storage_path: image.path,
    alt_text: `${title} - imagen ${index + 1}`,
    sort_order: index,
    is_primary: index === 0,
  }))

  const { error: imageError } = await supabase.from('listing_images').insert(imageRows)

  if (imageError) {
    redirect(encodeError(imageError.message))
  }

  if (listingType === 'auction' && startPrice && startsAt && endsAt) {
    const { error: auctionError } = await supabase.from('auctions').insert({
      listing_id: listing.id,
      start_price: startPrice,
      current_price: startPrice,
      reserve_price: reservePrice,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
    })

    if (auctionError) {
      redirect(encodeError(auctionError.message))
    }
  }

  revalidatePath('/', 'layout')
  redirect(`/listings/${listing.id}?success=${encodeURIComponent('Tu pieza ya fue publicada.')}`)
}