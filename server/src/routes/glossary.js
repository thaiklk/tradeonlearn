// Từ điển thuật ngữ tài chính
import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GLOSSARY = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'glossary.json'), 'utf8'))

const router = Router()

router.get('/', (req, res) => {
  const q = String(req.query.q || '').toLowerCase().trim()
  const category = String(req.query.category || '')
  let items = GLOSSARY
  if (q) {
    items = items.filter(
      (t) => t.term.toLowerCase().includes(q) || t.vi.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)
    )
  }
  if (category) items = items.filter((t) => t.category === category)
  res.json({
    categories: [...new Set(GLOSSARY.map((t) => t.category))],
    total: GLOSSARY.length,
    items,
  })
})

router.get('/:term', (req, res) => {
  const q = String(req.params.term || '').toLowerCase()
  const item = GLOSSARY.find((t) => t.term.toLowerCase() === q || t.vi.toLowerCase() === q)
  if (!item) return res.status(404).json({ error: 'Không tìm thấy thuật ngữ' })
  res.json(item)
})

export default router
