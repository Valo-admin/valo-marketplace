'use client'

import { useSearchParams } from 'next/navigation'

export default function QueryFeedback() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const success = searchParams.get('success')
  const message = searchParams.get('message')

  const text = error ?? success ?? message
  if (!text) return null

  const classes = error
    ? 'border-red-200 bg-red-50 text-red-700'
    : success
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-slate-200 bg-slate-50 text-slate-700'

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>
      {text}
    </div>
  )
}