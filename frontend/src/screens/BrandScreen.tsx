import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from '../hooks/useLocation';
import { fetchStationsByBrand, fetchNearbyStations, fetchConfirmations, postConfirmation, type Station } from '../services/api';
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

// Fuel accent colors (dark theme — text, dots, badges, borders)
const FUEL_ACCENT: Record<string, string> = {
  'Gasolina 95':          '#3FB37A',
  'Diesel':               '#E08E3F',
  'Gasolina 98':          '#8FD3FF',
  'Gasolina 95 Aditivada':'#5CC48A',
  'Diesel Aditivado':     '#F0A030',
  'GPL':                  '#A78BFA',
};

// Fuel fill colors (dark theme — solid button backgrounds)
const FUEL_FILL: Record<string, string> = {
  'Gasolina 95':          '#3FB37A',
  'Diesel':               '#E08E3F',
  'Gasolina 98':          '#3FA8EE',
  'Gasolina 95 Aditivada':'#4EAA7C',
  'Diesel Aditivado':     '#E09028',
  'GPL':                  '#7C3AED',
};

const FONT = "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

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


const getBrandColor = (brandId: string): string => {
  const found = PORTUGAL_FUEL_BRANDS.find((b) => b.id === brandId);
  return found?.color ?? '#94A3BC';
};

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ThumbsUpIcon = ({ filled, color }: { filled: boolean; color: string }) => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path
      d="M1 7.5h2.5v6H1V7.5ZM5 7.5 7.5 2.5C8.2 2.5 9 3.1 9 4v2.5h4a1 1 0 0 1 1 1.2l-1.2 4.8A1 1 0 0 1 11.8 13.5H5V7.5Z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

const BrandScreen: React.FC<BrandScreenProps> = ({ brand, onBack }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'distance'>('price');
  const [confirmations, setConfirmations] = useState<Record<string, { count: number; confirmed: boolean }>>({});
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const listRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const listScrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const { location, loading: locationLoading } = useLocation();

  const deviceId = useMemo(() => {
    const key = 'tanq_device_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = Date.now().toString(36) + Math.random().toString(36).slice(2);
      localStorage.setItem(key, id);
    }
    return id;
  }, []);

  const [consumption, setConsumption] = useState<number>(() =>
    parseInt(localStorage.getItem('tanq_consumption') || '7', 10)
  );

  const getVerdict = (station: Station): { label: string; isWorth: boolean } | null => {
    if (!cheapestStation || station.id === cheapestStation.id) return null;

    const priceDiff = station.price - cheapestStation.price;

    // Tied with cheapest price
    if (priceDiff < 0.002) {
      const label = nearestCheapest && nearestCheapest.id !== station.id
        ? `Mesmo preço · vai ao mais próximo com este preço (${nearestCheapest.distance.toFixed(1)}km)`
        : 'Mesmo preço · vai ao posto mais próximo de ti';
      return { label, isWorth: false };
    }

    const centsPerLitre = (priceDiff * 100).toFixed(1);
    // Use 40L as internal benchmark for detour decision only — not shown to user
    const extraKm = Math.max(0, cheapestStation.distance - station.distance);
    const detourCost = (extraKm * consumption / 100) * cheapestStation.price;
    const netSaving = priceDiff * 40 - detourCost;

    const cheapestKm = cheapestStation.distance.toFixed(1);

    if (extraKm === 0) {
      return {
        label: `O mais barato fica mais perto (${cheapestKm}km) · ${centsPerLitre}c/L mais barato`,
        isWorth: true,
      };
    }

    if (netSaving > 0.10) {
      return {
        label: `O mais barato fica a ${cheapestKm}km · ${centsPerLitre}c/L mais barato, vale o desvio`,
        isWorth: true,
      };
    }

    if (netSaving <= 0) {
      return {
        label: `O mais barato fica a ${cheapestKm}km · ${centsPerLitre}c/L mais barato, desvio não compensa`,
        isWorth: false,
      };
    }

    return {
      label: `O mais barato fica a ${cheapestKm}km · ${centsPerLitre}c/L mais barato, não vale o desvio`,
      isWorth: false,
    };
  };

  const fuelType = sessionStorage.getItem('fuelType') || 'Gasolina 95';
  const radius = parseInt(sessionStorage.getItem('radius') || '15', 10);
  const isAll = brand === '__all__';

  const accent    = FUEL_ACCENT[fuelType] ?? '#0F8754';
  const fillColor = FUEL_FILL[fuelType]   ?? '#0F8754';

  const loadStations = async () => {
    if (!location) return;
    setFetchError(false);
    const data = isAll
      ? await fetchNearbyStations(location.latitude, location.longitude, radius, fuelType)
      : await fetchStationsByBrand(brand, location.latitude, location.longitude, radius, fuelType);
    if (data === null) {
      setFetchError(true);
      setStations([]);
    } else {
      setStations(data);
    }
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

  const nearestStation = useMemo(
    () =>
      sortedStations.length > 0
        ? sortedStations.reduce((p, c) => (c.distance < p.distance ? c : p))
        : null,
    [sortedStations]
  );

  // Among stations tied at the cheapest price, find the nearest one
  const nearestCheapest = useMemo(() => {
    if (!cheapestStation) return null;
    const tied = sortedStations.filter(s => Math.abs(s.price - cheapestStation.price) < 0.002);
    if (tied.length < 2) return null; // no tie — no need for extra badge
    return tied.reduce((p, c) => (c.distance < p.distance ? c : p));
  }, [sortedStations, cheapestStation]);

  // When sorting by price, pin the nearest station to slot #2 so it's always visible below the cheapest
  const displayStations = useMemo(() => {
    if (sortBy === 'distance' || !nearestStation || nearestStation.id === cheapestStation?.id) {
      return sortedStations;
    }
    const nearestIdx = sortedStations.findIndex(s => s.id === nearestStation.id);
    if (nearestIdx <= 1) return sortedStations;
    const result = [...sortedStations];
    result.splice(nearestIdx, 1);
    result.splice(1, 0, sortedStations[nearestIdx]);
    return result;
  }, [sortedStations, sortBy, nearestStation, cheapestStation]);

  const averageNearbyPrice = useMemo(() => {
    if (sortedStations.length === 0) return undefined;
    return sortedStations.reduce((a, s) => a + s.price, 0) / sortedStations.length;
  }, [sortedStations]);


  useEffect(() => {
    if (cheapestStation) setSelectedId(cheapestStation.id);
  }, [cheapestStation]);

  // Fetch confirmation count when a station is expanded (lazy — only once per station)
  useEffect(() => {
    if (!selectedId || confirmations[selectedId] !== undefined) return;
    fetchConfirmations(selectedId, deviceId).then((data) => {
      setConfirmations((prev) => ({ ...prev, [selectedId]: data }));
    });
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = async (e: React.MouseEvent, stationId: string) => {
    e.stopPropagation();
    if (confirmations[stationId]?.confirmed || confirmingId === stationId) return;
    setConfirmingId(stationId);
    // Optimistic update
    setConfirmations((prev) => ({
      ...prev,
      [stationId]: { count: (prev[stationId]?.count ?? 0) + 1, confirmed: true },
    }));
    const result = await postConfirmation(stationId, deviceId);
    setConfirmations((prev) => ({ ...prev, [stationId]: result }));
    setConfirmingId(null);
  };

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
      <div style={{ flex: '0 0 20vh', minHeight: '140px', position: 'relative', flexShrink: 0 }}>
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
        ) : fetchError ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: INK }}>
              Sem ligação ao servidor
            </p>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: MUTED }}>
              Verifica a ligação à internet e tenta novamente.
            </p>
            <button
              type="button"
              onClick={() => { setLoading(true); loadStations().then(() => setLoading(false)); }}
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                border: `1.5px solid ${accent}`,
                backgroundColor: 'transparent',
                color: accent,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: FONT,
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : sortedStations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: INK }}>
              Sem postos neste raio
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>
              Volta atrás e aumenta o raio de pesquisa.
            </p>
          </div>
        ) : (
          displayStations.map((station, index) => {
            const isCheapest = cheapestStation?.id === station.id;
            const isNearest = nearestStation?.id === station.id;
            const isNearestCheapest = nearestCheapest?.id === station.id;
            const isSelected = selectedId === station.id;
            const priceDiff = cheapestStation ? station.price - cheapestStation.price : 0;
            const diffCents = (priceDiff * 100).toFixed(1);
            const brandColor = getBrandColor(station.brand);

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
                      color: MUTED,
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
                      {isNearestCheapest && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#60A5FA',
                            border: '1px solid #60A5FA',
                            borderRadius: '4px',
                            padding: '1px 5px',
                            lineHeight: 1.4,
                          }}
                        >
                          Mais próximo
                        </span>
                      )}
                      {isNearest && !isCheapest && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#60A5FA',
                            border: '1px solid #60A5FA',
                            borderRadius: '4px',
                            padding: '1px 5px',
                            lineHeight: 1.4,
                          }}
                        >
                          Mais perto
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
                    <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>
                      {station.distance.toFixed(1)} km
                    </p>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isCheapest ? accent : MUTED, marginRight: '1px', lineHeight: 1 }}>
                        €
                      </span>
                      <span style={{ fontSize: '28px', fontWeight: 900, color: isCheapest ? accent : INK, letterSpacing: '-1px', lineHeight: 1 }}>
                        {intPart}.
                      </span>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: isCheapest ? accent : INK, lineHeight: 1 }}>
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

                {/* Navigation + confirmation — shown when selected */}
                {isSelected && (() => {
                  const conf = confirmations[station.id];
                  const isConfirmed = conf?.confirmed ?? false;
                  const confirmCount = conf?.count ?? 0;
                  return (
                    <div style={{ paddingLeft: '34px' }}>
                      {/* Nav row */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
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

                      {/* Net savings verdict */}
                      {(() => {
                        const verdict = getVerdict(station);
                        if (!verdict) return null;
                        return (
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '9px 14px',
                              borderRadius: '10px',
                              border: `1.5px solid ${verdict.isWorth ? accent : HAIR}`,
                              backgroundColor: verdict.isWorth ? `rgba(${hexToRgb(accent)},0.08)` : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span style={{ fontSize: '11px' }}>{verdict.isWorth ? '⚡' : '📍'}</span>
                            <span style={{ fontSize: '12px', color: verdict.isWorth ? accent : MUTED, fontWeight: 600 }}>
                              {verdict.label}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Confirmation row */}
                      <button
                        type="button"
                        onClick={(e) => handleConfirm(e, station.id)}
                        disabled={isConfirmed}
                        style={{
                          marginTop: '8px',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          padding: '9px 14px',
                          borderRadius: '10px',
                          border: `1.5px solid ${isConfirmed ? accent : HAIR}`,
                          backgroundColor: isConfirmed ? `rgba(${hexToRgb(accent)},0.08)` : 'transparent',
                          color: isConfirmed ? accent : MUTED,
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: isConfirmed ? 'default' : 'pointer',
                          fontFamily: FONT,
                          boxSizing: 'border-box',
                        }}
                      >
                        <ThumbsUpIcon filled={isConfirmed} color={isConfirmed ? accent : MUTED} />
                        {isConfirmed ? 'Confirmado' : 'Confirmar preço'}
                        {confirmCount > 0 && (
                          <span style={{ marginLeft: 'auto', fontSize: '12px', color: MUTED, fontWeight: 400 }}>
                            {confirmCount} {confirmCount === 1 ? 'pessoa' : 'pessoas'}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })()}
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
