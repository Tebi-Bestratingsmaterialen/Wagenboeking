// Centrale lijst van bedrijfswagens. Hier voeg je een auto toe/verwijder je er een/wijzig je gegevens.
// naam (merk + model) is de hoofdnaam op de kaart, variant is de subtekst (bijv. kleur of bijnaam).
export const VEHICLES = [
  { id: 'berlingo_geel_oud', merk: 'Citroën', model: 'Berlingo', variant: 'Geel oud', kenteken: 'TF-098-N', kleur: '#e0a100' },
  { id: 'berlingo_zilver', merk: 'Citroën', model: 'Berlingo', variant: 'Zilver', kenteken: 'VKZ-24-K', kleur: '#64748b' },
  { id: 'berlingo_henk', merk: 'Citroën', model: 'Berlingo', variant: 'Henk', kenteken: 'VLR-28-N', kleur: '#a855f7' },
  { id: 'mercedes_eqv', merk: 'Mercedes', model: 'EQV', variant: 'Elektrische bus', kenteken: 'S-464-GP', kleur: '#1f6feb' },
]

export function getVehicle(id) {
  return VEHICLES.find(v => v.id === id) || VEHICLES[0]
}

// Hoofdnaam voor op kaarten/badges, bijv. "Citroën Berlingo" of "Mercedes EQV"
export function getVehicleName(v) {
  return `${v.merk} ${v.model}`
}