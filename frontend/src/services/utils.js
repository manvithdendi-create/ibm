import { format, parseISO, differenceInDays, addDays } from 'date-fns'

export const formatCurrency = (amount, currency = 'USD') => {
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥',
    CHF: 'CHF ', CAD: 'C$', AUD: 'A$', CNY: '¥',
    INR: '₹', BRL: 'R$', MXN: '$', IDR: 'Rp',
    THB: '฿', VND: '₫', KRW: '₩', SGD: 'S$',
    HKD: 'HK$', NZD: 'NZ$', ZAR: 'R', PEN: 'S/',
    AED: 'د.إ'
  }
  const symbol = symbols[currency] || currency + ' '
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatDate = (dateStr, pattern = 'MMM d, yyyy') => {
  try {
    return format(parseISO(dateStr), pattern)
  } catch {
    return dateStr
  }
}

export const formatDateShort = (dateStr) => formatDate(dateStr, 'MMM d')

export const getTripDuration = (startDate, endDate) => {
  try {
    return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1
  } catch {
    return 0
  }
}

export const generateDateRange = (startDate, endDate) => {
  const dates = []
  let current = parseISO(startDate)
  const end = parseISO(endDate)
  while (current <= end) {
    dates.push(format(current, 'yyyy-MM-dd'))
    current = addDays(current, 1)
  }
  return dates
}

export const getInterestIcon = (interest) => {
  const icons = {
    Adventure: '🏔️',
    Food: '🍽️',
    Nature: '🌲',
    History: '🏛️',
    Shopping: '🛍️',
    Beaches: '🏖️',
    Relaxation: '🧘',
  }
  return icons[interest] || '✨'
}

export const getCategoryColor = (category) => {
  const colors = {
    transportation: 'bg-blue-100 text-blue-800',
    accommodation: 'bg-purple-100 text-purple-800',
    food: 'bg-orange-100 text-orange-800',
    activities: 'bg-green-100 text-green-800',
    local_transport: 'bg-pink-100 text-pink-800',
    miscellaneous: 'bg-gray-100 text-gray-800',
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}

export const getCategoryLabel = (category) => {
  const labels = {
    transportation: 'Transportation',
    accommodation: 'Accommodation',
    food: 'Food & Dining',
    activities: 'Activities',
    local_transport: 'Local Transport',
    miscellaneous: 'Miscellaneous',
  }
  return labels[category] || category
}

export const truncate = (str, length = 100) => {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length).trim() + '...'
}

export const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const generateId = () => Math.random().toString(36).substr(2, 9)

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export const printDocument = () => {
  window.print()
}

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}