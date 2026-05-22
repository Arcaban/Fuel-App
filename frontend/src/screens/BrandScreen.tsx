import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from '../hooks/useLocation';
import { fetchStationsByBrand, fetchNearbyStations, type Station } from '../services/api';
import BrandStationsMap from '../components/BrandStationsMap';
import type { SelectedStation } from '../types/selectedStation';
import { PORTUGAL_FUEL_BRANDS } from '../constants/portugalBrands';
import { buildWazeNavigateUrl, buildGoogleMapsDirectionsUrl, openExternal } from '../utils/navigationLinks';

const ORANGE = '#C8541A';
const BG = '#F5F0E8';

interface BrandScreenProps {
  brand: string;
  onStationSelect: (station: SelectedStation) => void;
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
  return found?.color ?? ORANGE;
};

const BrandScreen: React.FC<BrandScreenProps> = ({ brand, onStationSelect, onBack }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'distance'>('price');
  const listRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { location, loading: locationLoading } = useLocation();

  const fuelType = sessionStorage.getItem('fuelType') || 'Gasolina 95';
  const radius = parseInt(sessionStorage.getItem('radius') || '15', 10);
  const isAll = brand === '__all__';

  useEffect(() => {
    if (!location) return;
    const loadStations = async () => {
      setLoading(true);
      const data = isAll
        ? await fetchNearbyStations(location.latitude, location.longitude, radius, fuelType)
        : await fetchStationsByBrand(brand, location.latitude, location.longitude, radius, fuelType);
      setStations(data);
      setLoading(false);
    };
    loadStations();
  }, [brand, location]);

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

  const buildSelected = (s: Station): SelectedStation => ({
    ...s,
    averageNearbyPrice,
    savingsPerLiter:
      averageNearbyPrice !== undefined
        ? +(averageNearbyPrice - s.price).toFixed(3)
        : undefined,
  });

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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          ←
        </button>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#AAA',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {sortedStations.length} postos
        </span>
        {/* Spacer to keep title centered */}
        <div style={{ width: '38px' }} />
      </div>

      {/* Title + subtitle */}
      <div style={{ padding: '4px 20px 12px', flexShrink: 0 }}>
        <h1
          style={{
            margin: '0 0 4px',
            fontSize: '28px',
            fontWeight: 900,
            color: '#111',
            letterSpacing: '-0.5px',
          }}
        >
          {screenTitle}
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
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
              border: 'none',
              backgroundColor: sortBy === mode ? '#111' : '#fff',
              color: sortBy === mode ? '#fff' : '#666',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
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
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#BBB',
              fontSize: '13px',
              backgroundColor: '#EDE8DF',
            }}
          >
            {loading || locationLoading ? 'A carregar postos…' : 'Sem postos no mapa'}
          </div>
        )}
      </div>

      {/* Station list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#fff',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          marginTop: '-12px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {loading || locationLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#BBB', fontSize: '13px' }}>
            A carregar…
          </div>
        ) : sortedStations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#BBB', fontSize: '13px' }}>
            Sem postos por perto.
          </div>
        ) : (
          sortedStations.map((station, index) => {
            const isCheapest = cheapestStation?.id === station.id;
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
                onClick={() => {
                  setSelectedId(station.id);
                }}
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
                  borderBottom: '1px solid #F0ECE4',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#FBF8F4' : '#fff',
                  transition: 'background-color 0.1s',
                }}
              >
                {/* Main row: number + info + price */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* Row number */}
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#C8C2B8',
                      width: '22px',
                      flexShrink: 0,
                      paddingTop: '2px',
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
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: brandColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {station.brand}
                      </span>
                      {isCheapest && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#AAA' }}>
                          · Melhor preço
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: '0 0 4px',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#111',
                        lineHeight: 1.2,
                      }}
                    >
                      {station.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#BBB' }}>
                      {station.distance.toFixed(1)} km · {formatRelativeTime(station.lastUpdated)}
                    </p>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#888', marginRight: '1px', lineHeight: 1 }}>
                        €
                      </span>
                      <span style={{ fontSize: '22px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px', lineHeight: 1 }}>
                        {intPart}.
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#111', lineHeight: 1 }}>
                        {decPart}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 600, color: isCheapest ? '#CCC' : ORANGE, textAlign: 'right' }}>
                      {isCheapest ? '—' : `+${diffCents} c`}
                    </p>
                  </div>
                </div>

                {/* Navigation buttons — shown when station is selected */}
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
                        backgroundColor: '#33CCFF',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
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
                        border: '1.5px solid #E8E3DA',
                        backgroundColor: '#fff',
                        color: '#111',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
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

export default BrandScreen;
