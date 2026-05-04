# TEBI Wagenboeking

PWA webapplicatie voor het boeken van de bedrijfswagen.

## Stack
- **React + Vite** — frontend
- **Supabase** — database (PostgreSQL)
- **Vercel** — hosting
- **vite-plugin-pwa** — installeerbaar als app op telefoon/PC

---

## Lokaal starten

### 1. Installeer dependencies
```bash
npm install
```

### 2. Omgevingsvariabelen instellen
Kopieer `.env.example` naar `.env.local` en vul je Supabase gegevens in:
```bash
cp .env.example .env.local
```

Vind je gegevens in Supabase → Project Settings → API:
- `VITE_SUPABASE_URL` → Project URL
- `VITE_SUPABASE_ANON_KEY` → anon / public key

### 3. Start de dev server
```bash
npm run dev
```

---

## Supabase tabel

Voer dit uit in de Supabase SQL editor:

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  datum date not null,
  tijdslot text not null,
  created_at timestamptz default now()
);

-- Optioneel: Row Level Security uitschakelen (geen auth)
alter table bookings disable row level security;
```

---

## Deployen op Vercel

1. Push naar GitHub
2. Importeer project in Vercel
3. Voeg environment variables toe in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

---

## PWA installeren

Na deployment:
- **Android/Chrome**: Tik op "Installeer app" banner of via menu → "Toevoegen aan startscherm"
- **iOS/Safari**: Deel-knop → "Zet op beginscherm"
- **Desktop/Chrome**: Klik op installeer-icoontje in de adresbalk

---

## Uitbreiden

Toekomstige modules die toegevoegd kunnen worden:
- Artikelaanvraag (zelfde structuur, nieuw Supabase tabel)
- Authenticatie via Supabase Auth of Microsoft SSO
- E-mailnotificaties via Supabase Edge Functions
- Admin beveiliging met wachtwoord of rol
