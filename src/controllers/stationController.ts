import { Request, Response } from 'express';
import {
  getNearbyStations,
  getStationsByBrand,
  getStationById,
} from '../services/fuelPriceService';

const parseCoords = (req: Request) => {
  const { lat, lng, radius, fuelType } = req.query;
  if (!lat || !lng) return null;
  return {
    latitude: parseFloat(lat as string),
    longitude: parseFloat(lng as string),
    radius: parseFloat((radius as string) || '5'),
    fuelType: (fuelType as string) || 'Diesel',
  };
};

// GET /api/stations/nearby
export const getNearby = async (req: Request, res: Response) => {
  try {
    const coords = parseCoords(req);
    if (!coords) {
      return res.status(400).json({ error: 'lat and lng parameters required' });
    }

    const stations = await getNearbyStations(
      coords.latitude,
      coords.longitude,
      coords.radius,
      coords.fuelType
    );

    res.json({
      success: true,
      source: process.env.FUEL_DATA_PROVIDER || 'dgeg',
      count: stations.length,
      stations,
    });
  } catch (error) {
    console.error('getNearby error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby stations' });
  }
};

// GET /api/stations/brand/:brand
export const getByBrand = async (req: Request, res: Response) => {
  try {
    const brand =
      typeof req.params.brand === 'string'
        ? req.params.brand
        : req.params.brand[0];
    const coords = parseCoords(req);
    if (!coords) {
      return res.status(400).json({ error: 'lat and lng parameters required' });
    }

    const searchRadius = parseFloat((req.query.radius as string) || '10');
    const stations = await getStationsByBrand(
      brand,
      coords.latitude,
      coords.longitude,
      searchRadius,
      coords.fuelType
    );

    res.json({
      success: true,
      source: process.env.FUEL_DATA_PROVIDER || 'dgeg',
      brand,
      count: stations.length,
      stations,
    });
  } catch (error) {
    console.error('getByBrand error:', error);
    res.status(500).json({ error: 'Failed to fetch stations by brand' });
  }
};

// GET /api/stations/:id
export const getStation = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    const fuelType = (req.query.fuelType as string) || 'Diesel';

    const station = await getStationById(id, fuelType);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json({
      success: true,
      source: process.env.FUEL_DATA_PROVIDER || 'dgeg',
      station,
    });
  } catch (error) {
    console.error('getStation error:', error);
    res.status(500).json({ error: 'Failed to fetch station' });
  }
};
