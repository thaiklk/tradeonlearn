import { NavLink } from 'react-router-dom'
import StockSearch from './StockSearch.jsx'

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <span className="logo">📈</span>
          <span>
            TradeLearn
            <small>Học tài chính qua dữ liệu thật</small>
          </span>
        </NavLink>
        <nav className="nav-links" aria-label="Điều hướng chính">
          <NavLink to="/start">🎯 Bắt đầu</NavLink>
          <NavLink to="/corporate-finance">💼 Tài chính DN</NavLink>
          <NavLink to="/learn">Học tập</NavLink>
          <NavLink to="/" end>Tổng quan</NavLink>
          <NavLink to="/desk">💼 Phòng phân tích</NavLink>
          <NavLink to="/roadmap">🧭 Lộ trình</NavLink>
          <details className="nav-more">
            <summary>Khám phá</summary>
            <div className="nav-more-menu">
              <NavLink to="/compare">⚖️ So sánh doanh nghiệp</NavLink>
              <NavLink to="/research">🔬 Nghiên cứu</NavLink>
              <NavLink to="/manual">✍️ Nhập BCTC</NavLink>
              <NavLink to="/trading">Giao dịch giả lập</NavLink>
              <NavLink to="/glossary">Từ điển</NavLink>
              <NavLink to="/news">Tin tức</NavLink>
              <NavLink to="/guide">📖 Hướng dẫn</NavLink>
            </div>
          </details>
        </nav>
        <div className="nav-search">
          <StockSearch compact />
        </div>
      </div>
    </header>
  )
}
