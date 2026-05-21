export interface PortugalFuelBrand {
  id: string;
  name: string;
  shortLabel: string;
  color: string;
  accent: string;
}

/** Major fuel retail brands operating in Portugal */
export const PORTUGAL_FUEL_BRANDS: PortugalFuelBrand[] = [
  { id: 'Galp', name: 'Galp', shortLabel: 'G', color: '#FF6B00', accent: '#FFFFFF' },
  { id: 'Repsol', name: 'Repsol', shortLabel: 'R', color: '#FF8200', accent: '#FFFFFF' },
  { id: 'BP', name: 'BP', shortLabel: 'BP', color: '#00A651', accent: '#FFE600' },
  { id: 'Cepsa', name: 'Cepsa', shortLabel: 'C', color: '#E30613', accent: '#FFFFFF' },
  { id: 'Prio', name: 'Prio', shortLabel: 'P', color: '#003DA5', accent: '#FFFFFF' },
  { id: 'Intermarché', name: 'Intermarché', shortLabel: 'IM', color: '#E2001A', accent: '#FFFFFF' },
  { id: 'Auchan', name: 'Auchan', shortLabel: 'A', color: '#E2001A', accent: '#FFFFFF' },
  { id: 'Silva & Feijão', name: 'Silva & Feijão', shortLabel: 'S&F', color: '#F5C518', accent: '#1B5E20' },
];
