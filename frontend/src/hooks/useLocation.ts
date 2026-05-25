import { useState, useEffect } from 'react';

const MANUAL_KEY = 'tanq_manual_location';

interface LocationCoords {
  latitude: number;
  longitude: number;
  city: string;
}

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`
    );
    const d = await res.json();
    return d.city || d.locality || d.principalSubdivision || 'Portugal';
  } catch {
    return 'Portugal';
  }
};

// Silent IP-based fallback — used when GPS is unavailable or denied.
// Falls back to Lisbon if the service is unreachable.
const tryIpGeolocation = async (): Promise<LocationCoords> => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const d = await res.json();
    if (d.latitude && d.longitude && !d.error) {
      return {
        latitude: d.latitude,
        longitude: d.longitude,
        city: d.city || d.region || 'Portugal',
      };
    }
  } catch {}
  return { latitude: 38.7223, longitude: -9.1393, city: 'Lisboa' };
};

export const useLocation = () => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    // Manually stored location takes priority over everything
    const stored = localStorage.getItem(MANUAL_KEY);
    if (stored) {
      try {
        setLocation(JSON.parse(stored));
        setIsManual(true);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem(MANUAL_KEY);
      }
    }

    if (!navigator.geolocation) {
      tryIpGeolocation().then((loc) => {
        setLocation(loc);
        setLoading(false);
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const city = await reverseGeocode(latitude, longitude);
        setLocation({ latitude, longitude, city });
        setLoading(false);
      },
      async (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setDenied(true);
        }
        // Try IP geolocation before falling back to Lisbon
        const loc = await tryIpGeolocation();
        setLocation(loc);
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const setManualLocation = (loc: LocationCoords) => {
    localStorage.setItem(MANUAL_KEY, JSON.stringify(loc));
    setLocation(loc);
    setIsManual(true);
  };

  const clearManualLocation = () => {
    localStorage.removeItem(MANUAL_KEY);
    setIsManual(false);
    // Current IP-based location stays in place while user types a new search
  };

  return { location, loading, denied, isManual, setManualLocation, clearManualLocation };
};
