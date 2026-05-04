import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function getWeekDays(startDate) {
  const days = []
  const start = new Date(startDate)
  start.setDate(start.getDate() - start.getDay() + 1) // Maandag
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

function toDateString(date) {
  return date.toISOString().split('T')[0]
}

const DAGnamen = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
const MAANDEN = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december']

export default function MijnBoekingen() {
  const [boekingen, setBoekingen] = useState([])
  const [loading, setLoading] = useState(true)
  const [geselecteerdeDag, setGeselecteerdeDag] = useState(toDateString(new Date()))
  const [weekStart, setWeekStart] = useState(new Date())
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBoekingen()
  }, [])

  async function fetchBoekingen() {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .gte('datum', toDateString(new Date()))
      .order('datum', { ascending: true })
      .order('van', { ascending: true })

    if (error) setError('Fout bij ophalen: ' + error.message)
    else setBoekingen(data || [])
    setLoading(false)
  }

  async function annuleer(id) {
    if (!confirm('Wil je deze boeking annuleren?')) return
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (error) alert('Annuleren mislukt: ' + error.message)
    else setBoekingen(prev => prev.filter(b => b.id !== id))
  }

  const weekDagen = getWeekDays(weekStart)
  const today = toDateString(new Date())

  const boekingenOpDag = boekingen.filter(b => b.datum === geselecteerdeDag)

  function vorigeWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  function volgendeWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  const maandJaar = () => {
    const d = weekDagen[0]
    return `${MAANDEN[d.getMonth()]} ${d.getFullYear()}`
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Boekingen</h1>
        <p className="page-subtitle">Bekijk wanneer de bedrijfswagen beschikbaar is.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Kalender */}
      <div className="card" style={{ marginBottom: 20, padding: '20px' }}>
        {/* Navigatie */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={vorigeWeek}>←</button>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--dark)' }}>{maandJaar()}</span>
          <button className="btn btn-ghost btn-sm" onClick={volgendeWeek}>→</button>
        </div>

        {/* Dagen */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {weekDagen.map((dag, i) => {
            const dagStr = toDateString(dag)
            const heeftBoeking = boekingen.some(b => b.datum === dagStr)
            const isGeselecteerd = dagStr === geselecteerdeDag
            const isVandaag = dagStr === today
            const isVerleden = dagStr < today

            return (
              <button
                key={dagStr}
                onClick={() => setGeselecteerdeDag(dagStr)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 4px',
                  borderRadius: 10,
                  border: isVandaag ? '2px solid var(--green)' : '2px solid transparent',
                  background: isGeselecteerd ? 'var(--green)' : 'var(--bg)',
                  color: isGeselecteerd ? '#fff' : isVerleden ? 'var(--text-light)' : 'var(--text)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  opacity: isVerleden && !isGeselecteerd ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {DAGnamen[i]}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>
                  {dag.getDate()}
                </span>
                {heeftBoeking && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isGeselecteerd ? 'rgba(255,255,255,0.8)' : 'var(--green)'
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Boekingen op geselecteerde dag */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
          {new Date(geselecteerdeDag + 'T00:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>

        {loading && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Laden...</div>}

        {!loading && boekingenOpDag.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>✓</div>
            <p style={{ fontSize: '0.9rem' }}>Geen boekingen — wagen is beschikbaar.</p>
          </div>
        )}

        {boekingenOpDag.map(b => (
          <div key={b.id} className="card" style={{ marginBottom: 10, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>
                  {b.van ? `${b.van.slice(0,5)} – ${b.tot.slice(0,5)}` : b.tijdslot}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.naam}</div>
              </div>
              {geselecteerdeDag >= today && (
                <button className="btn btn-ghost btn-sm" onClick={() => annuleer(b.id)}>
                  Annuleren
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
