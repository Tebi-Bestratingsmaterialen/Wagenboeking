import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'wagenboeking@tebi.nl' // Verander naar jouw verified domein in Resend

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { naam, email, datum, tijdslot } = await req.json()

    // Datum netjes opmaken
    const datumFormatted = new Date(datum + 'T00:00:00').toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `Bevestiging wagenboeking – ${datumFormatted}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
            
            <!-- Header -->
            <div style="margin-bottom: 32px;">
              <div style="
                width: 42px; height: 42px;
                background: #3d7a2e;
                border-radius: 10px;
                display: flex; align-items: center; justify-content: center;
                font-size: 1.2rem; font-weight: 800; color: white;
                margin-bottom: 16px;
              ">T</div>
              <h1 style="font-size: 1.3rem; font-weight: 700; color: #1a1a1a; margin: 0 0 6px;">
                Boeking bevestigd ✓
              </h1>
              <p style="color: #8a8a8a; margin: 0; font-size: 0.9rem;">
                Hoi ${naam}, je boeking is succesvol geplaatst.
              </p>
            </div>

            <!-- Details -->
            <div style="
              background: #f7f8fa;
              border: 1px solid #e8e8ec;
              border-radius: 10px;
              padding: 20px;
              margin-bottom: 28px;
            ">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #8a8a8a; font-size: 0.85rem; width: 40%;">Datum</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #1a1a1a; font-size: 0.9rem;">${datumFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8a8a8a; font-size: 0.85rem;">Tijdslot</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #1a1a1a; font-size: 0.9rem;">${tijdslot}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8a8a8a; font-size: 0.85rem;">Geboekt door</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #1a1a1a; font-size: 0.9rem;">${naam}</td>
                </tr>
              </table>
            </div>

            <p style="color: #8a8a8a; font-size: 0.82rem; margin: 0;">
              Wil je annuleren? Ga naar de app en open "Mijn boekingen".<br>
              TEBI Bestratingsmaterialen
            </p>
          </div>
        `
      })
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error('Resend fout: ' + err)
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
