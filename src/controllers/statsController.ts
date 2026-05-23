import { Request, Response } from 'express';
import { getPool, isDbAvailable } from '../services/db';

export const getTrends = async (_req: Request, res: Response) => {
  if (!isDbAvailable()) {
    return res.json({ available: false, message: 'Statistics not yet available.', trends: [] });
  }

  const db = getPool()!;

  const { rows } = await db.query<{
    brand: string;
    fuel_type: string;
    price_today: string;
    price_week_ago: string;
  }>(`
    SELECT
      today.brand,
      today.fuel_type,
      today.price        AS price_today,
      week_ago.price     AS price_week_ago
    FROM price_snapshots today
    LEFT JOIN price_snapshots week_ago
      ON today.brand     = week_ago.brand
     AND today.fuel_type = week_ago.fuel_type
     AND week_ago.recorded_at = today.recorded_at - INTERVAL '7 days'
    WHERE today.recorded_at = CURRENT_DATE
    ORDER BY today.fuel_type, today.price
  `);

  const trends = rows.map((r) => {
    const today    = parseFloat(r.price_today);
    const weekAgo  = r.price_week_ago ? parseFloat(r.price_week_ago) : null;
    const change   = weekAgo !== null ? +(today - weekAgo).toFixed(3) : null;

    return {
      brand:     r.brand,
      fuelType:  r.fuel_type,
      price:     today,
      weekAgo,
      change,
      direction: change === null ? null : change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
    };
  });

  res.json({ available: true, trends });
};
