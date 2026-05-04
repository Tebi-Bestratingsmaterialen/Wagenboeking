import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

export default function Home() {
  const [user, setUser] = useState(null)
  const [datum, setDatum] = useState(getTodayString())
  const [van, setVan] = useState('08:00')
  const [tot, setTot] = useState('12:00')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const opgeslagen = localStorage.getItem('tebi_user')
    if (!opgeslagen) navigate('/start')
    else setUser(JSON.parse(opgeslagen))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!datum || !van || !tot) {
      setError('Vul alle velden in.')
      return
    }

    if (van >= tot) {
      setError('Eindtijd moet na de begintijd liggen.')
      return
    }

    setLoading(true)

    // Check overlappende boekingen op die datum
    const { data: bestaand, error: checkError } = await supabase
      .from('bookings')
      .select('van, tot, naam')
      .eq('datum', datum)

    if (checkError) {
      setError('Er is een fout opgetreden. Probeer opnieuw.')
      setLoading(false)
      return
    }

    const overlap = bestaand?.find(b => van < b.tot && tot > b.van)
    if (overlap) {
      setError(`Er is al een boeking van ${overlap.van.slice(0,5)} tot ${overlap.tot.slice(0,5)} door ${overlap.naam}. Kies een ander tijdslot.`)
      setLoading(false)
      return
    }

    const tijdslot = `${van} – ${tot}`

    const { error: insertError } = await supabase
      .from('bookings')
      .insert([{ naam: user.naam, email: user.email, datum, tijdslot, van, tot }])

    if (insertError) {
      setError('Opslaan mislukt: ' + insertError.message)
      setLoading(false)
      return
    }

    try {
      const mailRes = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam: user.naam, email: user.email, datum, tijdslot })
      })
      const mailData = await mailRes.json()
      console.log('Mail response:', mailData)
    } catch (mailErr) {
      console.warn('Mail kon niet worden verstuurd:', mailErr)
    }

    setSuccess(true)
    setDatum(getTodayString())
    setVan('08:00')
    setTot('12:00')
    setLoading(false)
  }

  function uitloggen() {
    localStorage.removeItem('tebi_user')
    navigate('/start')
  }

  if (!user) return null

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Bedrijfswagen boeken</h1>
            <p className="page-subtitle">Reserveer de bedrijfswagen voor een datum en tijdslot.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.naam}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={uitloggen}>Wijzig</button>
          </div>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          ✓ Boeking geplaatst! Je ontvangt een bevestiging op <strong>{user.email}</strong>.
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="datum">Datum</label>
            <input
              id="datum"
              type="date"
              value={datum}
              min={getTodayString()}
              onChange={e => setDatum(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="van">Van</label>
              <input
                id="van"
                type="time"
                value={van}
                onChange={e => setVan(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="tot">Tot</label>
              <input
                id="tot"
                type="time"
                value={tot}
                onChange={e => setTot(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Bezig met opslaan...' : 'Boeking plaatsen →'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Overlappende boekingen worden automatisch geblokkeerd.
        </p>
      </div>
    </div>
  )
}

function formatDatum(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nl-NL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}
