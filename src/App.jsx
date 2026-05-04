import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Start from './pages/Start'
import Home from './pages/Home'
import MijnBoekingen from './pages/MijnBoekingen'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pagina's zonder navbar */}
        <Route path="/start" element={<Start />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Pagina's met navbar */}
        <Route path="/*" element={
          <>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mijn-boekingen" element={<MijnBoekingen />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            <footer style={{
              textAlign: 'center',
              padding: '24px 16px',
              fontSize: '0.78rem',
              color: 'var(--text-light)',
              borderTop: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              © {new Date().getFullYear()} TEBI Bestratingsmaterialen
            </footer>
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}
