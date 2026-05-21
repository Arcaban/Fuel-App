import { RoutingService } from '../../src/services/routingService';
import { FuelDecisionService } from '../../src/services/fuelDecisionService';
import { MapsProvider } from '../../src/integrations/mapsProvider';
import { FuelPriceProvider } from '../../src/integrations/fuelPriceProvider';

describe('Routing Integration Tests', () => {
    let routingService: RoutingService;
    let fuelDecisionService: FuelDecisionService;
    let mapsProvider: MapsProvider;
    let fuelPriceProvider: FuelPriceProvider;

    beforeAll(() => {
        mapsProvider = new MapsProvider();
        fuelPriceProvider = new FuelPriceProvider();
        routingService = new RoutingService(mapsProvider);
        fuelDecisionService = new FuelDecisionService(fuelPriceProvider);
    });

    test('should calculate route correctly', async () => {
        const startLocation = { lat: 34.0522, lng: -118.2437 }; // Los Angeles
        const endLocation = { lat: 36.1699, lng: -115.1398 }; // Las Vegas
        const route = await routingService.calculateRoute(startLocation, endLocation);
        expect(route).toBeDefined();
        expect(route.length).toBeGreaterThan(0);
    });

    test('should get route details correctly', async () => {
        const routeId = 'some-route-id';
        const routeDetails = await routingService.getRouteDetails(routeId);
        expect(routeDetails).toBeDefined();
        expect(routeDetails.id).toBe(routeId);
    });
});