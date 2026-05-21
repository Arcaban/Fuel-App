export interface Station {
    id: string;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    fuelTypes: string[];
}