const API_BASE = 'http://localhost:3001/api';

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
export const fetchNearbyStations = async (
  latitude: number,
  longitude: number,
  radius: number = 5,
  fuelType: string = 'Gasolina 95'
) => {
  try {
    const response = await fetch(
      `${API_BASE}/stations/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}&fuelType=${encodeURIComponent(fuelType)}`
    );
    if (!response.ok) throw new Error('Failed to fetch stations');
    const data = await response.json();
    return data.stations ?? [];
  } catch (error) {
    console.error('Error fetching nearby stations:', error);
    return [];
  }
};

// Fetch stations by brand
export const fetchStationsByBrand = async (
  brand: string,
  latitude: number,
  longitude: number,
  radius: number = 10,
  fuelType: string = 'Diesel'
) => {
  try {
    const response = await fetch(
      `${API_BASE}/stations/brand/${encodeURIComponent(brand)}?lat=${latitude}&lng=${longitude}&radius=${radius}&fuelType=${encodeURIComponent(fuelType)}`
    );
    if (!response.ok) throw new Error('Failed to fetch brand stations');
    const data = await response.json();
    return data.stations ?? [];
  } catch (error) {
    console.error('Error fetching brand stations:', error);
    return [];
  }
};

// Fetch average brand prices in area
export const fetchBrandPrices = async (
  latitude: number,
  longitude: number,
  radius: number = 15,
  fuelType: string = 'Diesel'
) => {
  try {
    const response = await fetch(
      `${API_BASE}/prices/brands?lat=${latitude}&lng=${longitude}&radius=${radius}&fuelType=${encodeURIComponent(fuelType)}`
    );
    if (!response.ok) throw new Error('Failed to fetch brand prices');
    const data = await response.json();
    return data.brands ?? [];
  } catch (error) {
    console.error('Error fetching brand prices:', error);
    return [];
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
