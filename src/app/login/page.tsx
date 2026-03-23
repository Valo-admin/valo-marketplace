import AuthForm from '@/components/auth/auth-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        <section className="flex items-center px-6 py-16 lg:px-12">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-amber-300">
              Valo Marketplace
            </div>

            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              El mercado premium para la nueva era numismática.
            </h1>

            <p className="mt-6 text-lg text-slate-300">
              Publica monedas, billetes y medallas con una experiencia moderna,
              visual y confiable desde el primer día.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm text-slate-300">Subastas elegantes</p>
                <p className="mt-2 text-xl font-medium">Pujas en tiempo real</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm text-slate-300">Catálogo premium</p>
                <p className="mt-2 text-xl font-medium">Atributos numismáticos reales</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center px-6 py-16 lg:px-12">
          <AuthForm />
        </section>
      </div>
    </main>
  )
}