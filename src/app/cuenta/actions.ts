'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function buildError(message: string) {
  return `/cuenta?error=${encodeURIComponent(message)}`
}

function buildSuccess(message: string) {
  return `/cuenta?success=${encodeURIComponent(message)}`
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Inicia sesión para editar tu cuenta.')
  }

  const displayName = String(formData.get('displayName') ?? '').trim()
  const legalName = String(formData.get('legalName') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const addressLine1 = String(formData.get('addressLine1') ?? '').trim()
  const addressLine2 = String(formData.get('addressLine2') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()
  const stateRegion = String(formData.get('stateRegion') ?? '').trim()
  const postalCode = String(formData.get('postalCode') ?? '').trim()
  const country = String(formData.get('country') ?? 'Guatemala').trim()

  if (!displayName) {
    redirect(buildError('Ingresa al menos un nombre visible para tu cuenta.'))
  }

  const hasBasicInfo =
    legalName !== '' &&
    phone !== '' &&
    addressLine1 !== '' &&
    city !== '' &&
    country !== ''

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      legal_name: legalName || null,
      phone: phone || null,
      address_line_1: addressLine1 || null,
      address_line_2: addressLine2 || null,
      city: city || null,
      state_region: stateRegion || null,
      postal_code: postalCode || null,
      country: country || null,
      kyc_status: hasBasicInfo ? 'basic_info_completed' : 'incomplete',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    redirect(buildError(error.message))
  }

  redirect(buildSuccess('Tu cuenta fue actualizada correctamente.'))
}