import axios from 'axios';
import { parseDgegPrice } from './parsePrice';
import { normalizeBrand } from './brandMapping';

/** Brands shown on home screen — ensure we query nearest postos per brand */
const PRIORITY_BRANDS = [
  'Galp',
  'Repsol',
  'BP',
  'Cepsa',
  'Prio',
  'Intermarché',
  'Auchan',
  'Silva & Feijão',
];

const selectStationsForPriceFetch = (
  candidates: (DgegSearchStation & { distance: number })[],
  maxStations: number,
  stationsPerBrand = 4
): (DgegSearchStation & { distance: number })[] => {
  const byBrand = new Map<string, (DgegSearchStation & { distance: number })[]>();

  for (const station of candidates) {
    const brand = normalizeBrand(station.Marca);
    if (!byBrand.has(brand)) byBrand.set(brand, []);
    byBrand.get(brand)!.push(station);
  }

  for (const list of byBrand.values()) {
    list.sort((a, b) => a.distance - b.distance);
  }

  const selected = new Map<number, DgegSearchStation & { distance: number }>();

  for (const brand of PRIORITY_BRANDS) {
    const list = byBrand.get(brand) ?? [];
    for (const station of list.slice(0, stationsPerBrand)) {
      selected.set(station.Id, station);
    }
  }

  const remaining = [...candidates]
    .filter((s) => !selected.has(s.Id))
    .sort((a, b) => a.distance - b.distance);

  for (const station of remaining) {
    if (selected.size >= maxStations) break;
    selected.set(station.Id, station);
  }

  return [...selected.values()];
};
import { getDgegFuelCandidates } from './fuelTypes';
import {
  DgegSearchStation,
  DgegStationDetail,
  FuelStationResult,
} from './types';

const API_BASE = 'https://precoscombustiveis.dgeg.gov.pt/api/PrecoComb';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const getCached = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
};

const setCache = <T>(key: string, data: T, ttlMs: number) => {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
};

const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export class DgegClient {
  private readonly stationCacheTtlMs: number;
  private readonly detailCacheTtlMs: number;

  constructor(
    stationCacheTtlMs = 60 * 60 * 1000,
    detailCacheTtlMs = 15 * 60 * 1000
  ) {
    this.stationCacheTtlMs = stationCacheTtlMs;
    this.detailCacheTtlMs = detailCacheTtlMs;
  }

  async searchDistritoStations(distritoId: number): Promise<DgegSearchStation[]> {
    const cacheKey = `distrito:${distritoId}`;
    const cached = getCached<DgegSearchStation[]>(cacheKey);
    if (cached) return cached;

    const { data } = await axios.get(`${API_BASE}/PesquisarPostos`, {
      params: {
        idDistrito: distritoId,
        qtdPorPagina: 99999,
        pagina: 1,
      },
      timeout: 120000,
    });

    const stations: DgegSearchStation[] = data?.resultado ?? [];
    setCache(cacheKey, stations, this.stationCacheTtlMs);
    return stations;
  }

  async getStationDetail(stationId: number): Promise<DgegStationDetail | null> {
    const cacheKey = `station:${stationId}`;
    const cached = getCached<DgegStationDetail>(cacheKey);
    if (cached) return cached;

    const { data } = await axios.get(`${API_BASE}/GetDadosPosto`, {
      params: { id: stationId },
      timeout: 15000,
    });

    const detail: DgegStationDetail | null = data?.resultado ?? null;
    if (detail) setCache(cacheKey, detail, this.detailCacheTtlMs);
    return detail;
  }

  getFuelPrice(detail: DgegStationDetail, fuelType: string): {
    price: number;
    lastUpdated: string;
    fuelLabel: string;
  } | null {
    const candidates = getDgegFuelCandidates(fuelType);
    const combustiveis = detail.Combustiveis ?? [];

    for (const dgegFuel of candidates) {
      const fuel = combustiveis.find((f) => f.TipoCombustivel === dgegFuel);
      if (!fuel) continue;

      const price = parseDgegPrice(fuel.Preco);
      if (price === null) continue;

      return {
        price,
        fuelLabel: dgegFuel,
        lastUpdated: fuel.DataAtualizacao
          ? new Date(fuel.DataAtualizacao.replace(' ', 'T')).toISOString()
          : new Date().toISOString(),
      };
    }

    return null;
  }

  async fetchStationWithPrice(
    searchRow: DgegSearchStation,
    fuelType: string,
    userLat: number,
    userLng: number
  ): Promise<FuelStationResult | null> {
    const detail = await this.getStationDetail(searchRow.Id);
    if (!detail) return null;

    const fuel = this.getFuelPrice(detail, fuelType);
    if (!fuel) return null;

    const lat =
      detail.Morada?.Latitude ?? searchRow.Latitude;
    const lng =
      detail.Morada?.Longitude ?? searchRow.Longitude;

    return {
      id: String(searchRow.Id),
      name: detail.Nome ?? searchRow.Nome,
      brand: normalizeBrand(detail.Marca ?? searchRow.Marca),
      latitude: lat,
      longitude: lng,
      price: fuel.price,
      fuelType,
      distance: haversineKm(userLat, userLng, lat, lng),
      lastUpdated: fuel.lastUpdated,
      municipio: detail.Morada?.Municipio ?? searchRow.Municipio,
      morada: detail.Morada?.Morada,
    };
  }

  /** Fetch prices for stations within radius (limits detail API calls) */
  async getNearbyStations(
    lat: number,
    lng: number,
    radiusKm: number,
    fuelType: string,
    distritoIds: number[],
    maxStations = 40
  ): Promise<FuelStationResult[]> {
    const allCandidates: (DgegSearchStation & { distance: number })[] = [];

    for (const distritoId of distritoIds) {
      const stations = await this.searchDistritoStations(distritoId);
      for (const s of stations) {
        if (!s.Latitude || !s.Longitude) continue;
        const distance = haversineKm(lat, lng, s.Latitude, s.Longitude);
        if (distance <= radiusKm) {
          allCandidates.push({ ...s, distance });
        }
      }
    }

    const uniqueById = new Map<number, DgegSearchStation & { distance: number }>();
    for (const s of allCandidates) {
      const existing = uniqueById.get(s.Id);
      if (!existing || s.distance < existing.distance) {
        uniqueById.set(s.Id, s);
      }
    }

    const inRadius = [...uniqueById.values()];
    const toFetch = selectStationsForPriceFetch(inRadius, maxStations);

    const results: FuelStationResult[] = [];
    const batchSize = 8;

    for (let i = 0; i < toFetch.length; i += batchSize) {
      const batch = toFetch.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((row) =>
          this.fetchStationWithPrice(row, fuelType, lat, lng)
        )
      );
      for (const r of batchResults) {
        if (r) results.push(r);
      }
    }

    return results.sort((a, b) => a.distance - b.distance);
  }
}

export const dgegClient = new DgegClient();
