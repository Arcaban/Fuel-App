import axios from 'axios';

const OSRM_URL = process.env.OSRM_URL || '';

interface OsrmTableResponse {
  durations: (number | null)[][];
  distances: (number | null)[][];
}

/**
 * Returns road distances in km from one origin to multiple destinations.
 * Falls back to null per destination if OSRM is unavailable.
 */
export const getRoadDistances = async (
  originLat: number,
  originLng: number,
  destinations: { lat: number; lng: number }[]
): Promise<(number | null)[]> => {
  if (!OSRM_URL || destinations.length === 0) return destinations.map(() => null);

  // OSRM coordinate format: lng,lat (longitude first)
  const coords = [
    `${originLng},${originLat}`,
    ...destinations.map(d => `${d.lng},${d.lat}`),
  ].join(';');

  try {
    const { data } = await axios.get<OsrmTableResponse>(
      `${OSRM_URL}/table/v1/driving/${coords}`,
      {
        params: { sources: 0, annotations: 'distance' },
        timeout: 8000,
      }
    );

    // distances[0] = distances from origin to each destination (in metres)
    const row = data.distances?.[0];
    if (!row) return destinations.map(() => null);

    // Skip index 0 (origin→origin = 0), convert metres to km
    return row.slice(1).map(m => (m !== null ? m / 1000 : null));
  } catch {
    return destinations.map(() => null);
  }
};
