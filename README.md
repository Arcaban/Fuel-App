# Fuel Decision and Routing Assistant

## Overview
The Fuel Decision and Routing Assistant is a web application designed to help users make informed decisions about fuel stations and routing options. It provides functionalities to find nearby fuel stations, compare fuel prices, and calculate optimal routes.

## Features
- **Fuel Station Locator**: Find nearby fuel stations based on user location.
- **Fuel Price Comparison**: Get current and historical fuel prices from various providers.
- **Routing Services**: Calculate the best routes to fuel stations using external mapping services.
- **Decision Support**: Analyze fuel options and recommend the best stations based on user preferences.

## Project Structure
```
fuel-decision-routing-assistant
├── src
│   ├── app.ts
│   ├── config
│   │   └── index.ts
│   ├── controllers
│   │   └── fuelController.ts
│   ├── routes
│   │   └── index.ts
│   ├── services
│   │   ├── routingService.ts
│   │   └── fuelDecisionService.ts
│   ├── integrations
│   │   ├── mapsProvider.ts
│   │   └── fuelPriceProvider.ts
│   ├── models
│   │   └── station.ts
│   ├── utils
│   │   └── geoutils.ts
│   └── types
│       └── index.ts
├── tests
│   ├── unit
│   │   └── fuelDecision.spec.ts
│   └── integration
│       └── routing.spec.ts
├── scripts
│   └── import-stations.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fuel-decision-routing-assistant.git
   ```
2. Navigate to the project directory:
   ```
   cd fuel-decision-routing-assistant
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.
2. Start the application:
   ```
   npm start
   ```
3. Access the application at `http://localhost:3000`.

## Testing
To run the tests, use the following command:
```
npm test
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.