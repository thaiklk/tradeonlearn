import { Component } from 'react'
import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import StockDetail from './pages/StockDetail.jsx'
import Trading from './pages/Trading.jsx'
import Learn from './pages/Learn.jsx'
import LessonDetail from './pages/LessonDetail.jsx'
import Glossary from './pages/Glossary.jsx'
import News from './pages/News.jsx'
import Guide from './pages/Guide.jsx'
import Desk from './pages/Desk.jsx'
import TaskDetail from './pages/TaskDetail.jsx'
import Roadmap from './pages/Roadmap.jsx'
import HealthCheck from './pages/HealthCheck.jsx'

// Lưới an toàn: nếu 1 component lỗi, hiện thông báo dễ đọc thay vì màn hình đen
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error) {
    console.error('[TradeLearn] Lỗi hiển thị:', error)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 48, margin: 24, background: '#ef44441a', border: '1px solid #ef444455', borderRadius: 14, color: '#f87171' }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>⚠️ Trang gặp lỗi hiển thị</div>
          <div style={{ marginTop: 10, fontFamily: 'monospace', fontSize: 13 }}>{String(this.state.error?.message || this.state.error)}</div>
          <div style={{ marginTop: 14 }}>
            Bấm <b>Ctrl + Shift + R</b> (tải lại hoàn toàn). Nếu lỗi lặp lại, chạy lại <b>BAT-CHAY-WEB-ONLINE.bat</b>.
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <>
      <NavBar />
      <main className="page">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:id" element={<LessonDetail />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/news" element={<News />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/desk" element={<Desk />} />
            <Route path="/desk/:id" element={<TaskDetail />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/health-check/:symbol" element={<HealthCheck />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <footer className="footer">
        <div>
          📈 <b>TradeLearn</b> — web học tài chính & chứng khoán (Mỹ + Việt Nam) · Dữ liệu: Yahoo Finance, VNDirect,
          Google News
        </div>
        <div className="warn" style={{ marginTop: 6 }}>
          ⚠️ Mọi "gợi ý đầu tư" trên web được sinh từ chỉ báo kỹ thuật, chỉ phục vụ mục đích học tập và không phải
          lời khuyên đầu tư. Giao dịch bằng ví giả lập 100.000$ & 500 triệu ₫ — tiền ảo, kiến thức thật.
        </div>
      </footer>
    </>
  )
}
