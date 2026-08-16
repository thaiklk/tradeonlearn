import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

const LEVEL_CLASS = { 'Cơ bản': 'c1', 'Trung cấp': 'c2', 'Nâng cao': 'c3' }

export default function Learn() {
  const { data: lessons, loading } = useApi(() => api.lessons(), [])
  const { data: progress } = useApi(() => api.progress(), [])

  if (loading) return <div className="spinner" />

  const levels = ['Cơ bản', 'Trung cấp', 'Nâng cao']

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card" style={{ display: 'flex', gap: 26, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 23 }}>🎓 Khóa học: Từ số 0 đến ra quyết định đầu tư</h1>
          <p className="muted" style={{ margin: '6px 0 0', maxWidth: 720 }}>
            15 bài học thiết kế cho người mới: nền tảng thị trường → công cụ kỹ thuật → <b>đọc hiểu báo cáo tài chính</b> →
            định giá cổ phiếu → quy trình ra quyết định mua/bán → quản trị rủi ro & tâm lý. Mỗi bài có ví dụ số cụ thể,
            phần thực hành có hướng dẫn để bạn áp dụng ngay vào dữ liệu và công cụ trên web.
          </p>
        </div>
        {progress && (
          <div style={{ display: 'flex', gap: 22 }}>
            <div className="center">
              <div className="muted" style={{ fontSize: 12 }}>ĐÃ ĐỌC</div>
              <div className="big num">{progress.lessonsRead}/{progress.lessonsTotal}</div>
            </div>
            <div className="center">
              <div className="muted" style={{ fontSize: 12 }}>LỘ TRÌNH</div>
              <div className="big num">{progress.lessonsTotal} bài</div>
            </div>
          </div>
        )}
      </div>

      {levels.map((level) => {
        const items = (lessons || []).filter((l) => l.level === level)
        if (!items.length) return null
        return (
          <div key={level} className="card">
            <div className="card-title">
              <span className={`lesson-level ${LEVEL_CLASS[level]}`}>{level}</span>
              <span className="muted" style={{ textTransform: 'none', fontSize: 12 }}>
                {level === 'Cơ bản' && 'Nền tảng thị trường & ngôn ngữ biểu đồ (Bài 1–5)'}
                {level === 'Trung cấp' && 'Chỉ báo kỹ thuật & đọc báo cáo tài chính, định giá (Bài 6–12)'}
                {level === 'Nâng cao' && 'Quy trình ra quyết định, rủi ro & tâm lý (Bài 13–15)'}
              </span>
            </div>
            <div className="grid" style={{ gap: 10 }}>
              {items.map((l) => {
                const done = l.progress?.read
                return (
                  <Link
                    key={l.id}
                    to={`/learn/${l.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                      border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-sm)',
                      background: '#0e1523aa', textDecoration: 'none', color: 'var(--text)',
                    }}
                  >
                    <span className="muted num" style={{ fontWeight: 800, width: 26 }}>
                      {l.order}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>{l.title}</div>
                      <div className="muted" style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.summary}
                      </div>
                    </span>
                    <span className="muted" style={{ fontSize: 12, flexShrink: 0 }}>
                      ⏱ {l.minutes}′ · 🧭 Có thực hành
                    </span>
                    {done && <span className="badge green">✓ Đã đọc</span>}
                    <span className="muted">→</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="card">
        <div className="card-title">🗺️ Gợi ý lộ trình</div>
        <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
          Học đúng thứ tự 1 → 15. Mỗi tuần 2 bài là nhịp phù hợp: đọc bài → làm phần thực hành có hướng dẫn → ghi lại nhận xét
          của bạn → áp dụng vào 1 lệnh giả lập. Sau Bài 12, hãy tự phân tích 1 mã thật từ đầu đến cuối theo{' '}
          <Link to="/learn/quy-trinh-ra-quyet-dinh">Bài 13</Link>. Chi tiết lộ trình 8 tuần xem trong{' '}
          <Link to="/guide">Hướng dẫn sử dụng</Link>.
        </p>
      </div>
    </div>
  )
}
