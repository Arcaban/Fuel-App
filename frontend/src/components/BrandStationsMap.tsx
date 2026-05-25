import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Station } from '../services/api';

const DEFAULT_ACCENT = '#0F8754';

export interface BrandStationsMapProps {
  stations: Station[];
  userLat: number;
  userLng: number;
  cheapestId: string | null;
  selectedId: string | null;
  onStationMarkerClick: (stationId: string) => void;
  accentColor?: string;
}

const createNumberedIcon = (num: number, isSelected: boolean, accent: string) => {
  const bg = isSelected ? accent : '#1A2333';
  const color = isSelected ? '#FFFFFF' : '#94A3BC';
  const border = isSelected ? accent : '#26314A';
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${bg};color:${color};text-align:center;line-height:24px;font-size:10px;font-weight:800;font-family:-apple-system,BlinkMacSystemFont,sans-serif;border:2px solid ${border};box-shadow:0 2px 8px rgba(0,0,0,0.4);box-sizing:border-box;">${String(num).padStart(2, '0')}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const makeAquiIcon = (accent: string) =>
  L.divIcon({
    html: `<div style="background:${accent};color:#fff;padding:5px 11px;border-radius:14px;font-size:12px;font-weight:800;font-family:-apple-system,BlinkMacSystemFont,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.35);">Aqui</div>`,
    className: '',
    iconSize: [50, 28],
    iconAnchor: [25, 14],
  });

function FitBounds({ stations, userLat, userLng }: { stations: Station[]; userLat: number; userLng: number }) {
  const map = useMap();
  useEffect(() => {
    if (stations.length === 0) {
      map.setView([userLat, userLng], 13);
      return;
    }
    const bounds = L.latLngBounds(stations.map((s) => [s.latitude, s.longitude] as [number, number]));
    bounds.extend([userLat, userLng]);
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
  }, [map, stations, userLat, userLng]);
  return null;
}

function FlyToSelected({ selectedId, stations }: { selectedId: string | null; stations: Station[] }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const s = stations.find((x) => x.id === selectedId);
    if (!s) return;
    map.flyTo([s.latitude, s.longitude], Math.max(map.getZoom(), 15), { duration: 0.35 });
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
  accentColor = DEFAULT_ACCENT,
}) => {
  const center = useMemo<[number, number]>(() => [userLat, userLng], [userLat, userLng]);
  const aquiIcon = useMemo(() => makeAquiIcon(accentColor), [accentColor]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      scrollWheelZoom
      attributionControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
        subdomains="abcd"
      />
      <FitBounds stations={stations} userLat={userLat} userLng={userLng} />
      <FlyToSelected selectedId={selectedId} stations={stations} />

      <Marker position={[userLat, userLng]} icon={aquiIcon} />

      {stations.map((s, index) => {
        const isSelected = selectedId === s.id || cheapestId === s.id;
        return (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude]}
            icon={createNumberedIcon(index + 1, isSelected, accentColor)}
            eventHandlers={{ click: () => onStationMarkerClick(s.id) }}
          />
        );
      })}
    </MapContainer>
  );
};

export default BrandStationsMap;
