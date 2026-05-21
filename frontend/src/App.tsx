import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import BrandScreen from './screens/BrandScreen';
import StationScreen from './screens/StationScreen';
import NavigationHandoff from './screens/NavigationHandoff';
import type { SelectedStation } from './types/selectedStation';

type ScreenType = 'home' | 'brand' | 'station' | 'navigation';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<SelectedStation | null>(null);

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedStation(null);
    setCurrentScreen('brand');
  };

  const handleStationSelect = (station: SelectedStation) => {
    setSelectedStation(station);
    setCurrentScreen('station');
  };

  const handleNavigate = () => {
    setCurrentScreen('navigation');
  };

  const goHome = () => {
    setCurrentScreen('home');
  };

  const goBrand = () => {
    setCurrentScreen('brand');
  };

  const goStation = () => {
    setCurrentScreen('station');
  };

  const savingsLabel =
    selectedStation?.savingsPerLiter !== undefined &&
    selectedStation.savingsPerLiter > 0
      ? `€${(selectedStation.savingsPerLiter * 50).toFixed(2)} / 50 L`
      : '—';

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        margin: '0',
        padding: '0',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {currentScreen === 'home' && (
        <HomeScreen onBrandSelect={handleBrandSelect} />
      )}
      {currentScreen === 'brand' && (
        <BrandScreen
          brand={selectedBrand}
          onStationSelect={handleStationSelect}
          onBack={goHome}
        />
      )}
      {currentScreen === 'station' && selectedStation && (
        <StationScreen
          station={selectedStation}
          onNavigate={handleNavigate}
          onBack={goBrand}
        />
      )}
      {currentScreen === 'navigation' && selectedStation && (
        <NavigationHandoff
          station={selectedStation}
          savings={savingsLabel}
          onBack={goStation}
        />
      )}
    </div>
  );
}

export default App;
