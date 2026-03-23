export function formatGTQ(value: number | string | null | undefined) {
  const amount =
    typeof value === 'string'
      ? Number(value)
      : typeof value === 'number'
        ? value
        : 0

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0)
}