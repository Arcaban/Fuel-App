import { FuelDecisionService } from '../../src/services/fuelDecisionService';

describe('FuelDecisionService', () => {
    let service: FuelDecisionService;

    beforeEach(() => {
        service = new FuelDecisionService();
    });

    describe('analyzeFuelOptions', () => {
        it('should analyze fuel options correctly', () => {
            const options = [
                { stationId: 1, price: 3.50, distance: 5 },
                { stationId: 2, price: 3.75, distance: 10 },
            ];
            const result = service.analyzeFuelOptions(options);
            expect(result).toBeDefined();
            // Add more specific expectations based on the implementation
        });
    });

    describe('recommendBestStation', () => {
        it('should recommend the best station based on price and distance', () => {
            const stations = [
                { stationId: 1, price: 3.50, distance: 5 },
                { stationId: 2, price: 3.75, distance: 10 },
            ];
            const result = service.recommendBestStation(stations);
            expect(result).toEqual(stations[0]); // Assuming the first station is the best
        });
    });
});