import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tanq.app',
  appName: 'tanq.',
  webDir: 'build',
  server: {
    // Use https scheme so the Android WebView can call an HTTPS Railway backend
    androidScheme: 'https',
  },
  android: {
    // Minimum Android SDK version (Android 7.0 = API 24, covers ~98% of devices)
    minWebViewVersion: 60,
  },
};

export default config;
