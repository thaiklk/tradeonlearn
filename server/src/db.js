import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')
fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(path.join(dataDir, 'app.db'))
db.pragma('journal_mode = WAL')

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS account (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      starting_usd REAL NOT NULL DEFAULT 100000,
      cash_usd REAL NOT NULL DEFAULT 100000,
      starting_vnd REAL NOT NULL DEFAULT 500000000,
      cash_vnd REAL NOT NULL DEFAULT 500000000,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS positions (
      symbol TEXT PRIMARY KEY,
      market TEXT NOT NULL,
      qty REAL NOT NULL,
      avg_price REAL NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT DEFAULT (datetime('now')),
      symbol TEXT NOT NULL,
      market TEXT NOT NULL,
      side TEXT NOT NULL CHECK (side IN ('BUY','SELL')),
      qty REAL NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      cash_after REAL
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      symbol TEXT PRIMARY KEY,
      market TEXT NOT NULL,
      name TEXT,
      added_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quiz_progress (
      lesson_id TEXT PRIMARY KEY,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      submitted_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS read_progress (
      lesson_id TEXT PRIMARY KEY,
      read_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS task_progress (
      task_id TEXT PRIMARY KEY,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,
      submitted_at TEXT DEFAULT (datetime('now'))
    );

    -- Phase 6: research workspace theo mã (migration an toàn, không đụng dữ liệu cũ)
    CREATE TABLE IF NOT EXISTS research_notes (
      symbol TEXT PRIMARY KEY,
      thesis TEXT, evidence TEXT, valuation TEXT, catalysts TEXT,
      risks TEXT, invalidation TEXT, sources TEXT, checklist TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `)
  db.prepare('INSERT OR IGNORE INTO account (id) VALUES (1)').run()
}

export default db
