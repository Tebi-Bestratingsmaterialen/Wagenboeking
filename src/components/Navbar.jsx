import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const location = useLocation()

  const links = [
    { to: '/', label: 'Boeken' },
    { to: '/mijn-boekingen', label: 'Mijn boekingen' },
    { to: '/admin', label: 'Admin' },
  ]

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="navbar-logo-box">T</span>
          <span className="navbar-title">Wagenboeking</span>
        </div>
        <nav className="navbar-links">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
