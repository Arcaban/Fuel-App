export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface FuelStation {
    id: string;
    name: string;
    location: Coordinates;
    fuelTypes: string[];
    prices: Record<string, number>;
}

export interface Route {
    start: Coordinates;
    end: Coordinates;
    distance: number; // km
    duration: number; // minutes
}

export interface UserPreferences {
    fuelType: string;
    maxDistance: number; // km
    prioritizePrice: boolean;
}

export interface ScoredStation {
    station: FuelStation;
    distance: number; // km from user location
    score: number;    // 0-1, higher is better
    price: number;
}
