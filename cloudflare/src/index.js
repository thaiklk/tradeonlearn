const WORKSPACE_RE = /^[a-zA-Z0-9_-]{8,100}$/
const MAX_SNAPSHOT_BYTES = 1_500_000

function headers(origin, allowedOrigin) {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  })
  if (origin && origin === allowedOrigin) {
    responseHeaders.set('Access-Control-Allow-Origin', origin)
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type')
  }
  return responseHeaders
}

function json(value, status, origin, allowedOrigin) {
  return new Response(JSON.stringify(value), { status, headers: headers(origin, allowedOrigin) })
}

function workspaceId(pathname) {
  const prefix = '/v1/workspaces/'
  if (!pathname.startsWith(prefix)) return null
  const id = decodeURIComponent(pathname.slice(prefix.length))
  return WORKSPACE_RE.test(id) ? id : null
}

function authorized(request, env) {
  const supplied = request.headers.get('X-TradeLearn-State-Token') || ''
  return Boolean(env.STATE_SYNC_TOKEN) && supplied === env.STATE_SYNC_TOKEN
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const allowedOrigin = env.ALLOWED_ORIGIN || ''
    const id = workspaceId(url.pathname)

    if (origin && origin !== allowedOrigin) return json({ error: 'Origin không được phép' }, 403, origin, allowedOrigin)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(origin, allowedOrigin) })
    if (!id) return json({ error: 'Không tìm thấy workspace' }, 404, origin, allowedOrigin)
    if (!['GET', 'PUT'].includes(request.method)) return json({ error: 'Method không được hỗ trợ' }, 405, origin, allowedOrigin)
    if (!authorized(request, env)) return json({ error: 'Không được phép' }, 401, origin, allowedOrigin)

    try {
      if (request.method === 'GET') {
        const row = await env.DB.prepare('SELECT payload, version, updated_at FROM workspace_snapshots WHERE user_id = ?').bind(id).first()
        if (!row) return json({ payload: null }, 404, origin, allowedOrigin)
        return json({ payload: row.payload, version: row.version, updatedAt: row.updated_at }, 200, origin, allowedOrigin)
      }

      const body = await request.json()
      const payload = typeof body?.payload === 'string' ? body.payload : ''
      const baseVersion = Number(body?.baseVersion)
      const writeId = typeof body?.writeId === 'string' ? body.writeId : ''
      if (!payload) return json({ error: 'Snapshot không hợp lệ' }, 400, origin, allowedOrigin)
      if (!Number.isInteger(baseVersion) || baseVersion < 0 || !/^[a-z0-9-]{16,64}$/i.test(writeId)) return json({ error: 'Metadata không hợp lệ' }, 400, origin, allowedOrigin)
      if (new TextEncoder().encode(payload).byteLength > MAX_SNAPSHOT_BYTES) {
        return json({ error: 'Workspace vượt giới hạn 1,5 MB' }, 413, origin, allowedOrigin)
      }

      const existing = await env.DB.prepare('SELECT version, last_write_id FROM workspace_snapshots WHERE user_id = ?').bind(id).first()
      if (!existing) {
        if (baseVersion !== 0) return json({ error: 'Xung đột phiên bản', version: 0 }, 409, origin, allowedOrigin)
        await env.DB.prepare('INSERT INTO workspace_snapshots (user_id, payload, version, last_write_id, updated_at) VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)').bind(id, payload, writeId).run()
        return json({ ok: true, version: 1 }, 200, origin, allowedOrigin)
      }
      if (existing.last_write_id === writeId) return json({ ok: true, version: existing.version }, 200, origin, allowedOrigin)
      if (Number(existing.version) !== baseVersion) return json({ error: 'Xung đột phiên bản', version: existing.version }, 409, origin, allowedOrigin)

      const update = await env.DB.prepare(
        `UPDATE workspace_snapshots
         SET payload = ?, version = version + 1, last_write_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND version = ?`
      ).bind(payload, writeId, id, baseVersion).run()
      if (!update.meta.changes) return json({ error: 'Xung đột phiên bản', version: baseVersion }, 409, origin, allowedOrigin)
      return json({ ok: true, version: baseVersion + 1 }, 200, origin, allowedOrigin)
    } catch (error) {
      console.error('state-worker error', error)
      return json({ error: 'Lỗi lưu trữ Cloudflare' }, 500, origin, allowedOrigin)
    }
  },
}
