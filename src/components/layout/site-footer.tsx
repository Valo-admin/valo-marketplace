import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold tracking-[0.2em] text-white">
                V
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-600">
                  Valo
                </p>
                <p className="text-lg font-semibold tracking-tight text-slate-950">
                  Marketplace
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-600">
              El marketplace premium para monedas, billetes, medallas y coleccionables
              numismáticos. Diseñado para descubrir, vender y comprar con una experiencia elegante y moderna.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
              Marketplace
            </h3>
            <div className="mt-4 grid gap-3">
              <Link href="/" className="text-sm text-slate-600 transition hover:text-slate-950">
                Inicio
              </Link>
              <Link href="/#explorar" className="text-sm text-slate-600 transition hover:text-slate-950">
                Explorar
              </Link>
              <Link href="/#subastas" className="text-sm text-slate-600 transition hover:text-slate-950">
                Subastas
              </Link>
              <Link href="/#categorias" className="text-sm text-slate-600 transition hover:text-slate-950">
                Categorías
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
              Cuenta
            </h3>
            <div className="mt-4 grid gap-3">
              <Link href="/login" className="text-sm text-slate-600 transition hover:text-slate-950">
                Iniciar sesión
              </Link>
              <Link href="/cuenta" className="text-sm text-slate-600 transition hover:text-slate-950">
                Mi cuenta
              </Link>
              <Link href="/vender/nuevo" className="text-sm text-slate-600 transition hover:text-slate-950">
                Vender una pieza
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
              Confianza
            </h3>
            <div className="mt-4 grid gap-3">
              <span className="text-sm text-slate-600">Piezas certificadas</span>
              <span className="text-sm text-slate-600">Vendedores verificados</span>
              <span className="text-sm text-slate-600">Experiencia premium</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 Valo Marketplace. Todos los derechos reservados.</p>
          <p>Marketplace premium para la nueva era numismática.</p>
        </div>
      </div>
    </footer>
  )
}