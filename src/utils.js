const SYMBOLS = { USD: '$', NGN: '₦', GBP: '£', EUR: '€' }

export function symbolFor(currency) {
  return SYMBOLS[currency] || currency + ' '
}

export function formatAmount(amount, currency) {
  const n = Number(amount) || 0
  const sym = symbolFor(currency)
  const parts = n.toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return { whole: `${sym}${parts[0]}`, cents: parts[1] }
}

export function formatMoney(amount, currency) {
  const { whole, cents } = formatAmount(amount, currency)
  return `${whole}.${cents}`
}

export function isSameMonth(dateStr, ref = new Date()) {
  const d = new Date(dateStr)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

export function monthLabel(ref = new Date()) {
  return ref.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function shortDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
