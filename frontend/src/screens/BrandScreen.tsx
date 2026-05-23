import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from '../hooks/useLocation';
import { fetchStationsByBrand, fetchNearbyStations, type Station } from '../services/api';
import BrandStationsMap from '../components/BrandStationsMap';
import { PORTUGAL_FUEL_BRANDS } from '../constants/portugalBrands';
import { buildWazeNavigateUrl, buildGoogleMapsDirectionsUrl, openExternal } from '../utils/navigationLinks';

// Midnight palette
const BG      = '#0F1623';
const SURFACE = '#1A2333';
const INK     = '#F0F3F8';
const MUTED   = '#94A3BC';
const HAIR    = '#26314A';
const SUNK    = '#0A0F1A';
const STALE   = '#C26A1A'; // amber for >24 h old prices

// Fuel accent colors (dark theme — text, dots, badges, borders)
const FUEL_ACCENT: Record<string, string> = {
  'Gasolina 95': '#3FB37A',
  'Diesel':      '#E08E3F',
  'Gasolina 98': '#8FD3FF',
};

// Fuel fill colors (dark theme — solid button backgrounds)
const FUEL_FILL: Record<string, string> = {
  'Gasolina 95': '#3FB37A',
  'Diesel':      '#E08E3F',
  'Gasolina 98': '#3FA8EE',
};

const FONT = "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const STALE_MS = 86400000; // 24 h

interface BrandScreenProps {
  brand: string;
  onBack: () => void;
}

const formatRelativeTime = (iso: string): string => {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor(ms / 60000);
    if (hours >= 1) return `há ${hours} h`;
    if (minutes >= 1) return `há ${minutes} min`;
    return 'agora';
  } catch {
    return '—';
  }
};

const isStalePrice = (iso: string): boolean => {
  try {
    return Date.now() - new Date(iso).getTime() > STALE_MS;
  } catch {
    return false;
  }
};

const getBrandColor = (brandId: string): string => {
  const found = PORTUGAL_FUEL_BRANDS.find((b) => b.id === brandId);
  return found?.color ?? '#94A3BC';
};

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BrandScreen: React.FC<BrandScreenProps> = ({ brand, onBack }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'distance'>('price');
  const listRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const listScrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const { location, loading: locationLoading } = useLocation();

  const fuelType = sessionStorage.getItem('fuelType') || 'Gasolina 95';
  const radius = parseInt(sessionStorage.getItem('radius') || '15', 10);
  const isAll = brand === '__all__';

  const accent    = FUEL_ACCENT[fuelType] ?? '#0F8754';
  const fillColor = FUEL_FILL[fuelType]   ?? '#0F8754';

  const loadStations = async () => {
    if (!location) return;
    const data = isAll
      ? await fetchNearbyStations(location.latitude, location.longitude, radius, fuelType)
      : await fetchStationsByBrand(brand, location.latitude, location.longitude, radius, fuelType);
    setStations(data);
  };

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    loadStations().then(() => setLoading(false));
  }, [brand, location]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    const el = listScrollRef.current;
    if (!el || refreshing || loading) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy > 70 && el.scrollTop === 0) {
      setRefreshing(true);
      await loadStations();
      setRefreshing(false);
    }
  };

  const sortedStations = useMemo(
    () =>
      [...stations].sort((a, b) =>
        sortBy === 'price' ? a.price - b.price : a.distance - b.distance
      ),
    [stations, sortBy]
  );

  const cheapestStation = useMemo(
    () =>
      sortedStations.length > 0
        ? sortedStations.reduce((p, c) => (c.price < p.price ? c : p))
        : null,
    [sortedStations]
  );

  const averageNearbyPrice = useMemo(() => {
    if (sortedStations.length === 0) return undefined;
    return sortedStations.reduce((a, s) => a + s.price, 0) / sortedStations.length;
  }, [sortedStations]);

  useEffect(() => {
    if (cheapestStation) setSelectedId(cheapestStation.id);
  }, [cheapestStation]);

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    listRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const cityLabel = location?.city ?? 'Portugal';
  const screenTitle = isAll ? fuelType : brand;
  const avgLabel = averageNearbyPrice ? `Média €${averageNearbyPrice.toFixed(3)}` : '';

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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 8px',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          style={{
            width: '38px',
            height: '38px',
            backgroundColor: SURFACE,
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BackIcon />
        </button>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: MUTED,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {sortedStations.length} postos
        </span>
        <div style={{ width: '38px' }} />
      </div>

      {/* Title + subtitle */}
      <div style={{ padding: '4px 20px 12px', flexShrink: 0 }}>
        <h1
          style={{
            margin: '0 0 4px',
            fontSize: '28px',
            fontWeight: 900,
            color: INK,
            letterSpacing: '-0.5px',
          }}
        >
          {screenTitle}
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>
          {cityLabel} · {radius} km de raio{avgLabel ? ` · ${avgLabel}` : ''}
        </p>
      </div>

      {/* Sort tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '0 20px 14px',
          flexShrink: 0,
        }}
      >
        {(['price', 'distance'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setSortBy(mode)}
            style={{
              padding: '9px 18px',
              borderRadius: '22px',
              border: sortBy === mode ? `1.5px solid ${fillColor}` : `1.5px solid ${HAIR}`,
              backgroundColor: sortBy === mode ? fillColor : SURFACE,
              color: sortBy === mode ? '#fff' : MUTED,
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: FONT,
            }}
          >
            {mode === 'price' ? 'Mais baratos' : 'Mais próximos'}
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{ flex: '0 0 26vh', minHeight: '180px', position: 'relative', flexShrink: 0 }}>
        {!loading && !locationLoading && sortedStations.length > 0 && location ? (
          <BrandStationsMap
            stations={sortedStations}
            userLat={location.latitude}
            userLng={location.longitude}
            cheapestId={cheapestStation?.id ?? null}
            selectedId={selectedId}
            onStationMarkerClick={handleMarkerClick}
            accentColor={accent}
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: MUTED,
              fontSize: '13px',
              backgroundColor: SUNK,
            }}
          >
            {loading || locationLoading ? 'A carregar postos…' : 'Sem postos no mapa'}
          </div>
        )}
      </div>

      {/* Station list */}
      <div
        ref={listScrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: SURFACE,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          marginTop: '-12px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Pull-to-refresh indicator */}
        {refreshing && (
          <div
            style={{
              textAlign: 'center',
              padding: '12px',
              fontSize: '12px',
              color: accent,
              fontWeight: 600,
            }}
          >
            A atualizar…
          </div>
        )}

        {loading || locationLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: MUTED, fontSize: '13px' }}>
            A carregar…
          </div>
        ) : sortedStations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: MUTED, fontSize: '13px' }}>
            Sem postos por perto.
          </div>
        ) : (
          sortedStations.map((station, index) => {
            const isCheapest = cheapestStation?.id === station.id;
            const isSelected = selectedId === station.id;
            const priceDiff = cheapestStation ? station.price - cheapestStation.price : 0;
            const diffCents = (priceDiff * 100).toFixed(1);
            const brandColor = getBrandColor(station.brand);
            const stale = isStalePrice(station.lastUpdated);

            const priceStr = station.price.toFixed(3);
            const [intPart, decPart] = priceStr.split('.');

            return (
              <div
                key={station.id}
                ref={(el) => { listRefs.current[station.id] = el; }}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(station.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(station.id);
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px 20px',
                  borderBottom: `1px solid ${HAIR}`,
                  cursor: 'pointer',
                  backgroundColor: isSelected
                    ? 'rgba(255,255,255,0.04)'
                    : isCheapest
                    ? `rgba(${hexToRgb(accent)},0.07)`
                    : SURFACE,
                  transition: 'background-color 0.1s',
                }}
              >
                {/* Main row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* Row number */}
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: HAIR,
                      width: '22px',
                      flexShrink: 0,
                      paddingTop: '2px',
                      fontFamily: "'Geist Mono', monospace",
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Station info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '3px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Brand chip */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: brandColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            backgroundColor: brandColor,
                            flexShrink: 0,
                          }}
                        />
                        {station.brand}
                      </span>
                      {isCheapest && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: accent,
                            border: `1px solid ${accent}`,
                            borderRadius: '4px',
                            padding: '1px 5px',
                            lineHeight: 1.4,
                          }}
                        >
                          Melhor preço
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: '0 0 4px',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: INK,
                        lineHeight: 1.2,
                      }}
                    >
                      {station.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: MUTED, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {station.distance.toFixed(1)} km · {formatRelativeTime(station.lastUpdated)}
                      {stale && (
                        <span
                          title="Preço com mais de 24 horas"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: STALE,
                          }}
                        >
                          · <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: STALE, display: 'inline-block' }} /> desatualizado
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: MUTED, marginRight: '1px', lineHeight: 1 }}>
                        €
                      </span>
                      <span style={{ fontSize: '22px', fontWeight: 900, color: INK, letterSpacing: '-0.5px', lineHeight: 1 }}>
                        {intPart}.
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: INK, lineHeight: 1 }}>
                        {decPart}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isCheapest ? HAIR : accent,
                        textAlign: 'right',
                      }}
                    >
                      {isCheapest ? '—' : `+${diffCents} c`}
                    </p>
                  </div>
                </div>

                {/* Navigation buttons — shown when selected */}
                {isSelected && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '14px',
                      paddingLeft: '34px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openExternal(buildWazeNavigateUrl(station.latitude, station.longitude));
                      }}
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#1FA3E0',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontFamily: FONT,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#fff', opacity: 0.7, flexShrink: 0 }} />
                      Waze
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openExternal(buildGoogleMapsDirectionsUrl(station.latitude, station.longitude));
                      }}
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: '10px',
                        border: `1.5px solid ${HAIR}`,
                        backgroundColor: BG,
                        color: INK,
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontFamily: FONT,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#1A8B3A', flexShrink: 0 }} />
                      Google Maps
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

function hexToRgb(hex: string): string {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return '255,255,255';
  return m.map((x) => parseInt(x, 16)).join(',');
}

export default BrandScreen;
