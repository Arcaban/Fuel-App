import { Request, Response } from 'express';
import { getBrandPrices } from '../services/fuelPriceService';

// GET /api/prices/brands
export const getBrandPricesByLocation = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 15, fuelType = 'Diesel' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng parameters required' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const searchRadius = parseFloat(radius as string);

    const brandPrices = await getBrandPrices(
      latitude,
      longitude,
      searchRadius,
      fuelType as string
    );

    res.json({
      success: true,
      source: 'dgeg',
      dataSource: 'https://precoscombustiveis.dgeg.gov.pt/',
      location: { latitude, longitude, radius: searchRadius },
      fuelType,
      brands: brandPrices,
    });
  } catch (error) {
    console.error('getBrandPrices error:', error);
    res.status(500).json({ error: 'Failed to fetch brand prices' });
  }
};
