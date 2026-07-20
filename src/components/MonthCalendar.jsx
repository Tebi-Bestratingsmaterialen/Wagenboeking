import { useState, useMemo } from 'react'

const MAANDEN = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'
]
const DAGEN = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

function pad(n) { return String(n).padStart(2, '0') }
function toDateStr(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}` }

export default function MonthCalendar({ bookings, selectedDate, onSelectDate }) {
  const initial = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date()
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth()) // 0-indexed

  const bookingsByDate = useMemo(() => {
    const map = {}
    for (const b of bookings || []) {
      if (!map[b.datum]) map[b.datum] = []
      map[b.datum].push(b)
    }
    return map
  }, [bookings])

  const todayStr = toDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1)
    // maandag = 0 ... zondag = 6
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)

    const rows = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return rows
  }, [viewYear, viewMonth])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={prevMonth} aria-label="Vorige maand">←</button>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'capitalize' }}>
          {MAANDEN[viewMonth]} {viewYear}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={nextMonth} aria-label="Volgende maand">→</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAGEN.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {weeks.flat().map((day, idx) => {
          if (day === null) return <div key={idx} />
          const dateStr = toDateStr(viewYear, viewMonth, day)
          const dayBookings = bookingsByDate[dateStr] || []
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const isPast = dateStr < todayStr

          return (
            <button
              type="button"
              key={idx}
              onClick={() => onSelectDate && onSelectDate(dateStr)}
              title={dayBookings.map(b => `${b.naam}: ${b.van?.slice(0,5)}–${b.tot?.slice(0,5)}`).join('\n')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 3,
                minHeight: 52,
                padding: '6px 2px',
                borderRadius: 8,
                border: isSelected ? '1.5px solid var(--green)' : '1.5px solid transparent',
                background: isSelected ? 'var(--green-muted)' : (isToday ? '#fffbe6' : 'transparent'),
                cursor: 'pointer',
                opacity: isPast ? 0.45 : 1,
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: isToday ? 800 : 500 }}>{day}</span>
              {dayBookings.length > 0 && (
                <span style={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}>
                  {dayBookings.slice(0, 3).map((b, i) => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--green)',
                    }} />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="divider" style={{ margin: '16px 0 12px' }} />

      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          {selectedDate ? formatSelected(selectedDate) : 'Selecteer een datum'}
        </div>
        {(bookingsByDate[selectedDate] || []).length === 0 && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Nog geen boekingen op deze dag.</p>
        )}
        {(bookingsByDate[selectedDate] || [])
          .slice()
          .sort((a, b) => a.van.localeCompare(b.van))
          .map((b, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 10px', borderRadius: 8, background: 'var(--bg)', marginBottom: 6,
              fontSize: '0.85rem',
            }}>
              <span style={{ fontWeight: 600 }}>{b.naam}</span>
              <span style={{ color: 'var(--text-muted)' }}>{b.van?.slice(0,5)}–{b.tot?.slice(0,5)}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

function formatSelected(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nl-NL', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}