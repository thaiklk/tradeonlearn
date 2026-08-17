import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'
import ExplainableValue from '../components/ExplainableValue.jsx'

export default function Desk() {
  const { data, loading } = useApi(() => api.tasks(), [])

  if (loading) return <div className="spinner" />

  const { xp, rank, tasks, totalXpAvailable } = data

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* Thẻ nhân viên */}
      <div className="card" style={{ display: 'flex', gap: 26, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 23 }}>💼 Phòng Phân Tài Chính — đi làm thật bằng tiền ảo</h1>
          <p className="muted" style={{ margin: '6px 0 0', maxWidth: 740 }}>
            Bạn là <b>{rank.name}</b> của phòng phân tích. Mỗi task là một nhiệm vụ như công việc thật: nhận email từ
            sếp → làm theo hướng dẫn từng bước trên dữ liệu <b>thời gian thực</b> → nộp và được mentor chấm. Làm tốt
            để thăng chức: Intern → Junior → Analyst → Senior.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 26 }}>
          <div className="center">
            <div className="muted" style={{ fontSize: 12 }}>CẤP BẬC</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{rank.name}</div>
            {rank.next != null && (
              <div className="muted" style={{ fontSize: 11.5 }}>còn {rank.next} XP → {rank.nextName}</div>
            )}
          </div>
          <div className="center">
            <div className="muted" style={{ fontSize: 12 }}>KINH NGHIỆM</div>
            <div className="big num">
              <ExplainableValue metricKey="xp" value={String(xp)} /><span style={{ fontSize: 13, color: 'var(--muted)' }}>/{totalXpAvailable} XP</span>
            </div>
            <div style={{ width: 140, height: 7, background: '#ffffff12', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (xp / totalXpAvailable) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--green))' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách task */}
      <div className="grid" style={{ gap: 10 }}>
        {tasks.map((t, i) => (
          <Link
            key={t.id}
            to={`/desk/${t.id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
              border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-sm)',
              background: t.progress.done ? 'linear-gradient(90deg,#22c55e12,transparent)' : '#0e1523aa',
              textDecoration: 'none', color: 'var(--text)',
            }}
          >
            <span className="muted num" style={{ fontWeight: 800, width: 24 }}>{i + 1}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{t.title}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>
                {t.level} · {t.role} · ⏱ {t.minutes}′ · 🧾 {t.fieldCount} mục chấm
              </div>
            </span>
            <span className="badge amber" style={{ flexShrink: 0 }}>+{t.xp} XP</span>
            {t.progress.done ? (
              <span className="badge green"><ExplainableValue metricKey="taskScore" value={`✓ ${t.progress.score}/${t.progress.total}`} /></span>
            ) : (
              <span className="badge gray">Chưa làm</span>
            )}
            <span className="muted">→</span>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="card-title">📋 Cách "đi làm" hiệu quả</div>
        <ul className="muted" style={{ margin: 0, paddingLeft: 20, fontSize: 13.5 }}>
          <li>Làm ĐÚNG THỨ TỰ 1→7 — mỗi task dùng kỹ năng của các task trước.</li>
          <li>Đọc email sếp kỹ → làm theo từng bước hướng dẫn (có giải thích vì sao) → tự điền số liệu thật vào form.</li>
          <li>Nộp xong mentor chấm bằng dữ liệu live: mục nào sai sẽ hiện số đúng để em học — sửa rồi nộp lại lấy điểm cao hơn.</li>
          <li>Kết hợp song song <Link to="/learn">lộ trình 49 bài tài chính doanh nghiệp</Link>: task áp dụng, bài học giải thích gốc rễ.</li>
        </ul>
      </div>
    </div>
  )
}
