// Centrale lijst van bedrijfswagens. Hier voeg je een auto toe/verwijder je er een.
export const VEHICLES = [
  { id: 'elektrische_bus', naam: 'Elektrische bus', kleur: '#1f6feb' },
  { id: 'berlingo', naam: 'Berlingo', kleur: '#e0a100' },
  { id: 'auto_henk', naam: 'Auto Henk', kleur: '#a855f7' },
]

export function getVehicle(id) {
  return VEHICLES.find(v => v.id === id) || VEHICLES[0]
}