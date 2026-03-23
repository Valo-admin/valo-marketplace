import { updateProfile } from '@/app/cuenta/actions'

type Profile = {
  display_name: string | null
  legal_name: string | null
  phone: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  state_region: string | null
  postal_code: string | null
  country: string | null
  kyc_status: string | null
}

export default function EditProfileForm({
  email,
  profile,
}: {
  email: string
  profile: Profile | null
}) {
  return (
    <form action={updateProfile} className="grid gap-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
            Cuenta
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Información del vendedor
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Este bloque nos sirve como perfil base y preparación para KYC.
          </p>
        </div>

        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Correo
            </label>
            <input
              value={email}
              disabled
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nombre visible
              </label>
              <input
                name="displayName"
                required
                defaultValue={profile?.display_name ?? ''}
                placeholder="Cómo te verán en la plataforma"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nombre legal completo
              </label>
              <input
                name="legalName"
                defaultValue={profile?.legal_name ?? ''}
                placeholder="Nombre tal como aparece en tus documentos"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Teléfono
              </label>
              <input
                name="phone"
                defaultValue={profile?.phone ?? ''}
                placeholder="+502 ..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                País
              </label>
              <input
                name="country"
                defaultValue={profile?.country ?? 'Guatemala'}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Dirección línea 1
            </label>
            <input
              name="addressLine1"
              defaultValue={profile?.address_line_1 ?? ''}
              placeholder="Zona, avenida, número, colonia..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Dirección línea 2
            </label>
            <input
              name="addressLine2"
              defaultValue={profile?.address_line_2 ?? ''}
              placeholder="Complemento opcional"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ciudad
              </label>
              <input
                name="city"
                defaultValue={profile?.city ?? ''}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Departamento / región
              </label>
              <input
                name="stateRegion"
                defaultValue={profile?.state_region ?? ''}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Código postal
              </label>
              <input
                name="postalCode"
                defaultValue={profile?.postal_code ?? ''}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <button
          type="submit"
          className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Guardar cuenta
        </button>
      </div>
    </form>
  )
}