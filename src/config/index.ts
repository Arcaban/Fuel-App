export const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
    dbConnectionString: process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/fuel-decision-routing',
    apiKey: process.env.API_KEY || 'your-api-key-here',
    fuelPriceApiUrl: process.env.FUEL_PRICE_API_URL || 'https://precoscombustiveis.dgeg.gov.pt/api/PrecoComb',
    mapsApiUrl: process.env.MAPS_API_URL || 'https://api.example.com/maps',
    /** dgeg = official Portugal prices API; mock = local test data */
    fuelDataProvider: process.env.FUEL_DATA_PROVIDER || 'mock',
    dgegMaxStations: parseInt(process.env.DGEG_MAX_STATIONS || '56', 10),
};
