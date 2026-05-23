import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import BrandScreen from './screens/BrandScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SettingsScreen from './screens/SettingsScreen';
import AboutScreen from './screens/AboutScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import { useLocation } from './hooks/useLocation';

type ScreenType = 'onboarding' | 'home' | 'brand' | 'settings' | 'about' | 'privacy';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(
    localStorage.getItem('onboarding_complete') ? 'home' : 'onboarding'
  );
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const { denied } = useLocation();

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentScreen('brand');
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        backgroundColor: '#0F1623',
      }}
    >
      {currentScreen === 'onboarding' && (
        <OnboardingScreen onComplete={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'home' && (
        <HomeScreen
          onBrandSelect={handleBrandSelect}
          onSettings={() => setCurrentScreen('settings')}
        />
      )}
      {currentScreen === 'brand' && (
        <BrandScreen
          brand={selectedBrand}
          onBack={() => setCurrentScreen('home')}
        />
      )}
      {currentScreen === 'settings' && (
        <SettingsScreen
          onBack={() => setCurrentScreen('home')}
          onAbout={() => setCurrentScreen('about')}
          onPrivacy={() => setCurrentScreen('privacy')}
          locationDenied={denied}
        />
      )}
      {currentScreen === 'about' && (
        <AboutScreen onBack={() => setCurrentScreen('settings')} />
      )}
      {currentScreen === 'privacy' && (
        <PrivacyPolicyScreen onBack={() => setCurrentScreen('settings')} />
      )}
    </div>
  );
}

export default App;
