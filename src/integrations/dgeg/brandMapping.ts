/** Normalize DGEG brand names to app display names */
const BRAND_MAP: Record<string, string> = {
  GALP: 'Galp',
  REPSOL: 'Repsol',
  BP: 'BP',
  CEPSA: 'Cepsa',
  MOEVE: 'Cepsa', // Cepsa network rebranded in Portugal
  PRIO: 'Prio',
  'INTERMARCHÉ': 'Intermarché',
  INTERMARCHE: 'Intermarché',
  AUCHAN: 'Auchan',
  'SILVA & FEIJÃO': 'Silva & Feijão',
  'SILVA & FEIJAO': 'Silva & Feijão',
  SHELL: 'Shell',
};

export const normalizeBrand = (marca: string | null | undefined): string => {
  if (!marca) return 'Outro';
  const key = marca.trim().toUpperCase();
  return BRAND_MAP[key] ?? marca.trim();
};
