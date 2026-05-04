import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { naam, email, datum, tijdslot } = req.body

  const datumFormatted = new Date(datum + 'T00:00:00').toLocaleDateString('nl-NL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['it@tebi.nl'],
      subject: `Bevestiging wagenboeking – ${datumFormatted}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
          <div style="width: 42px; height: 42px; background: #3d7a2e; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; color: white; margin-bottom: 16px;">T</div>
          <h1 style="font-size: 1.3rem; font-weight: 700; color: #1a1a1a; margin: 0 0 6px;">Boeking bevestigd ✓</h1>
          <p style="color: #8a8a8a; margin: 0 0 24px; font-size: 0.9rem;">Hoi ${naam}, je boeking is succesvol geplaatst.</p>
          <div style="background: #f7f8fa; border: 1px solid #e8e8ec; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #8a8a8a; font-size: 0.85rem; width: 40%;">Datum</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1a1a1a;">${datumFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #8a8a8a; font-size: 0.85rem;">Tijdslot</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1a1a1a;">${tijdslot}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #8a8a8a; font-size: 0.85rem;">Geboekt door</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1a1a1a;">${naam}</td>
              </tr>
            </table>
          </div>
          <p style="color: #8a8a8a; font-size: 0.82rem; margin: 0;">
            Wil je annuleren? Ga naar de app en open "Mijn boekingen".<br><br>
            TEBI Bestratingsmaterialen
          </p>
        </div>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error })
    }

    console.log('Mail verstuurd:', data)
    return res.status(200).json({ ok: true, data })

  } catch (err) {
    console.error('Onverwachte fout:', err)
    return res.status(500).json({ error: err.message })
  }
}
