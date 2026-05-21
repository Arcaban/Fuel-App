export interface FuelStation {
    id: string;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    fuelTypes: string[];
    prices: {
        [key: string]: number; // fuel type as key and price as value
    };
}

export interface Route {
    start: {
        latitude: number;
        longitude: number;
    };
    end: {
        latitude: number;
        longitude: number;
    };
    distance: number; // in kilometers
    duration: number; // in minutes
}