// Helper gọi API backend (đã proxy qua Vite đến localhost:4001)
// Mỗi trình duyệt có một workspace ẩn danh riêng để không dùng chung ví,
// tiến độ học hay ghi chú với người truy cập khác trên bản public.
const CLIENT_ID_KEY = 'tradelearn.workspace-id'

function workspaceId() {
  try {
    const existing = window.localStorage.getItem(CLIENT_ID_KEY)
    if (existing) return existing
    const generated = globalThis.crypto?.randomUUID?.() || `ws-${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(CLIENT_ID_KEY, generated)
    return generated
  } catch {
    return 'guest-session'
  }
}

async function request(path, options = {}) {
  const { headers: optionHeaders, ...requestOptions } = options
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-TradeLearn-Workspace': workspaceId(),
      ...optionHeaders,
    },
    ...requestOptions,
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) throw new Error(data?.error || `Lỗi HTTP ${res.status}`)
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),

  // Thị trường
  overview: () => request('/market/overview'),
  search: (q) => request(`/market/search?q=${encodeURIComponent(q)}`),
  quote: (symbol) => request(`/stocks/${encodeURIComponent(symbol)}/quote`),
  analysis: (symbol, range = '6mo') =>
    request(`/stocks/${encodeURIComponent(symbol)}/analysis?range=${range}`),
  priceHistory: (symbol, range = '6mo') =>
    request(`/stocks/${encodeURIComponent(symbol)}/history?range=${range}`),
  fundamentals: (symbol) => request(`/stocks/${encodeURIComponent(symbol)}/fundamentals`),
  popular: () => request('/market/lists/popular'),

  // Watchlist
  watchlist: () => request('/watchlist'),
  addWatch: (symbol, name) => request('/watchlist', { method: 'POST', body: JSON.stringify({ symbol, name }) }),
  removeWatch: (symbol) => request(`/watchlist/${encodeURIComponent(symbol)}`, { method: 'DELETE' }),

  // Giao dịch giả lập
  account: () => request('/trading/account'),
  order: (symbol, side, qty) => request('/trading/order', { method: 'POST', body: JSON.stringify({ symbol, side, qty }) }),
  tradingHistory: () => request('/trading/history'),
  resetAccount: () => request('/trading/reset', { method: 'POST' }),

  // Học tập
  lessons: () => request('/lessons'),
  lesson: (id) => request(`/lessons/${id}`),
  submitQuiz: (id, answers) => request(`/lessons/${id}/quiz`, { method: 'POST', body: JSON.stringify({ answers }) }),
  markRead: (id) => request(`/lessons/${id}/read`, { method: 'POST' }),
  progress: () => request('/lessons/progress'),

  // Track tai chinh doanh nghiep
  corporateFinanceProgress: () => request('/corporate-finance/progress'),
  setCorporateFinanceProgress: (moduleId, completed) =>
    request('/corporate-finance/progress', { method: 'POST', body: JSON.stringify({ moduleId, completed }) }),

  // Từ điển & tin tức
  glossary: (q, category) => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (category) p.set('category', category)
    return request(`/glossary?${p.toString()}`)
  },
  news: (market) => request(`/news?market=${market}`),

  // Phòng phân tích — task giả lập đi làm thật
  tasks: () => request('/tasks'),
  task: (id) => request(`/tasks/${id}`),
  submitTask: (id, answers) => request(`/tasks/${id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // Research workspace (Phase 6)
  researchList: () => request('/research'),
  researchGet: (symbol) => request(`/research/${encodeURIComponent(symbol)}`),
  researchSave: (symbol, fields) =>
    request(`/research/${encodeURIComponent(symbol)}`, { method: 'PUT', body: JSON.stringify(fields) }),
  researchDelete: (symbol) => request(`/research/${encodeURIComponent(symbol)}`, { method: 'DELETE' }),

  // Nhập tay BCTC VN (Phase 7)
  manualGet: (symbol) => request(`/manual/${encodeURIComponent(symbol)}`),
  manualPost: (symbol, body) =>
    request(`/manual/${encodeURIComponent(symbol)}`, { method: 'POST', body: JSON.stringify(body) }),
  manualDelete: (id) => request(`/manual/entry/${id}`, { method: 'DELETE' }),
}
