export interface PortugalFuelBrand {
  id: string;
  name: string;
  shortLabel: string;
  color: string;
  accent: string;
}

/** Major fuel retail brands operating in Portugal */
export const PORTUGAL_FUEL_BRANDS: PortugalFuelBrand[] = [
  { id: 'Galp',          name: 'Galp',          shortLabel: 'G',   color: '#E07A1A', accent: '#FFFFFF' },
  { id: 'Repsol',        name: 'Repsol',        shortLabel: 'R',   color: '#EE7B0E', accent: '#FFFFFF' },
  { id: 'BP',            name: 'BP',            shortLabel: 'BP',  color: '#1F8E3D', accent: '#FFE600' },
  { id: 'Moeve',         name: 'Moeve',         shortLabel: 'M',   color: '#007C77', accent: '#FFFFFF' },
  { id: 'Prio',          name: 'Prio',          shortLabel: 'P',   color: '#1B4FA8', accent: '#FFFFFF' },
  { id: 'Intermarché',   name: 'Intermarché',   shortLabel: 'IM',  color: '#D8244B', accent: '#FFFFFF' },
  { id: 'Auchan',        name: 'Auchan',        shortLabel: 'A',   color: '#C22020', accent: '#FFFFFF' },
  { id: 'Silva & Feijão',name: 'Silva & Feijão', shortLabel: 'S&F', color: '#D6CFB5', accent: '#1B5E20' },
  { id: 'Lubrialta',    name: 'Lubrialta',    shortLabel: 'LB',  color: '#C41A1A', accent: '#FFFFFF' },
];
