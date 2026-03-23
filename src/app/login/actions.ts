'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function buildError(path: string, value: string) {
  return `${path}?error=${encodeURIComponent(value)}`
}

function buildSuccess(path: string, value: string) {
  return `${path}?success=${encodeURIComponent(value)}`
}

function sanitizeNext(next: string | null) {
  if (!next) return '/vender/nuevo'
  return next.startsWith('/') ? next : '/vender/nuevo'
}

function friendlyAuthErrorMessage(message: string) {
  const msg = message.toLowerCase()

  if (msg.includes('email rate limit exceeded')) {
    return 'Supabase sí está respondiendo bien, pero bloqueó temporalmente más correos de confirmación porque intentaste registrarte varias veces seguidas.'
  }

  if (msg.includes('user already registered')) {
    return 'Ese correo ya está registrado. Prueba iniciar sesión o usa otro correo.'
  }

  if (msg.includes('invalid login credentials')) {
    return 'El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.'
  }

  if (msg.includes('signup is disabled')) {
    return 'El registro de nuevas cuentas está desactivado temporalmente.'
  }

  if (msg.includes('email not confirmed')) {
    return 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.'
  }

  if (msg.includes('password should be at least')) {
    return 'La contraseña no cumple con los requisitos mínimos de seguridad.'
  }

  return 'Ocurrió un problema al procesar tu solicitud. Inténtalo de nuevo.'
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = sanitizeNext(String(formData.get('next') ?? '/vender/nuevo'))

  if (!email || !password) {
    redirect(buildError('/login', 'Ingresa correo y contraseña.'))
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(buildError('/login', friendlyAuthErrorMessage(error.message)))
  }

  revalidatePath('/', 'layout')
  redirect(`${next}?success=${encodeURIComponent('Sesión iniciada correctamente.')}`)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const displayName = String(formData.get('displayName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  const next = sanitizeNext(String(formData.get('next') ?? '/vender/nuevo'))

  if (!displayName || !email || !password || !confirmPassword) {
    redirect(buildError('/login', 'Completa todos los campos para crear tu cuenta.'))
  }

  if (password.length < 8) {
    redirect(buildError('/login', 'La contraseña debe tener al menos 8 caracteres.'))
  }

  if (password !== confirmPassword) {
    redirect(buildError('/login', 'Las contraseñas no coinciden.'))
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/confirm?next=${encodeURIComponent(next)}`,
      data: {
        display_name: displayName,
      },
    },
  })

  if (error) {
    redirect(buildError('/login', friendlyAuthErrorMessage(error.message)))
  }

  revalidatePath('/', 'layout')

  if (data.session) {
    redirect(`${next}?success=${encodeURIComponent('Cuenta creada correctamente.')}`)
  }

  redirect(
    buildSuccess(
      '/login',
      'Te enviamos un correo de confirmación. Revísalo para activar tu cuenta.'
    )
  )
}