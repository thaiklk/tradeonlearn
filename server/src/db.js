import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// DATA_DIR có thể trỏ vào persistent disk khi triển khai trả phí; mặc định vẫn
// chạy được ngay ở local và môi trường demo.
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data')
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

    -- Phase 7: BCTC do người học tự nhập (tách biệt hoàn toàn khỏi dữ liệu live)
    CREATE TABLE IF NOT EXISTS manual_financials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      period TEXT NOT NULL,
      source TEXT DEFAULT '',
      currency TEXT DEFAULT 'VND',
      data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Workspace ẩn danh: dữ liệu học tập của từng trình duyệt public tách riêng.
    -- Các bảng cũ giữ nguyên để không làm hỏng file SQLite đã có ở máy người dùng.
    CREATE TABLE IF NOT EXISTS user_accounts (
      user_id TEXT PRIMARY KEY,
      starting_usd REAL NOT NULL DEFAULT 100000,
      cash_usd REAL NOT NULL DEFAULT 100000,
      starting_vnd REAL NOT NULL DEFAULT 500000000,
      cash_vnd REAL NOT NULL DEFAULT 500000000,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS user_positions (
      user_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      market TEXT NOT NULL,
      qty REAL NOT NULL,
      avg_price REAL NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, symbol)
    );
    CREATE TABLE IF NOT EXISTS user_trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      ts TEXT DEFAULT (datetime('now')),
      symbol TEXT NOT NULL,
      market TEXT NOT NULL,
      side TEXT NOT NULL CHECK (side IN ('BUY','SELL')),
      qty REAL NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      cash_after REAL
    );
    CREATE TABLE IF NOT EXISTS user_watchlist (
      user_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      market TEXT NOT NULL,
      name TEXT,
      added_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, symbol)
    );
    CREATE TABLE IF NOT EXISTS user_quiz_progress (
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      submitted_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS user_read_progress (
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      read_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS user_task_progress (
      user_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,
      submitted_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, task_id)
    );
    CREATE TABLE IF NOT EXISTS user_research_notes (
      user_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      thesis TEXT, evidence TEXT, valuation TEXT, catalysts TEXT,
      risks TEXT, invalidation TEXT, sources TEXT, checklist TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, symbol)
    );
    CREATE TABLE IF NOT EXISTS user_manual_financials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      period TEXT NOT NULL,
      source TEXT DEFAULT '',
      currency TEXT DEFAULT 'VND',
      data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_user_trades_workspace ON user_trades(user_id, id DESC);
    CREATE INDEX IF NOT EXISTS idx_user_manual_workspace ON user_manual_financials(user_id, symbol, period DESC);
  `)
  db.prepare('INSERT OR IGNORE INTO account (id) VALUES (1)').run()
}

const WORKSPACE_RE = /^[a-zA-Z0-9_-]{8,100}$/

export function workspaceId(input) {
  const value = String(input || '').trim()
  return WORKSPACE_RE.test(value) ? value : 'legacy-workspace'
}

export function ensureWorkspace(input) {
  const userId = workspaceId(input)
  db.prepare('INSERT OR IGNORE INTO user_accounts (user_id) VALUES (?)').run(userId)
  return userId
}

export default db
