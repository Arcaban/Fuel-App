import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from '../hooks/useLocation';
import { fetchBrandPrices } from '../services/api';
import { PORTUGAL_FUEL_BRANDS } from '../constants/portugalBrands';

// Midnight palette
const BG      = '#0F1623';
const SURFACE = '#1A2333';
const INK     = '#F0F3F8';
const MUTED   = '#94A3BC';
const HAIR    = '#26314A';

// Fuel accent colors (dark theme — text, dots, badges, borders)
const FUEL_ACCENT: Record<string, string> = {
  'Gasolina 95':          '#3FB37A',
  'Diesel':               '#E08E3F',
  'Gasolina 98':          '#8FD3FF',
  'Gasolina 95 Aditivada':'#5CC48A',
  'Diesel Aditivado':     '#F0A030',
};

// Fuel fill colors (dark theme — solid button backgrounds only)
const FUEL_FILL: Record<string, string> = {
  'Gasolina 95':          '#3FB37A',
  'Diesel':               '#E08E3F',
  'Gasolina 98':          '#3FA8EE',
  'Gasolina 95 Aditivada':'#4EAA7C',
  'Diesel Aditivado':     '#E09028',
};

const FONT = "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

interface HomeScreenProps {
  onBrandSelect: (brand: string) => void;
  onSettings: () => void;
}

interface BrandPrice {
  brand: string;
  price: number;
  count: number;
  savings: number;
}

const FUEL_TYPES = ['Gasolina 95', 'Diesel', 'Gasolina 98', 'Gasolina 95 Aditivada', 'Diesel Aditivado'] as const;

// Tinted chip backgrounds
const FUEL_CHIP_BG: Record<string, string> = {
  'Gasolina 95':          '#13261F',
  'Diesel':               '#2A1C10',
  'Gasolina 98':          '#101E2A',
  'Gasolina 95 Aditivada':'#162B21',
  'Diesel Aditivado':     '#2A1E0D',
};

// Location pin SVG
const PinIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path
      d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5Zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
      fill={color}
    />
  </svg>
);

// Settings gear SVG
const GearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M9 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
      stroke={MUTED}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.55 11.1a1.2 1.2 0 0 0 .24 1.32l.043.044a1.455 1.455 0 0 1-2.057 2.057l-.043-.044a1.2 1.2 0 0 0-1.32-.24 1.2 1.2 0 0 0-.727 1.098v.123a1.455 1.455 0 0 1-2.91 0v-.065a1.2 1.2 0 0 0-.786-1.098 1.2 1.2 0 0 0-1.32.24l-.044.044a1.455 1.455 0 0 1-2.057-2.057l.044-.044a1.2 1.2 0 0 0 .24-1.32 1.2 1.2 0 0 0-1.098-.727H2.655a1.455 1.455 0 0 1 0-2.91h.065a1.2 1.2 0 0 0 1.098-.786 1.2 1.2 0 0 0-.24-1.32l-.044-.044a1.455 1.455 0 0 1 2.057-2.057l.044.044a1.2 1.2 0 0 0 1.32.24h.057A1.2 1.2 0 0 0 7.74 3.12v-.123a1.455 1.455 0 0 1 2.91 0v.065a1.2 1.2 0 0 0 .727 1.098 1.2 1.2 0 0 0 1.32-.24l.044-.044a1.455 1.455 0 0 1 2.057 2.057l-.044.044a1.2 1.2 0 0 0-.24 1.32v.057a1.2 1.2 0 0 0 1.098.727h.123a1.455 1.455 0 0 1 0 2.91h-.065a1.2 1.2 0 0 0-1.098.727Z"
      stroke={MUTED}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ onBrandSelect, onSettings }) => {
  const [fuelType, setFuelType] = useState<string>(
    sessionStorage.getItem('fuelType') || FUEL_TYPES[0]
  );
  const [radius, setRadius] = useState<number>(
    parseInt(sessionStorage.getItem('radius') || '15', 10)
  );
  const [brandPrices, setBrandPrices] = useState<BrandPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const { location, loading: locationLoading, denied } = useLocation();

  const accent    = FUEL_ACCENT[fuelType] ?? '#0F8754';
  const fillColor = FUEL_FILL[fuelType]   ?? '#0F8754';

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
    const displayedIds = new Set(PORTUGAL_FUEL_BRANDS.map((b) => b.id));
    const displayed = brandPrices.filter((b) => displayedIds.has(b.brand));
    if (displayed.length === 0) return null;
    return displayed.reduce((min, b) => (b.price < min.price ? b : min)).brand;
  }, [brandPrices]);

  const cityLabel = locationLoading
    ? 'A detetar...'
    : location?.city || 'Portugal';

  // Slider fill percentage
  const sliderPct = ((radius - 1) / (50 - 1)) * 100;

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
        fontFamily: FONT,
        color: INK,
      }}
    >
      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px' }}>

        {/* Logo row */}
        <div style={{ paddingTop: '52px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1
              style={{
                fontSize: '58px',
                fontWeight: 900,
                letterSpacing: '-3px',
                margin: 0,
                lineHeight: 1,
                color: INK,
                fontFamily: FONT,
              }}
            >
              tanq<span style={{ color: accent }}>.</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
              <PinIcon color={accent} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: INK }}>{cityLabel}</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: MUTED, fontWeight: 400 }}>
              Preços de combustível em Portugal.
            </p>
          </div>
          <button
            type="button"
            onClick={onSettings}
            aria-label="Definições"
            style={{
              marginTop: '8px',
              width: '38px',
              height: '38px',
              backgroundColor: SURFACE,
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <GearIcon />
          </button>
        </div>

        {/* Location denied banner */}
        {denied && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              padding: '10px 14px',
              backgroundColor: 'rgba(194,106,26,0.12)',
              borderRadius: '10px',
              border: '1px solid rgba(194,106,26,0.25)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M7 1.75L12.25 11H1.75L7 1.75Z" stroke="#C26A1A" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M7 5.5v2.5M7 9.5v.25" stroke="#C26A1A" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: '12px', color: '#C26A1A', fontWeight: 600 }}>
              A usar Lisboa como localização padrão · Ativa nas definições do dispositivo
            </span>
          </div>
        )}

        {/* Fuel type chips */}
        <div style={{ marginBottom: '24px' }}>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '11px',
              color: MUTED,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}
          >
            Combustível
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {FUEL_TYPES.map((type) => {
              const isActive = fuelType === type;
              const chipAccent = FUEL_ACCENT[type] ?? '#0F8754';
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFuelType(type)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '24px',
                    border: isActive ? `1.5px solid ${chipAccent}` : `1.5px solid ${HAIR}`,
                    backgroundColor: isActive ? FUEL_CHIP_BG[type] : SURFACE,
                    color: isActive ? INK : MUTED,
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: FONT,
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: chipAccent,
                      flexShrink: 0,
                      opacity: isActive ? 1 : 0.45,
                    }}
                  />
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Radius slider */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                color: MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              Raio de pesquisa
            </p>
            <span style={{ fontSize: '15px', fontWeight: 800, color: accent }}>
              {radius} km
            </span>
          </div>
          {/* Custom slider track */}
          <div style={{ position: 'relative', height: '20px', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
            {/* Empty track */}
            <div style={{ position: 'absolute', left: 0, right: 0, height: '6px', borderRadius: '3px', backgroundColor: MUTED }} />
            {/* Filled track */}
            <div style={{ position: 'absolute', left: 0, height: '6px', width: `${sliderPct}%`, borderRadius: '3px', backgroundColor: accent }} />
            {/* Thumb */}
            <div
              style={{
                position: 'absolute',
                left: `${sliderPct}%`,
                transform: 'translateX(-50%)',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                boxShadow: '0 1px 6px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
              }}
            />
            {/* Transparent input captures interaction */}
            <input
              type="range"
              min={1}
              max={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                margin: 0,
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: MUTED }}>1 km</span>
            <span style={{ fontSize: '11px', color: MUTED }}>50 km</span>
          </div>
        </div>

        {/* Brand grid — 3 columns */}
        {loading || locationLoading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: MUTED, fontSize: '13px' }}>
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
                    backgroundColor: SURFACE,
                    border: isCheapest ? `2px solid ${accent}` : `2px solid transparent`,
                    borderRadius: '18px',
                    padding: '16px 8px 14px',
                    cursor: 'pointer',
                    opacity: hasPrice ? 1 : 0.35,
                    touchAction: 'manipulation',
                    fontFamily: FONT,
                  }}
                >
                  {isCheapest && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '7px',
                        right: '7px',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: accent,
                      }}
                    />
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
                      color: INK,
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
                        color: isCheapest ? accent : MUTED,
                      }}
                    >
                      €{priceInfo.price.toFixed(3)}
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: HAIR }}>—</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {!loading && !locationLoading && brandPrices.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: MUTED, marginTop: '8px' }}>
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
            backgroundColor: fillColor,
            color: '#fff',
            fontSize: '17px',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '-0.2px',
            fontFamily: FONT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          Ver postos
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 9h8M9 5l4 4-4 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
