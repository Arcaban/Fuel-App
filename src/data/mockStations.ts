// Mock database of fuel stations in Lisbon
export const mockStations = [
  {
    id: '1',
    name: 'BP - Downtown',
    brand: 'BP',
    latitude: 38.7224,
    longitude: -9.1393,
    price: 1.45,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 5 * 60000).toISOString() // 5 mins ago
  },
  {
    id: '2',
    name: 'Repsol - Downtown',
    brand: 'Repsol',
    latitude: 38.7225,
    longitude: -9.1395,
    price: 1.42,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    id: '3',
    name: 'Galp - Downtown',
    brand: 'Galp',
    latitude: 38.7223,
    longitude: -9.1392,
    price: 1.48,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: '4',
    name: 'Cepsa - Downtown',
    brand: 'Cepsa',
    latitude: 38.7220,
    longitude: -9.1390,
    price: 1.50,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 20 * 60000).toISOString()
  },
  {
    id: '5',
    name: 'BP - Airport',
    brand: 'BP',
    latitude: 38.6819,
    longitude: -9.1353,
    price: 1.48,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 8 * 60000).toISOString()
  },
  {
    id: '6',
    name: 'Repsol - Airport',
    brand: 'Repsol',
    latitude: 38.6820,
    longitude: -9.1354,
    price: 1.44,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 12 * 60000).toISOString()
  },
  {
    id: '7',
    name: 'Galp - North Zone',
    brand: 'Galp',
    latitude: 38.7800,
    longitude: -9.1500,
    price: 1.46,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 7 * 60000).toISOString()
  },
  {
    id: '8',
    name: 'Cepsa - North Zone',
    brand: 'Cepsa',
    latitude: 38.7801,
    longitude: -9.1501,
    price: 1.49,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 11 * 60000).toISOString()
  },
  {
    id: '9',
    name: 'Prio - Marquês',
    brand: 'Prio',
    latitude: 38.7250,
    longitude: -9.1480,
    price: 1.41,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 6 * 60000).toISOString()
  },
  {
    id: '10',
    name: 'Prio - Belém',
    brand: 'Prio',
    latitude: 38.6980,
    longitude: -9.2100,
    price: 1.43,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 9 * 60000).toISOString()
  },
  {
    id: '11',
    name: 'Intermarché - Alvalade',
    brand: 'Intermarché',
    latitude: 38.7480,
    longitude: -9.1350,
    price: 1.40,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 14 * 60000).toISOString()
  },
  {
    id: '12',
    name: 'Auchan - Telheiras',
    brand: 'Auchan',
    latitude: 38.7600,
    longitude: -9.1680,
    price: 1.44,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 18 * 60000).toISOString()
  },
  {
    id: '13',
    name: 'Silva & Feijão - Amoreiras',
    brand: 'Silva & Feijão',
    latitude: 38.7320,
    longitude: -9.1620,
    price: 1.39,
    fuelType: 'Diesel',
    lastUpdated: new Date(Date.now() - 4 * 60000).toISOString()
  }
];

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get nearby stations within radius
export const getNearbyStations = (
  latitude: number,
  longitude: number,
  radius: number = 5
) => {
  return mockStations
    .map((station) => ({
      ...station,
      distance: calculateDistance(latitude, longitude, station.latitude, station.longitude)
    }))
    .filter((station) => station.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
};

// Get stations by brand within radius
export const getStationsByBrand = (
  brand: string,
  latitude: number,
  longitude: number,
  radius: number = 10
) => {
  return mockStations
    .filter((station) => station.brand.toLowerCase() === brand.toLowerCase())
    .map((station) => ({
      ...station,
      distance: calculateDistance(latitude, longitude, station.latitude, station.longitude)
    }))
    .filter((station) => station.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
};

// Get average prices by brand in area
export const getBrandPrices = (latitude: number, longitude: number, radius: number = 5) => {
  const nearbyStations = getNearbyStations(latitude, longitude, radius);
  const brandPrices: { [key: string]: { total: number; count: number } } = {};

  nearbyStations.forEach((station) => {
    if (!brandPrices[station.brand]) {
      brandPrices[station.brand] = { total: 0, count: 0 };
    }
    brandPrices[station.brand].total += station.price;
    brandPrices[station.brand].count += 1;
  });

  return Object.entries(brandPrices)
    .map(([brand, data]) => ({
      brand,
      price: +(data.total / data.count).toFixed(2),
      count: data.count,
      savings: +(Math.max(...nearbyStations.map((s) => s.price)) - data.total / data.count).toFixed(2)
    }))
    .sort((a, b) => a.price - b.price);
};
