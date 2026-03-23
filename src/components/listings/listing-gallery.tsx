'use client'

import Image from 'next/image'
import { useState } from 'react'

type GalleryImage = {
  url: string
  alt: string
}

export default function ListingGallery({
  images,
  title,
}: {
  images: GalleryImage[]
  title: string
}) {
  const safeImages =
    images.length > 0
      ? images
      : [
          {
            url: '',
            alt: title,
          },
        ]

  const [selected, setSelected] = useState(0)
  const active = safeImages[selected]

  function goTo(index: number) {
    if (index < 0 || index >= safeImages.length) return
    setSelected(index)
  }

  return (
    <div className="grid gap-4 md:grid-cols-[84px_minmax(0,1fr)]">
      <div className="order-2 flex gap-3 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible">
        {safeImages.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            onClick={() => goTo(index)}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-slate-100 transition ${
              index === selected
                ? 'border-slate-950 shadow-sm'
                : 'border-slate-200 hover:border-slate-400'
            }`}
            aria-label={`Ver imagen ${index + 1}`}
          >
            {image.url ? (
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                Sin foto
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="order-1 md:order-2">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-square w-full">
            {active?.url ? (
              <Image
                src={active.url}
                alt={active.alt}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,#f8e7bf,transparent_35%),linear-gradient(135deg,#f8fafc,#e2e8f0)] text-slate-500">
                Sin imagen
              </div>
            )}
          </div>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(selected - 1)}
                disabled={selected === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm disabled:opacity-40"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() => goTo(selected + 1)}
                disabled={selected === safeImages.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm disabled:opacity-40"
              >
                ›
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/90 px-3 py-1 text-xs font-semibold text-white">
            {selected + 1}/{safeImages.length}
          </div>
        </div>
      </div>
    </div>
  )
}