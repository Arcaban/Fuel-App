/** Primary DGEG fuel name per app label */
export const DGEG_FUEL_TYPES: Record<string, string> = {
  Diesel:                  'Gasóleo simples',
  'Gasolina 95':           'Gasolina simples 95',
  'Gasolina 98':           'Gasolina especial 98',
  'Diesel Aditivado':      'Gasóleo especial',
  'Gasolina 95 Aditivada': 'Gasolina especial 95',
  'GPL':                   'GPL Auto',
  'Gasóleo simples':       'Gasóleo simples',
  'Gasolina simples 95':   'Gasolina simples 95',
};

/** Fallbacks when a posto does not sell the primary type */
export const DGEG_FUEL_FALLBACKS: Record<string, string[]> = {
  Diesel:                  ['Gasóleo simples', 'Biodiesel B15'],
  'Gasolina 95':           ['Gasolina simples 95'],
  'Gasolina 98':           ['Gasolina especial 98', 'Gasolina especial 95', 'Gasolina simples 95'],
  'Diesel Aditivado':      ['Gasóleo especial', 'Gasóleo simples'],
  'Gasolina 95 Aditivada': ['Gasolina especial 95', 'Gasolina simples 95'],
  'GPL':                   ['GPL Auto'],
};

export const getDgegFuelCandidates = (fuelType?: string): string[] => {
  const key = fuelType || 'Diesel';
  const fallbacks = DGEG_FUEL_FALLBACKS[key];
  if (fallbacks) return fallbacks;
  const primary = DGEG_FUEL_TYPES[key] ?? key;
  return [primary];
};

export const normalizeFuelType = (fuelType?: string): string => {
  return getDgegFuelCandidates(fuelType)[0];
};
