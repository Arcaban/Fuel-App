import { useState, useEffect } from 'react';

interface LocationCoords {
  latitude: number;
  longitude: number;
  city: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ latitude: 38.7223, longitude: -9.1393, city: 'Lisboa' });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude, city: 'Lisboa' });
        setLoading(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setDenied(true);
        }
        setLocation({ latitude: 38.7223, longitude: -9.1393, city: 'Lisboa' });
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { location, loading, denied };
};
