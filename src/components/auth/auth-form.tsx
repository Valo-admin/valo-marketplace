'use client'

import { useMemo, useState } from 'react'
import QueryFeedback from '@/components/ui/query-feedback'
import { login, signup } from '@/app/login/actions'

type Mode = 'signup' | 'login'

function getPasswordStrength(password: string) {
  let score = 0

  const checks = {
    length8: password.length >= 8,
    length12: password.length >= 12,
    lowerUpper: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  if (checks.length8) score++
  if (checks.lowerUpper) score++
  if (checks.number) score++
  if (checks.special) score++
  if (checks.length12) score++

  if (score <= 1) {
    return {
      score,
      label: 'Muy débil',
      barClass: 'bg-red-500',
      textClass: 'text-red-600',
      checks,
    }
  }

  if (score === 2) {
    return {
      score,
      label: 'Débil',
      barClass: 'bg-orange-500',
      textClass: 'text-orange-600',
      checks,
    }
  }

  if (score === 3) {
    return {
      score,
      label: 'Aceptable',
      barClass: 'bg-yellow-500',
      textClass: 'text-yellow-600',
      checks,
    }
  }

  if (score === 4) {
    return {
      score,
      label: 'Fuerte',
      barClass: 'bg-emerald-500',
      textClass: 'text-emerald-600',
      checks,
    }
  }

  return {
    score,
    label: 'Muy fuerte',
    barClass: 'bg-emerald-600',
    textClass: 'text-emerald-700',
    checks,
  }
}

function StrengthBar({ score, barClass }: { score: number; barClass: string }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className={`h-2 rounded-full ${
            item <= score ? barClass : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

function CheckItem({
  ok,
  text,
}: {
  ok: boolean
  text: string
}) {
  return (
    <div className={`text-xs ${ok ? 'text-emerald-600' : 'text-slate-500'}`}>
      {ok ? '✓' : '•'} {text}
    </div>
  )
}

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>('signup')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  const strength = useMemo(() => getPasswordStrength(password), [password])

  function validateSignup(e: React.FormEvent<HTMLFormElement>) {
    setLocalError('')

    if (password.length < 8) {
      e.preventDefault()
      setLocalError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      e.preventDefault()
      setLocalError('Las contraseñas no coinciden.')
      return
    }
  }

  return (
    <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
          Acceso
        </p>
        <h2 className="mt-3 text-3xl font-semibold">
          {mode === 'signup' ? 'Crea tu cuenta' : 'Inicia sesión'}
        </h2>
      </div>

      <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            setLocalError('')
          }}
          className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
            mode === 'signup'
              ? 'bg-amber-400 text-slate-950'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          Crear cuenta
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('login')
            setLocalError('')
          }}
          className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
            mode === 'login'
              ? 'bg-amber-400 text-slate-950'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          Iniciar sesión
        </button>
      </div>

      <QueryFeedback />

      {localError && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError}
        </div>
      )}

      {mode === 'signup' ? (
        <form onSubmit={validateSignup} action={signup} className="mt-6 space-y-5">
          <input type="hidden" name="next" value="/vender/nuevo" />

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Nombre visible
            </label>
            <input
              name="displayName"
              type="text"
              required
              placeholder="Tu nombre"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Correo electrónico
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Contraseña
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 pr-20 text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5"
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 pr-20 text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5"
              >
                {showConfirmPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>

            {confirmPassword.length > 0 && (
              <p
                className={`mt-2 text-xs ${
                  password === confirmPassword ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {password === confirmPassword
                  ? 'Las contraseñas coinciden.'
                  : 'Las contraseñas no coinciden.'}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-300">Seguridad de la contraseña</span>
              <span className={`text-sm font-medium ${strength.textClass}`}>
                {strength.label}
              </span>
            </div>

            <StrengthBar score={strength.score} barClass={strength.barClass} />

            <div className="mt-4 grid gap-2">
              <CheckItem ok={strength.checks.length8} text="Al menos 8 caracteres" />
              <CheckItem ok={strength.checks.length12} text="12 o más caracteres" />
              <CheckItem ok={strength.checks.lowerUpper} text="Mayúsculas y minúsculas" />
              <CheckItem ok={strength.checks.number} text="Incluye números" />
              <CheckItem ok={strength.checks.special} text="Incluye símbolos" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.01]"
          >
            Crear cuenta
          </button>
        </form>
      ) : (
        <form action={login} className="mt-6 space-y-5">
          <input type="hidden" name="next" value="/vender/nuevo" />

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Correo electrónico
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Contraseña
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 pr-20 text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5"
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Iniciar sesión
          </button>
        </form>
      )}
    </div>
  )
}