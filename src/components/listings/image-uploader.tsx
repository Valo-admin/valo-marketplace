'use client'

import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type UploadedImage = {
  path: string
  publicUrl: string
  name: string
}

export default function ImageUploader({ userId }: { userId: string }) {
  const supabase = createClient()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return

    setUploading(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-')
        const path = `${userId}/drafts/${crypto.randomUUID()}-${safeName}`

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('listing-images')
          .getPublicUrl(path)

        setImages((prev) => [
          ...prev,
          {
            path,
            publicUrl: data.publicUrl,
            name: file.name,
          },
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos subir las imágenes.')
    } finally {
      setUploading(false)
    }
  }

  async function removeImage(path: string) {
    await supabase.storage.from('listing-images').remove([path])
    setImages((prev) => prev.filter((img) => img.path !== path))
  }

  return (
    <div className="space-y-4">
      <input
        type="hidden"
        name="uploadedImages"
        value={JSON.stringify(images)}
      />

      <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-amber-400 hover:bg-amber-50/40">
        <div className="max-w-sm">
          <p className="text-base font-medium text-slate-800">
            Arrastra imágenes o haz clic para subir
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Usa fotos nítidas de anverso, reverso, canto, slab y detalles.
          </p>
        </div>

        <span className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          {uploading ? 'Subiendo...' : 'Seleccionar imágenes'}
        </span>

        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleUpload(e.target.files)
            e.currentTarget.value = ''
          }}
        />
      </label>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.path}
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <Image
                  src={image.publicUrl}
                  alt={image.name}
                  fill
                  className="object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-medium text-white">
                    Portada
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 p-4">
                <p className="line-clamp-1 text-sm text-slate-600">{image.name}</p>
                <button
                  type="button"
                  onClick={() => void removeImage(image.path)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}