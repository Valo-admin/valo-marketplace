'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createListing } from '@/app/vender/nuevo/actions'
import ImageUploader from './image-uploader'

type Category = {
  id: number
  name: string
}

function SubmitButton({ listingType }: { listingType: 'fixed_price' | 'auction' }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending
        ? 'Publicando...'
        : listingType === 'auction'
          ? 'Crear subasta'
          : 'Publicar pieza'}
    </button>
  )
}

export default function CreateListingForm({
  userId,
  categories,
}: {
  userId: string
  categories: Category[]
}) {
  const [listingType, setListingType] = useState<'fixed_price' | 'auction'>('fixed_price')
  const [isCertified, setIsCertified] = useState(false)
  const [allowOffers, setAllowOffers] = useState(false)
  const [shippingMode, setShippingMode] = useState<'fixed' | 'cash_on_delivery'>('cash_on_delivery')

  return (
    <form action={createListing} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <input type="hidden" name="listingType" value={listingType} />
      <input type="hidden" name="isCertified" value={isCertified ? 'true' : 'false'} />
      <input type="hidden" name="allowOffers" value={allowOffers ? 'true' : 'false'} />
      <input type="hidden" name="shippingMode" value={shippingMode} />

      <section className="space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
              Galería
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Sube primero las fotos de la pieza
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Empieza con anverso, reverso, slab, canto y detalles clave.
            </p>
          </div>

          <ImageUploader userId={userId} />
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
              Información principal
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Describe tu pieza con estructura premium
            </h2>
          </div>

          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Título del listing
              </label>
              <input
                name="title"
                required
                placeholder="1 Quetzal 1925 plata - excelente conservación"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Categoría
                </label>
                <select
                  name="categoryId"
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  País / emisor
                </label>
                <input
                  name="country"
                  defaultValue="Guatemala"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Descripción
              </label>
              <textarea
                name="description"
                required
                rows={5}
                placeholder="Incluye contexto, estado, defectos, detalles visuales y lo más importante de la pieza."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Denominación
                </label>
                <input
                  name="denomination"
                  placeholder="1 Quetzal"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Año
                </label>
                <input
                  name="year"
                  type="number"
                  placeholder="1925"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Metal
                </label>
                <input
                  name="metal"
                  placeholder="Plata"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Grado / conservación
                </label>
                <input
                  name="grade"
                  placeholder="XF Details / AU / MS63"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setIsCertified((prev) => !prev)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    isCertified
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isCertified ? 'Certificada: sí' : '¿La pieza está certificada?'}
                </button>
              </div>
            </div>

            {isCertified && (
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Certificadora
                  </label>
                  <input
                    name="certificationCompany"
                    placeholder="PCGS / NGC"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Número de certificación
                  </label>
                  <input
                    name="certificationNumber"
                    placeholder="12345678"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
              Modelo de venta
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Define cómo quieres vender
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setListingType('fixed_price')}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                listingType === 'fixed_price'
                  ? 'bg-slate-950 text-white'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              Venta directa
            </button>

            <button
              type="button"
              onClick={() => setListingType('auction')}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                listingType === 'auction'
                  ? 'bg-slate-950 text-white'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              Subasta
            </button>
          </div>

          {listingType === 'fixed_price' ? (
            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Precio en quetzales
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="2500.00"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setAllowOffers((prev) => !prev)}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  allowOffers
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {allowOffers ? 'Aceptar ofertas: sí' : '¿Aceptar ofertas?'}
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Precio inicial
                </label>
                <input
                  name="startPrice"
                  type="number"
                  step="0.01"
                  placeholder="1000.00"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reserva mínima
                </label>
                <input
                  name="reservePrice"
                  type="number"
                  step="0.01"
                  placeholder="1500.00"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Inicia
                </label>
                <input
                  name="startsAt"
                  type="datetime-local"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Finaliza
                </label>
                <input
                  name="endsAt"
                  type="datetime-local"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
              Envío
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Define cómo se entrega
            </h2>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => setShippingMode('cash_on_delivery')}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                shippingMode === 'cash_on_delivery'
                  ? 'bg-slate-950 text-white'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              Contra entrega en Guatemala
            </button>

            <button
              type="button"
              onClick={() => setShippingMode('fixed')}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                shippingMode === 'fixed'
                  ? 'bg-slate-950 text-white'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              Cobrar envío fijo
            </button>
          </div>

          {shippingMode === 'fixed' && (
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Costo de envío en quetzales
              </label>
              <input
                name="shippingPrice"
                type="number"
                step="0.01"
                placeholder="35.00"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
              />
            </div>
          )}
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm text-slate-500">
            Valo mostrará tu publicación en quetzales y usará la primera imagen como portada.
          </p>

          <div className="mt-6">
            <SubmitButton listingType={listingType} />
          </div>
        </div>
      </aside>
    </form>
  )
}