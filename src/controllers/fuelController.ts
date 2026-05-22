import { Request, Response } from 'express';

class FuelController {
    async getFuelStations(_req: Request, res: Response): Promise<void> {
        res.send('List of fuel stations');
    }

    async getFuelPrices(_req: Request, res: Response): Promise<void> {
        res.send('Current fuel prices');
    }
}

export default FuelController;
