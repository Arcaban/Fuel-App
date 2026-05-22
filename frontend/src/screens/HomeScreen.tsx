import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from '../hooks/useLocation';
import { fetchBrandPrices } from '../services/api';
import { PORTUGAL_FUEL_BRANDS } from '../constants/portugalBrands';

const ORANGE = '#C8541A';
const BG = '#F5F0E8';

interface HomeScreenProps {
  onBrandSelect: (brand: string) => void;
}

interface BrandPrice {
  brand: string;
  price: number;
  count: number;
  savings: number;
}

const FUEL_TYPES = ['Gasolina 95', 'Diesel', 'Gasolina 98'] as const;

const HomeScreen: React.FC<HomeScreenProps> = ({ onBrandSelect }) => {
  const [fuelType, setFuelType] = useState<string>(
    sessionStorage.getItem('fuelType') || FUEL_TYPES[0]
  );
  const [radius, setRadius] = useState<number>(
    parseInt(sessionStorage.getItem('radius') || '15', 10)
  );
  const [brandPrices, setBrandPrices] = useState<BrandPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const { location, loading: locationLoading } = useLocation();

  useEffect(() => {
    if (!location) return;
    const loadPrices = async () => {
      setLoading(true);
      sessionStorage.setItem('fuelType', fuelType);
      sessionStorage.setItem('radius', String(radius));
      const prices = await fetchBrandPrices(
        location.latitude,
        location.longitude,
        radius,
        fuelType
      );
      setBrandPrices(prices);
      setLoading(false);
    };
    loadPrices();
  }, [location, fuelType, radius]);

  const priceByBrand = useMemo(
    () => Object.fromEntries(brandPrices.map((b) => [b.brand, b])),
    [brandPrices]
  );

  const cheapestBrandId = useMemo(() => {
    if (brandPrices.length === 0) return null;
    return brandPrices.reduce((min, b) => (b.price < min.price ? b : min)).brand;
  }, [brandPrices]);

  const cityLabel = locationLoading
    ? 'A detetar...'
    : location?.city || 'Portugal';

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: BG,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px' }}>

        {/* Logo */}
        <div style={{ paddingTop: '52px', marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '58px',
              fontWeight: 900,
              letterSpacing: '-3px',
              margin: 0,
              lineHeight: 1,
              color: '#111',
            }}
          >
            tanq<span style={{ color: ORANGE }}>.</span>
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#999', fontWeight: 400 }}>
            Preços de combustível em Portugal.
          </p>
        </div>

        {/* Location row */}
        <div style={{ marginBottom: '24px' }}>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: '11px',
              color: '#AAA',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}
          >
            Localização
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fff',
              borderRadius: '14px',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px', color: ORANGE }}>📍</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#111' }}>
                {cityLabel}
              </span>
            </div>
            <span style={{ color: '#CCC', fontSize: '20px', lineHeight: 1 }}>›</span>
          </div>
        </div>

        {/* Fuel type */}
        <div style={{ marginBottom: '24px' }}>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '11px',
              color: '#AAA',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}
          >
            Combustível
          </p>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {FUEL_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFuelType(type)}
                style={{
                  flexShrink: 0,
                  padding: '10px 18px',
                  borderRadius: '24px',
                  border: 'none',
                  backgroundColor: fuelType === type ? '#111' : '#fff',
                  color: fuelType === type ? '#fff' : '#555',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Radius slider */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                color: '#AAA',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              Raio de pesquisa
            </p>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#111' }}>
              {radius} km
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#111', cursor: 'pointer', margin: 0 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: '#C0BAB0' }}>1 km</span>
            <span style={{ fontSize: '11px', color: '#C0BAB0' }}>50 km</span>
          </div>
        </div>

        {/* Brand grid — 3 columns */}
        {loading || locationLoading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#C0BAB0', fontSize: '13px' }}>
            A carregar preços (DGEG)…
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            {PORTUGAL_FUEL_BRANDS.map((brand) => {
              const priceInfo = priceByBrand[brand.id];
              const isCheapest = cheapestBrandId === brand.id && !!priceInfo;
              const hasPrice = !!priceInfo;

              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => onBrandSelect(brand.id)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '7px',
                    backgroundColor: '#fff',
                    border: `2px solid ${isCheapest ? ORANGE : 'transparent'}`,
                    borderRadius: '18px',
                    padding: '16px 8px 14px',
                    cursor: 'pointer',
                    opacity: hasPrice ? 1 : 0.38,
                    touchAction: 'manipulation',
                  }}
                >
                  {isCheapest && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '7px',
                        right: '7px',
                        backgroundColor: ORANGE,
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        lineHeight: 1.4,
                      }}
                    >
                      Promo
                    </span>
                  )}

                  {/* Brand badge */}
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '15px',
                      backgroundColor: brand.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: brand.accent,
                      fontWeight: 800,
                      fontSize: brand.shortLabel.length > 2 ? '11px' : '19px',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {brand.shortLabel}
                  </div>

                  {/* Name */}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#222',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      maxWidth: '90px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {brand.name}
                  </span>

                  {/* Price */}
                  {hasPrice ? (
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: isCheapest ? ORANGE : '#111',
                      }}
                    >
                      €{priceInfo.price.toFixed(3)}
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#DDD' }}>—</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {!loading && !locationLoading && brandPrices.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#BBB', marginTop: '8px' }}>
            Sem postos no raio — tenta aumentar o raio.
          </p>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div style={{ padding: '12px 22px 36px', backgroundColor: BG }}>
        <button
          type="button"
          onClick={() => onBrandSelect('__all__')}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: ORANGE,
            color: '#fff',
            fontSize: '17px',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '-0.2px',
          }}
        >
          Ver postos →
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
