import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from '../hooks/useLocation';
import { fetchBrandPrices } from '../services/api';
import { PORTUGAL_FUEL_BRANDS } from '../constants/portugalBrands';

interface HomeScreenProps {
  onBrandSelect: (brand: string) => void;
}

interface BrandPrice {
  brand: string;
  price: number;
  count: number;
  savings: number;
}

const FUEL_TYPES = ['Diesel', 'Gasolina 95', 'Gasolina 98'] as const;

const HomeScreen: React.FC<HomeScreenProps> = ({ onBrandSelect }) => {
  const [fuelType, setFuelType] = useState<string>(FUEL_TYPES[0]);
  const [brandPrices, setBrandPrices] = useState<BrandPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const { location, loading: locationLoading } = useLocation();

  useEffect(() => {
    if (!location) return;

    const loadPrices = async () => {
      setLoading(true);
      sessionStorage.setItem('fuelType', fuelType);
      const prices = await fetchBrandPrices(
        location.latitude,
        location.longitude,
        15,
        fuelType
      );
      setBrandPrices(prices);
      setLoading(false);
    };

    loadPrices();
  }, [location, fuelType]);

  const priceByBrand = useMemo(
    () => Object.fromEntries(brandPrices.map((b) => [b.brand, b])),
    [brandPrices]
  );

  const cheapestBrandId = useMemo(() => {
    if (brandPrices.length === 0) return null;
    return brandPrices.reduce((min, b) => (b.price < min.price ? b : min)).brand;
  }, [brandPrices]);

  const locationLabel = locationLoading
    ? 'A detetar localização...'
    : location
      ? `${location.city}, Portugal`
      : 'Portugal';

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
      }}
    >
      {/* Header — profile only, Bolt-style */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '12px 16px 4px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#111',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
          }}
          aria-label="Perfil"
        >
          👤
        </div>
      </div>

      {/* Promo banner */}
      <div style={{ padding: '0 16px 8px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #00B140 0%, #008F34 100%)',
            borderRadius: '16px',
            padding: '20px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fff',
            minHeight: '100px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, lineHeight: 1.2 }}>
              Poupa no combustível
            </p>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.95 }}>
              Compara preços perto de ti →
            </p>
            <p style={{ margin: '10px 0 0', fontSize: '12px', opacity: 0.85 }}>
              📍 {locationLabel}
            </p>
          </div>
          <div style={{ fontSize: '56px', lineHeight: 1, marginLeft: '8px' }} aria-hidden>
            ⛽
          </div>
        </div>
      </div>

      {/* Fuel type chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 16px 8px',
          overflowX: 'auto',
        }}
      >
        {FUEL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFuelType(type)}
            style={{
              flexShrink: 0,
              padding: '8px 14px',
              borderRadius: '20px',
              border: fuelType === type ? '2px solid #00B140' : '2px solid #eee',
              backgroundColor: fuelType === type ? '#e8f8ee' : '#fff',
              color: fuelType === type ? '#008F34' : '#333',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Brand grid — 4 columns, square tiles */}
      <div style={{ flex: 1, padding: '8px 16px 24px' }}>
        {loading || locationLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#999' }}>
            A carregar preços oficiais (DGEG)...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px 10px',
            }}
          >
            {PORTUGAL_FUEL_BRANDS.map((brand) => {
              const priceInfo = priceByBrand[brand.id];
              const isCheapest = cheapestBrandId === brand.id && !!priceInfo;
              const hasStations = !!priceInfo;

              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => onBrandSelect(brand.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    opacity: hasStations ? 1 : 0.55,
                  }}
                >
                  <div style={{ position: 'relative', width: '100%' }}>
                    {isCheapest && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          left: '-4px',
                          zIndex: 1,
                          backgroundColor: '#00B140',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 6px',
                          borderRadius: '6px',
                          lineHeight: 1,
                        }}
                      >
                        Promo
                      </span>
                    )}
                    <div
                      style={{
                        aspectRatio: '1',
                        width: '100%',
                        borderRadius: '14px',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: '52%',
                          height: '52%',
                          borderRadius: '12px',
                          backgroundColor: brand.color,
                          color: brand.accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: brand.shortLabel.length > 2 ? '11px' : '16px',
                          letterSpacing: '-0.5px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        }}
                      >
                        {brand.shortLabel}
                      </div>
                      {hasStations ? (
                        <p
                          style={{
                            margin: '6px 0 0',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#008F34',
                          }}
                        >
                          €{priceInfo.price.toFixed(3)}
                        </p>
                      ) : (
                        <p
                          style={{
                            margin: '6px 0 0',
                            fontSize: '10px',
                            fontWeight: 500,
                            color: '#999',
                          }}
                        >
                          Sem postos
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#111',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {brand.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {!loading && !locationLoading && brandPrices.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              marginTop: '16px',
              fontSize: '13px',
              color: '#999',
            }}
          >
            Sem postos próximos — podes mesmo assim escolher uma marca
          </p>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
