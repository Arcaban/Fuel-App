export class MapsProvider {
    getDirections(startLocation: string, endLocation: string): Promise<any> {
        // Implementation for fetching directions from an external mapping service
        return Promise.resolve();
    }

    getNearbyStations(location: string): Promise<any[]> {
        // Implementation for fetching nearby fuel stations from an external mapping service
        return Promise.resolve([]);
    }
}