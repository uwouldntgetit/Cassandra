export const TRENTO_ZONES = [
  { id: 'centro_storico', name: 'Centro Storico', lat: 46.0673, lon: 11.1212, baseDensity: 2800, profile: 'tourist_shopping' },
  { id: 'stazione',       name: 'Stazione FS',    lat: 46.0723, lon: 11.1162, baseDensity: 1800, profile: 'commuter' },
  { id: 'via_roma',       name: 'Via Roma',        lat: 46.0640, lon: 11.1240, baseDensity: 2200, profile: 'shopping' },
  { id: 'universita',     name: 'Università',      lat: 46.0660, lon: 11.1498, baseDensity: 1500, profile: 'student' },
  { id: 'piazza_venezia', name: 'Piazza Venezia',  lat: 46.0686, lon: 11.1174, baseDensity: 1400, profile: 'transit' },
  { id: 'parco_albere',   name: 'Parco delle Albere', lat: 46.0560, lon: 11.1298, baseDensity: 900,  profile: 'leisure' },
  { id: 'piazza_fiera',   name: 'Piazza Fiera',    lat: 46.0600, lon: 11.1150, baseDensity: 1100, profile: 'events' },
  { id: 'gardolo',        name: 'Gardolo',          lat: 46.0950, lon: 11.1200, baseDensity: 600,  profile: 'residential' },
  { id: 'povo',           name: 'Povo',             lat: 46.0580, lon: 11.1480, baseDensity: 700,  profile: 'student' },
  { id: 'oltrefersina',   name: 'Oltrefersina',     lat: 46.0620, lon: 11.1050, baseDensity: 500,  profile: 'residential' },
  { id: 'ravina',         name: 'Ravina',           lat: 46.0450, lon: 11.1250, baseDensity: 450,  profile: 'residential' },
  { id: 'piedicastello',  name: 'Piedicastello',    lat: 46.0710, lon: 11.1050, baseDensity: 550,  profile: 'residential' },
]

// Moltiplicatori per profilo di zona e condizione del giorno
export const PROFILE_MULTIPLIERS = {
  tourist_shopping: { weekday: 1.0,  weekend: 1.6,  summer: 1.35, holiday: 1.7  },
  commuter:         { weekday: 1.5,  weekend: 0.4,  summer: 0.85, holiday: 0.3  },
  shopping:         { weekday: 1.1,  weekend: 1.4,  summer: 1.1,  holiday: 1.5  },
  student:          { weekday: 1.6,  weekend: 0.3,  summer: 0.2,  holiday: 0.15 },
  transit:          { weekday: 1.2,  weekend: 0.7,  summer: 0.95, holiday: 0.6  },
  leisure:          { weekday: 0.7,  weekend: 1.9,  summer: 1.6,  holiday: 2.2  },
  events:           { weekday: 0.9,  weekend: 1.3,  summer: 1.3,  holiday: 1.9  },
  residential:      { weekday: 0.85, weekend: 1.1,  summer: 1.0,  holiday: 1.15 },
}
