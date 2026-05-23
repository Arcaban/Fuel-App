import { useState, useEffect } from 'react';

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
      async (position) => {
        const { latitude, longitude } = position.coords;
        const city = await reverseGeocode(latitude, longitude);
        setLocation({ latitude, longitude, city });
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
