import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from '../hooks/useLocation';
import { fetchStationsByBrand, type Station } from '../services/api';
import BrandStationsMap from '../components/BrandStationsMap';
import type { SelectedStation } from '../types/selectedStation';
import { buildWazeNavigateUrl, openExternal } from '../utils/navigationLinks';

interface BrandScreenProps {
  brand: string;
  onStationSelect: (station: SelectedStation) => void;
  onBack: () => void;
}

const formatUpdated = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-PT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const BrandScreen: React.FC<BrandScreenProps> = ({ brand, onStationSelect, onBack }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { location, loading: locationLoading } = useLocation();

  useEffect(() => {
    if (!location) return;

    const loadStations = async () => {
      setLoading(true);
      const fuelType = sessionStorage.getItem('fuelType') || 'Diesel';
      const data = await fetchStationsByBrand(
        brand,
        location.latitude,
        location.longitude,
        15,
        fuelType
      );
      setStations(data);
      setLoading(false);
    };

    loadStations();
  }, [brand, location]);

  const cheapestStation = useMemo(
    () =>
      stations.length > 0
        ? stations.reduce((prev, cur) => (cur.price < prev.price ? cur : prev))
        : null,
    [stations]
  );

  const averageNearbyPrice = useMemo(() => {
    if (stations.length === 0) return undefined;
    const sum = stations.reduce((a, s) => a + s.price, 0);
    return sum / stations.length;
  }, [stations]);

  useEffect(() => {
    if (cheapestStation) setSelectedId(cheapestStation.id);
  }, [cheapestStation]);

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    const el = listRefs.current[id];
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const buildSelected = (s: Station): SelectedStation => ({
    ...s,
    averageNearbyPrice,
    savingsPerLiter:
      averageNearbyPrice !== undefined
        ? +(averageNearbyPrice - s.price).toFixed(3)
        : undefined,
  });

  const cardBase: React.CSSProperties = {
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '10px',
    border: '1px solid #eaeaea',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    touchAction: 'manipulation',
  };

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
        backgroundColor: '#f6f6f6',
      }}
    >
      {/* Map — pins only; names & distances stay in the list */}
      <div
        style={{
          flex: '0 0 50vh',
          minHeight: '240px',
          position: 'relative',
          backgroundColor: '#e8eef2',
        }}
      >
        {!loading && !locationLoading && stations.length > 0 && location ? (
          <BrandStationsMap
            stations={stations}
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
              color: '#888',
              fontSize: '14px',
            }}
          >
            {loading || locationLoading ? 'A carregar postos…' : 'Sem postos no mapa'}
          </div>
        )}

        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 500,
            width: '44px',
            height: '44px',
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          }}
        >
          ←
        </button>
      </div>

      {/* List */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          backgroundColor: '#f6f6f6',
        }}
      >
        <div
          style={{
            padding: '16px 16px 8px',
            backgroundColor: '#f6f6f6',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 800,
              margin: '0 0 4px',
              color: '#111',
              letterSpacing: '-0.02em',
            }}
          >
            {brand}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
            {stations.length} posto{stations.length !== 1 ? 's' : ''} na zona
            {cheapestStation
              ? ` · desde €${cheapestStation.price.toFixed(3)}/L`
              : ''}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 20px' }}>
          {loading || locationLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#888' }}>
              A carregar…
            </div>
          ) : stations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#888' }}>
              Sem postos {brand} por perto.
            </div>
          ) : (
            stations.map((station) => {
              const isCheapest = cheapestStation?.id === station.id;
              const isSelected = selectedId === station.id;
              return (
                <div
                  key={station.id}
                  ref={(el) => {
                    listRefs.current[station.id] = el;
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedId(station.id);
                    onStationSelect(buildSelected(station));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(station.id);
                      onStationSelect(buildSelected(station));
                    }
                  }}
                  style={{
                    ...cardBase,
                    outline: isSelected ? '2px solid #111' : 'none',
                    outlineOffset: isSelected ? '0px' : undefined,
                    borderColor: isCheapest ? '#C9A227' : '#eaeaea',
                    backgroundColor: isCheapest ? '#FFFBF0' : '#fff',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 700,
                            fontSize: '16px',
                            color: '#111',
                            lineHeight: 1.25,
                          }}
                        >
                          {station.name}
                        </p>
                        {isCheapest && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              color: '#5c4a00',
                              backgroundColor: '#FFD54F',
                              padding: '3px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            Melhor preço
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#666' }}>
                        {station.distance.toFixed(1)} km · ~{Math.max(1, Math.round(station.distance * 2))} min
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '26px',
                          fontWeight: 800,
                          color: '#111',
                          letterSpacing: '-0.03em',
                        }}
                      >
                        €{station.price.toFixed(3)}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#888' }}>/ litro</p>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#888' }}>
                    Atualizado {formatUpdated(station.lastUpdated)}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(station.id);
                      openExternal(buildWazeNavigateUrl(station.latitude, station.longitude));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      fontWeight: 700,
                      backgroundColor: '#111',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    Navegar no Waze
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandScreen;
