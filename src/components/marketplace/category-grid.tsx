import Link from 'next/link'

type CategoryItem = {
  id: number
  name: string
  slug: string
}

const categoryDescriptions: Record<string, string> = {
  monedas: 'Monedas antiguas, modernas, conmemorativas y piezas premium.',
  billetes: 'Billetes clásicos, rarezas, series especiales y alta conservación.',
  medallas: 'Medallas históricas, artísticas y piezas de colección especial.',
  'tokens-exonumia': 'Tokens, fichas, exonumia y objetos numismáticos singulares.',
  lotes: 'Conjuntos curados para coleccionistas, dealers e inversionistas.',
  bibliografia: 'Catálogos, libros y material de referencia especializado.',
}

export default function CategoryGrid({
  categories,
}: {
  categories: CategoryItem[]
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/marketplace?category=${category.slug}`}
          className="group rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-base font-bold text-white">
            {category.name.charAt(0).toUpperCase()}
          </div>

          <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
            {category.name}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {categoryDescriptions[category.slug] ||
              'Coleccionables numismáticos seleccionados con una experiencia premium.'}
          </p>

          <div className="mt-5 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
            Ver categoría
          </div>
        </Link>
      ))}
    </div>
  )
}