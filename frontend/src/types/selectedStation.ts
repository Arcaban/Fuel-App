import type { Station } from '../services/api';

/** Station chosen in the flow — extends API shape with UI-computed fields */
export type SelectedStation = Station & {
  /** Average €/L among same-brand stations in the current list */
  averageNearbyPrice?: number;
  /** Positive = cheaper than average (€/L) */
  savingsPerLiter?: number;
};
