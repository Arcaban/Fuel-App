import React, { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Station } from '../services/api';

export interface BrandStationsMapProps {
  stations: Station[];
  userLat: number;
  userLng: number;
  cheapestId: string | null;
  selectedId: string | null;
  onStationMarkerClick: (stationId: string) => void;
}

function FitBounds({
  stations,
  userLat,
  userLng,
}: {
  stations: Station[];
  userLat: number;
  userLng: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (stations.length === 0) {
      map.setView([userLat, userLng], 13);
      return;
    }
    const bounds = L.latLngBounds(
      stations.map((s) => [s.latitude, s.longitude] as [number, number])
    );
    bounds.extend([userLat, userLng]);
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
  }, [map, stations, userLat, userLng]);

  return null;
}

function FlyToSelected({
  selectedId,
  stations,
}: {
  selectedId: string | null;
  stations: Station[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const s = stations.find((x) => x.id === selectedId);
    if (!s) return;
    const z = Math.max(map.getZoom(), 15);
    map.flyTo([s.latitude, s.longitude], z, { duration: 0.35 });
  }, [map, selectedId, stations]);

  return null;
}

const BrandStationsMap: React.FC<BrandStationsMapProps> = ({
  stations,
  userLat,
  userLng,
  cheapestId,
  selectedId,
  onStationMarkerClick,
}) => {
  const center = useMemo<[number, number]>(
    () => [userLat, userLng],
    [userLat, userLng]
  );

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      scrollWheelZoom
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds stations={stations} userLat={userLat} userLng={userLng} />
      <FlyToSelected selectedId={selectedId} stations={stations} />

      <CircleMarker
        center={[userLat, userLng]}
        radius={6}
        pathOptions={{
          color: '#111',
          weight: 2,
          fillColor: '#4285F4',
          fillOpacity: 0.95,
        }}
      />

      {stations.map((s) => {
        const isCheapest = cheapestId === s.id;
        const isSelected = selectedId === s.id;
        const radius = isCheapest ? 10 : 7;
        return (
          <CircleMarker
            key={s.id}
            center={[s.latitude, s.longitude]}
            radius={radius}
            pathOptions={{
              color: isSelected ? '#111' : isCheapest ? '#B8860B' : '#555',
              weight: isSelected ? 3 : isCheapest ? 2.5 : 1.5,
              fillColor: isCheapest ? '#FFD54F' : isSelected ? '#90CAF9' : '#fff',
              fillOpacity: 0.95,
            }}
            eventHandlers={{
              click: () => onStationMarkerClick(s.id),
            }}
          />
        );
      })}
    </MapContainer>
  );
};

export default BrandStationsMap;
