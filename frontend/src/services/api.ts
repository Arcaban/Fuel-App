const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:3001/api';

export interface Station {
  id: string;
  name: string;
  brand: string;
  latitude: number;
  longitude: number;
  price: number;
  fuelType: string;
  distance: number;
  lastUpdated: string;
}

export interface BrandPrice {
  brand: string;
  price: number;
  count: number;
}

// Fetch nearby stations (all brands)
// Returns null on network/API error, [] when successful but no results.
export const fetchNearbyStations = async (
  latitude: number,
  longitude: number,
  radius: number = 5,
  fuelType: string = 'Gasolina 95'
): Promise<Station[] | null> => {
  try {
    const response = await fetch(
      `${API_BASE}/stations/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}&fuelType=${encodeURIComponent(fuelType)}`
    );
    if (!response.ok) throw new Error('Failed to fetch stations');
    const data = await response.json();
    return data.stations ?? [];
  } catch (error) {
    console.error('Error fetching nearby stations:', error);
    return null;
  }
};

// Fetch stations by brand
// Returns null on network/API error, [] when successful but no results.
export const fetchStationsByBrand = async (
  brand: string,
  latitude: number,
  longitude: number,
  radius: number = 10,
  fuelType: string = 'Diesel'
): Promise<Station[] | null> => {
  try {
    const response = await fetch(
      `${API_BASE}/stations/brand/${encodeURIComponent(brand)}?lat=${latitude}&lng=${longitude}&radius=${radius}&fuelType=${encodeURIComponent(fuelType)}`
    );
    if (!response.ok) throw new Error('Failed to fetch brand stations');
    const data = await response.json();
    return data.stations ?? [];
  } catch (error) {
    console.error('Error fetching brand stations:', error);
    return null;
  }
};

// Fetch average brand prices in area
// Returns null on network/API error, [] when successful but no results.
export const fetchBrandPrices = async (
  latitude: number,
  longitude: number,
  radius: number = 15,
  fuelType: string = 'Diesel'
): Promise<BrandPrice[] | null> => {
  try {
    const response = await fetch(
      `${API_BASE}/prices/brands?lat=${latitude}&lng=${longitude}&radius=${radius}&fuelType=${encodeURIComponent(fuelType)}`
    );
    if (!response.ok) throw new Error('Failed to fetch brand prices');
    const data = await response.json();
    return data.brands ?? [];
  } catch (error) {
    console.error('Error fetching brand prices:', error);
    return null;
  }
};

// Fetch confirmation count + whether this device confirmed a station
export const fetchConfirmations = async (
  stationId: string,
  deviceId: string
): Promise<{ count: number; confirmed: boolean }> => {
  try {
    const res = await fetch(
      `${API_BASE}/stations/${encodeURIComponent(stationId)}/confirmations?deviceId=${encodeURIComponent(deviceId)}`
    );
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return { count: 0, confirmed: false };
  }
};

// Post a price confirmation for a station
export const postConfirmation = async (
  stationId: string,
  deviceId: string
): Promise<{ count: number; confirmed: boolean }> => {
  try {
    const res = await fetch(
      `${API_BASE}/stations/${encodeURIComponent(stationId)}/confirm`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      }
    );
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return { count: 0, confirmed: false };
  }
};

// Fetch single station details
export const fetchStationDetails = async (stationId: string) => {
  try {
    const response = await fetch(`${API_BASE}/stations/${stationId}`);
    if (!response.ok) throw new Error('Failed to fetch station');
    const data = await response.json();
    return data.station ?? null;
  } catch (error) {
    console.error('Error fetching station:', error);
    return null;
  }
};
