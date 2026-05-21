import { Application, Request, Response } from 'express';
import { getNearby, getByBrand, getStation } from '../controllers/stationController';
import { getBrandPricesByLocation } from '../controllers/priceController';

export const setRoutes = (app: Application): void => {
    // Health check
    app.get('/', (_req: Request, res: Response) => {
        res.json({ status: 'ok', message: 'Fuel decision routing assistant API' });
    });

    // Station endpoints
    app.get('/api/stations/nearby', getNearby);
    app.get('/api/stations/brand/:brand', getByBrand);
    app.get('/api/stations/:id', getStation);

    // Price endpoints
    app.get('/api/prices/brands', getBrandPricesByLocation);
};