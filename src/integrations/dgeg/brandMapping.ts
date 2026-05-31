/** Normalize DGEG brand names to app display names */
const BRAND_MAP: Record<string, string> = {
  GALP: 'Galp',
  REPSOL: 'Repsol',
  BP: 'BP',
  CEPSA: 'Moeve',
  MOEVE: 'Moeve',
  PRIO: 'Prio',
  'INTERMARCHÉ': 'Intermarché',
  INTERMARCHE: 'Intermarché',
  AUCHAN: 'Auchan',
  'SILVA & FEIJÃO': 'Silva & Feijão',
  'SILVA & FEIJAO': 'Silva & Feijão',
  LUBRIALTA: 'Lubrialta',
  SHELL: 'Shell',
};

export const normalizeBrand = (marca: string | null | undefined): string => {
  if (!marca) return 'Outro';
  const key = marca.trim().toUpperCase();
  return BRAND_MAP[key] ?? marca.trim();
};
