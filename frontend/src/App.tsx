import React, { useState, useEffect, useCallback } from 'react';
import HomeScreen from './screens/HomeScreen';
import BrandScreen from './screens/BrandScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SettingsScreen from './screens/SettingsScreen';
import AboutScreen from './screens/AboutScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import SplashScreen from './screens/SplashScreen';
import { useLocation } from './hooks/useLocation';
import { App as CapApp } from '@capacitor/app';

type ScreenType = 'onboarding' | 'home' | 'brand' | 'settings' | 'about' | 'privacy';

const BACK_MAP: Partial<Record<ScreenType, ScreenType>> = {
  brand: 'home',
  settings: 'home',
  about: 'settings',
  privacy: 'settings',
};

const startingOnHome = !!localStorage.getItem('onboarding_complete');

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(
    startingOnHome ? 'home' : 'onboarding'
  );
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [appReady, setAppReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { denied } = useLocation();

  // Minimum 1.5s so the splash always feels intentional, not a flash
  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // For home: wait for data + min time. For onboarding: min time only.
  const splashVisible = startingOnHome
    ? !(appReady && minTimeElapsed)
    : !minTimeElapsed;

  const handleReady = useCallback(() => setAppReady(true), []);
  const handleFadeComplete = useCallback(() => setShowSplash(false), []);

  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      const prev = BACK_MAP[currentScreen];
      if (prev) {
        setCurrentScreen(prev);
      } else {
        CapApp.exitApp();
      }
    });
    return () => { listener.then(h => h.remove()); };
  }, [currentScreen]);

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
      {showSplash && (
        <SplashScreen visible={splashVisible} onFadeComplete={handleFadeComplete} />
      )}
      {currentScreen === 'onboarding' && (
        <OnboardingScreen onComplete={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'home' && (
        <HomeScreen
          onBrandSelect={handleBrandSelect}
          onSettings={() => setCurrentScreen('settings')}
          onReady={handleReady}
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
