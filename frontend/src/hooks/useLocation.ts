import { useState, useEffect } from 'react';

interface LocationCoords {
  latitude: number;
  longitude: number;
  city: string;
  error?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        latitude: 38.7223,
        longitude: -9.1393,
        city: 'Lisboa',
        error: 'Geolocation not supported'
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // For now, hardcode city as Lisbon. In production, use reverse geocoding
        setLocation({
          latitude,
          longitude,
          city: 'Lisbon'
        });
        setLoading(false);
      },
      (error) => {
        // Fallback to Lisbon coordinates
        setLocation({
          latitude: 38.7223,
          longitude: -9.1393,
          city: 'Lisboa',
          error: error.message
        });
        setLoading(false);
      }
    );
  }, []);

  return { location, loading };
};
