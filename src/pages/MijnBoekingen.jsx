import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function MijnBoekingen() {
  const [naam, setNaam] = useState('')
  const [zoekNaam, setZoekNaam] = useState('')
  const [boekingen, setBoekingen] = useState([])
  const [loading, setLoading] = useState(false)
  const [gezocht, setGezocht] = useState(false)
  const [error, setError] = useState('')

  async function fetchBoekingen(e) {
    e.preventDefault()
    if (!naam.trim()) return
    setLoading(true)
    setError('')
    setGezocht(true)
    setZoekNaam(naam.trim())

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .ilike('naam', `%${naam.trim()}%`)
      .gte('datum', new Date().toISOString().split('T')[0])
      .order('datum', { ascending: true })

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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Mijn boekingen</h1>
        <p className="page-subtitle">Zoek op naam om je aankomende boekingen te bekijken.</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={fetchBoekingen} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Naam</label>
            <input
              type="text"
              placeholder="Zoek op naam..."
              value={naam}
              onChange={e => setNaam(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : 'Zoeken'}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {gezocht && !loading && boekingen.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>Geen aankomende boekingen gevonden voor <strong>{zoekNaam}</strong>.</p>
          </div>
        </div>
      )}

      {boekingen.map(b => (
        <div key={b.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                {formatDatum(b.datum)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-green">{b.tijdslot}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{b.naam}</span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => annuleer(b.id)}>
              Annuleren
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDatum(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nl-NL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}
