import cron from 'node-cron';
import { getPool, isDbAvailable } from './db';
import { getBrandPrices } from './fuelPriceService';

const LISBON_LAT = 38.7223;
const LISBON_LNG = -9.1393;
const RADIUS_KM  = 50;

const FUEL_TYPES = [
  'Diesel',
  'Gasolina 95',
  'Gasolina 98',
  'Diesel Aditivado',
  'Gasolina 95 Aditivada',
];

const collectSnapshot = async (): Promise<void> => {
  const db = getPool();
  if (!db) return;

  console.log('[priceCollector] collecting daily snapshot…');

  for (const fuelType of FUEL_TYPES) {
    try {
      const brands = await getBrandPrices(LISBON_LAT, LISBON_LNG, RADIUS_KM, fuelType);
      for (const { brand, price } of brands) {
        await db.query(
          `INSERT INTO price_snapshots (brand, fuel_type, price)
           VALUES ($1, $2, $3)
           ON CONFLICT (brand, fuel_type, recorded_at) DO UPDATE SET price = EXCLUDED.price`,
          [brand, fuelType, price]
        );
      }
    } catch (err) {
      console.error(`[priceCollector] error for ${fuelType}:`, err);
    }
  }

  console.log('[priceCollector] snapshot saved.');
};

/** Starts the daily collector — does nothing if DATABASE_URL is not set */
export const startPriceCollector = (): void => {
  if (!isDbAvailable()) {
    console.log('[priceCollector] no DATABASE_URL — collector dormant.');
    return;
  }

  // Run immediately on startup to seed today's data
  collectSnapshot();

  // Then every day at 08:00 Lisbon time (UTC+1)
  cron.schedule('0 7 * * *', collectSnapshot, { timezone: 'Europe/Lisbon' });
  console.log('[priceCollector] daily collector scheduled (08:00 Lisbon).');
};
