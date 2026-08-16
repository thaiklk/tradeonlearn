// Bộ nhớ đệm đơn giản theo TTL để giảm số lượng gọi API ngoài
const store = new Map()

export function cacheGet(key) {
  const hit = store.get(key)
  if (!hit) return null
  if (Date.now() > hit.expireAt) {
    store.delete(key)
    return null
  }
  return hit.value
}

export function cacheSet(key, value, ttlMs) {
  store.set(key, { value, expireAt: Date.now() + ttlMs })
}

export async function cached(key, ttlMs, producer) {
  const hit = cacheGet(key)
  if (hit) return hit
  const value = await producer()
  cacheSet(key, value, ttlMs)
  return value
}

export async function withTimeout(promiseOrFn, ms, label = 'request') {
  const p = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn
  return Promise.race([
    p,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Hết thời gian chờ ${label} (${ms}ms)`)), ms)),
  ])
}
