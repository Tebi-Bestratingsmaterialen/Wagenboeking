import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: wachtwoord
    })

    if (error) {
      setError('Inloggen mislukt. Controleer je e-mailadres en wachtwoord.')
      setLoading(false)
      return
    }

    navigate('/admin')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      background: 'var(--bg)'
    }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, background: 'var(--dark)',
          borderRadius: 14, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800,
          color: '#fff', margin: '0 auto 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
        }}>T</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--dark)', letterSpacing: '-0.03em', marginBottom: 6 }}>
          Admin
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Log in om boekingen te beheren.
        </p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">E-mailadres</label>
            <input
              id="email"
              type="email"
              placeholder="admin@tebi.nl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label htmlFor="wachtwoord">Wachtwoord</label>
            <input
              id="wachtwoord"
              type="password"
              placeholder="••••••••"
              value={wachtwoord}
              onChange={e => setWachtwoord(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Bezig...' : 'Inloggen →'}
          </button>
        </form>
      </div>
    </div>
  )
}
