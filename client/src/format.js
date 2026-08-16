// Định dạng số liệu tài chính theo chuẩn Việt Nam
export function fmtPrice(value, currency = 'USD') {
  if (value == null || !Number.isFinite(value)) return '—'
  if (currency === 'VND') return value.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + '₫'
  return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function fmtMoney(value, currency = 'USD') {
  if (value == null || !Number.isFinite(value)) return '—'
  if (currency === 'VND') return Math.round(value).toLocaleString('vi-VN') + '₫'
  const abs = Math.abs(value)
  const opts = { maximumFractionDigits: abs >= 1000 ? 0 : 2 }
  return (value < 0 ? '-$' : '$') + abs.toLocaleString('en-US', opts)
}

export function fmtPct(value, digits = 2) {
  if (value == null || !Number.isFinite(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

export function fmtCompact(value) {
  if (value == null || !Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs >= 1e12) return (value / 1e12).toFixed(1).replace(/\.0$/, '') + ' nghìn tỷ'
  if (abs >= 1e9) return (value / 1e9).toFixed(1).replace(/\.0$/, '') + ' tỷ'
  if (abs >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, '') + ' tr'
  if (abs >= 1e3) return (value / 1e3).toFixed(1).replace(/\.0$/, '') + ' n'
  return String(Math.round(value))
}

export function timeAgo(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return 'vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  return `${Math.floor(diff / 86400)} ngày trước`
}

export function changeColor(value) {
  if (value == null || !Number.isFinite(value) || Math.abs(value) < 1e-9) return 'muted'
  return value > 0 ? 'up' : 'down'
}
