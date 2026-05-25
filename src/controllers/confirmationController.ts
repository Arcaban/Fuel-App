import { Request, Response } from 'express';

// In-memory store: stationId → Set of hashed device IDs
// Resets on server restart — good enough for testing; swap for DB rows later.
const store = new Map<string, Set<string>>();

const hashDevice = (deviceId: string): string => {
  let h = 0;
  for (let i = 0; i < deviceId.length; i++) {
    h = Math.imul(31, h) + deviceId.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
};

export const getConfirmations = (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const deviceId = Array.isArray(req.query.deviceId)
    ? String(req.query.deviceId[0])
    : String(req.query.deviceId ?? '');

  const set = store.get(id);
  const count = set?.size ?? 0;
  const confirmed = deviceId ? (set?.has(hashDevice(deviceId)) ?? false) : false;

  res.json({ count, confirmed });
};

export const addConfirmation = (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const body = req.body as { deviceId?: unknown };
  const deviceId = typeof body.deviceId === 'string' ? body.deviceId : '';

  if (!deviceId) {
    res.status(400).json({ error: 'deviceId required' });
    return;
  }

  if (!store.has(id)) store.set(id, new Set());
  store.get(id)!.add(hashDevice(deviceId));

  res.json({ count: store.get(id)!.size, confirmed: true });
};
