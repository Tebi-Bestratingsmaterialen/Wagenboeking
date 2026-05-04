import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TIJDSLOTEN = [
  '06:00 – 08:00',
  '08:00 – 10:00',
  '10:00 – 12:00',
  '12:00 – 14:00',
  '14:00 – 16:00',
  '16:00 – 18:00',
  'Hele dag',
]

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

export default function Home() {
  const [user, setUser] = useState(null)
  const [datum, setDatum] = useState(getTodayString())
  const [tijdslot, setTijdslot] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const opgeslagen = localStorage.getItem('tebi_user')
    if (!opgeslagen) {
      navigate('/start')
    } else {
      setUser(JSON.parse(opgeslagen))
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!datum || !tijdslot) {
      setError('Vul alle velden in.')
      return
    }

    setLoading(true)

    // Check of tijdslot al bezet is
    const { data: bestaand, error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .eq('datum', datum)
      .eq('tijdslot', tijdslot)

    if (checkError) {
      setError('Er is een fout opgetreden. Probeer opnieuw.')
      setLoading(false)
      return
    }

    if (bestaand && bestaand.length > 0) {
      setError(`Dit tijdslot is al geboekt op ${formatDatum(datum)}. Kies een ander tijdslot.`)
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('bookings')
      .insert([{
        naam: user.naam,
        email: user.email,
        datum,
        tijdslot
      }])

    if (insertError) {
      setError('Opslaan mislukt: ' + insertError.message)
      setLoading(false)
      return
    }

    // Stuur bevestigingsmail via Edge Function
    try {
      await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          naam: user.naam,
          email: user.email,
          datum,
          tijdslot
        }
      })
    } catch (mailErr) {
      // Mail fout is niet kritiek — boeking is al opgeslagen
      console.warn('Mail kon niet worden verstuurd:', mailErr)
    }

    setSuccess(true)
    setDatum(getTodayString())
    setTijdslot('')
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
            <button className="btn btn-ghost btn-sm" onClick={uitloggen}>
              Wijzig
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          ✓ Boeking geplaatst! Je ontvangt een bevestiging op <strong>{user.email}</strong>.
        </div>
      )}
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

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

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label htmlFor="tijdslot">Tijdslot</label>
            <select
              id="tijdslot"
              value={tijdslot}
              onChange={e => setTijdslot(e.target.value)}
              required
            >
              <option value="">Selecteer een tijdslot...</option>
              {TIJDSLOTEN.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Bezig met opslaan...' : 'Boeking plaatsen →'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Per tijdslot kan slechts één persoon de wagen boeken. Dubbele boekingen worden automatisch geblokkeerd.
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
