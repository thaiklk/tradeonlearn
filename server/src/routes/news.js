// Tin tức qua Google News RSS (không cần key) — Mỹ & Việt Nam
import { Router } from 'express'
import { XMLParser } from 'fast-xml-parser'
import { cached } from '../services/cache.js'

const router = Router()
const parser = new XMLParser({ ignoreAttributes: false })

const FEEDS = {
  us: {
    url: 'https://news.google.com/rss/search?q=stock+market+OR+investing+when:2d&hl=en-US&gl=US&ceid=US:en',
    label: 'Thị trường Mỹ',
  },
  vn: {
    url: 'https://news.google.com/rss/search?q=ch%E1%BB%A9ng+kho%C3%A1n+OR+nh%C3%A0+%C4%91%E1%BA%A7u+t%C6%B0+when:2d&hl=vi&gl=VN&ceid=VN:vi',
    label: 'Thị trường Việt Nam',
  },
}

function parseFeed(xml) {
  const doc = parser.parse(xml)
  const items = doc?.rss?.channel?.item || []
  return (Array.isArray(items) ? items : [items])
    .slice(0, 20)
    .map((it) => ({
      title: String(it.title || '').replace(/ - [^-]+$/, ''), // bỏ tên nguồn ở cuối tiêu đề
      link: it.link,
      pubDate: it.pubDate,
      source: it.source?.['#text'] || it.source || 'Google News',
    }))
}

router.get('/', async (req, res) => {
  const market = FEEDS[req.query.market] ? req.query.market : 'vn'
  try {
    const items = await cached(`news:${market}`, 5 * 60 * 1000, async () => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 9000)
      try {
        const r = await fetch(FEEDS[market].url, { signal: controller.signal })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return parseFeed(await r.text())
      } finally {
        clearTimeout(timer)
      }
    })
    res.json({ market, label: FEEDS[market].label, items })
  } catch (err) {
    console.warn('[news] không tải được RSS:', err.message)
    res.json({ market, label: FEEDS[market].label, items: [], error: 'Không tải được tin tức (có thể do mạng). Hãy thử lại sau.' })
  }
})

export default router
