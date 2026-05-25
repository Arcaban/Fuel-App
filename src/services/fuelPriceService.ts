import { config } from '../config/index';
import { dgegClient } from '../integrations/dgeg/dgegClient';
import { getDistritoIdsForLocation } from '../integrations/dgeg/distritos';
import { normalizeBrand } from '../integrations/dgeg/brandMapping';
import { BrandPriceResult, FuelStationResult } from '../integrations/dgeg/types';
import { getRoadDistances } from '../integrations/osrm/osrmClient';
import {
  getNearbyStations as getMockNearby,
  getStationsByBrand as getMockByBrand,
  getBrandPrices as getMockBrandPrices,
} from '../data/mockStations';

const useDgeg = (): boolean =>
  (process.env.FUEL_DATA_PROVIDER ?? 'dgeg').toLowerCase() !== 'mock';

export const getNearbyStations = async (
  latitude: number,
  longitude: number,
  radiusKm: number,
  fuelType = 'Diesel'
): Promise<FuelStationResult[]> => {
  if (!useDgeg()) {
    return getMockNearby(latitude, longitude, radiusKm) as FuelStationResult[];
  }

  const distritoIds = getDistritoIdsForLocation(latitude, longitude);
  const stations = await dgegClient.getNearbyStations(
    latitude,
    longitude,
    radiusKm,
    fuelType,
    distritoIds,
    config.dgegMaxStations
  );

  // Replace straight-line distances with road distances if OSRM is configured
  if (process.env.OSRM_URL && stations.length > 0) {
    const roadKms = await getRoadDistances(
      latitude,
      longitude,
      stations.map(s => ({ lat: s.latitude, lng: s.longitude }))
    );
    return stations.map((s, i) => ({
      ...s,
      distance: roadKms[i] ?? s.distance,
    }));
  }

  return stations;
};

export const getStationsByBrand = async (
  brand: string,
  latitude: number,
  longitude: number,
  radiusKm: number,
  fuelType = 'Diesel'
): Promise<FuelStationResult[]> => {
  const nearby = await getNearbyStations(
    latitude,
    longitude,
    radiusKm,
    fuelType
  );
  const brandLower = brand.toLowerCase();
  return nearby.filter(
    (s) => s.brand.toLowerCase() === brandLower
  );
};

export const getBrandPrices = async (
  latitude: number,
  longitude: number,
  radiusKm: number,
  fuelType = 'Diesel'
): Promise<BrandPriceResult[]> => {
  if (!useDgeg()) {
    return getMockBrandPrices(latitude, longitude, radiusKm);
  }

  const stations = await getNearbyStations(
    latitude,
    longitude,
    radiusKm,
    fuelType
  );

  if (stations.length === 0) return [];

  const brandPrices: Record<
    string,
    { total: number; count: number }
  > = {};

  for (const station of stations) {
    const brand = normalizeBrand(station.brand);
    if (!brandPrices[brand]) {
      brandPrices[brand] = { total: 0, count: 0 };
    }
    brandPrices[brand].total += station.price;
    brandPrices[brand].count += 1;
  }

  const maxPrice = Math.max(...stations.map((s) => s.price));

  return Object.entries(brandPrices)
    .map(([brand, data]) => ({
      brand,
      price: +(data.total / data.count).toFixed(3),
      count: data.count,
      savings: +(maxPrice - data.total / data.count).toFixed(3),
    }))
    .sort((a, b) => a.price - b.price);
};

export const getStationById = async (
  stationId: string,
  fuelType = 'Diesel'
): Promise<FuelStationResult | null> => {
  if (!useDgeg()) return null;

  const detail = await dgegClient.getStationDetail(parseInt(stationId, 10));
  if (!detail?.Morada?.Latitude || !detail.Morada.Longitude) return null;

  const fuel = dgegClient.getFuelPrice(detail, fuelType);
  if (!fuel) return null;

  return {
    id: stationId,
    name: detail.Nome,
    brand: normalizeBrand(detail.Marca),
    latitude: detail.Morada.Latitude,
    longitude: detail.Morada.Longitude,
    price: fuel.price,
    fuelType,
    distance: 0,
    lastUpdated: fuel.lastUpdated,
    municipio: detail.Morada.Municipio,
    morada: detail.Morada.Morada,
  };
};
