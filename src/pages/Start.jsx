import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Start() {
  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Als gebruiker al opgeslagen is, redirect naar boeken
    const opgeslagen = localStorage.getItem('tebi_user')
    if (opgeslagen) {
      navigate('/')
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!naam.trim() || !email.trim()) {
      setError('Vul je naam en e-mailadres in.')
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Vul een geldig e-mailadres in.')
      return
    }

    setLoading(true)

    // Sla op in Supabase (upsert op email)
    const { error: dbError } = await supabase
      .from('users')
      .upsert([{ naam: naam.trim(), email: email.trim().toLowerCase() }], {
        onConflict: 'email'
      })

    if (dbError) {
      setError('Er is iets misgegaan: ' + dbError.message)
      setLoading(false)
      return
    }

    // Sla op in localStorage
    localStorage.setItem('tebi_user', JSON.stringify({
      naam: naam.trim(),
      email: email.trim().toLowerCase()
    }))

    navigate('/')
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
      {/* Logo */}
<div style={{ marginBottom: 40, textAlign: 'center' }}>
  <img
    src="/logo.png"
    alt="TEBI logo"
    style={{
      width: 240,
      height: 'auto',
      margin: '0 auto 16px',
      display: 'block'
    }}
  />

  <h1 style={{
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--dark)',
    letterSpacing: '-0.03em',
    marginBottom: 6
  }}>
    Wagenboeking
  </h1>

  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
    Vul je gegevens in om de bedrijfswagen te boeken.
  </p>
</div>

      {/* Card */}
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Wie ben jij?</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Je ontvangt een bevestiging op je zakelijk e-mailadres.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="naam">Naam</label>
            <input
              id="naam"
              type="text"
              placeholder="Voornaam Achternaam"
              value={naam}
              onChange={e => setNaam(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label htmlFor="email">Zakelijk e-mailadres</label>
            <input
              id="email"
              type="email"
              placeholder="naam@tebi.nl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Bezig...' : 'Doorgaan →'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 20, fontSize: '0.78rem', color: 'var(--text-light)' }}>
        © {new Date().getFullYear()} TEBI Bestratingsmaterialen
      </p>
    </div>
  )
}
