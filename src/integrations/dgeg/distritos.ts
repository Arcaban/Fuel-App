/** DGEG distrito IDs — https://precoscombustiveis.dgeg.gov.pt */
export const DISTRITOS: { id: number; name: string; lat: number; lng: number }[] = [
  { id: 1, name: 'Aveiro', lat: 40.64, lng: -8.65 },
  { id: 2, name: 'Beja', lat: 38.02, lng: -7.87 },
  { id: 3, name: 'Braga', lat: 41.55, lng: -8.43 },
  { id: 4, name: 'Bragança', lat: 41.81, lng: -6.76 },
  { id: 5, name: 'Castelo Branco', lat: 39.82, lng: -7.49 },
  { id: 6, name: 'Coimbra', lat: 40.21, lng: -8.43 },
  { id: 7, name: 'Évora', lat: 38.57, lng: -7.91 },
  { id: 8, name: 'Faro', lat: 37.02, lng: -7.93 },
  { id: 9, name: 'Guarda', lat: 40.54, lng: -7.27 },
  { id: 10, name: 'Leiria', lat: 39.74, lng: -8.81 },
  { id: 11, name: 'Lisboa', lat: 38.72, lng: -9.14 },
  { id: 12, name: 'Portalegre', lat: 39.29, lng: -7.43 },
  { id: 13, name: 'Porto', lat: 41.15, lng: -8.61 },
  { id: 14, name: 'Santarém', lat: 39.24, lng: -8.68 },
  { id: 15, name: 'Setúbal', lat: 38.52, lng: -8.89 },
  { id: 16, name: 'Viana do Castelo', lat: 41.69, lng: -8.83 },
  { id: 17, name: 'Vila Real', lat: 41.3, lng: -7.74 },
  { id: 18, name: 'Viseu', lat: 40.66, lng: -7.91 },
];

const toRad = (deg: number) => (deg * Math.PI) / 180;

const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Pick up to 2 nearest distritos for station index queries */
export const getDistritoIdsForLocation = (lat: number, lng: number, count = 2): number[] => {
  return [...DISTRITOS]
    .map((d) => ({ id: d.id, dist: distanceKm(lat, lng, d.lat, d.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map((d) => d.id);
};
