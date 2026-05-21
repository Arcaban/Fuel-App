import React from 'react';
import type { SelectedStation } from '../types/selectedStation';
import {
  buildGoogleMapsDirectionsUrl,
  buildWazeNavigateUrl,
  openExternal,
} from '../utils/navigationLinks';

interface NavigationHandoffProps {
  station: SelectedStation;
  savings: string;
  onBack: () => void;
}

const NavigationHandoff: React.FC<NavigationHandoffProps> = ({
  station,
  savings,
  onBack,
}) => {
  const wazeUrl = buildWazeNavigateUrl(station.latitude, station.longitude);
  const mapsUrl = buildGoogleMapsDirectionsUrl(station.latitude, station.longitude);

  return (
    <div
      style={{
        padding: '16px',
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
      <button
        type="button"
        onClick={onBack}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 14px',
          marginBottom: '16px',
          backgroundColor: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        ← Voltar
      </button>

      <h2
        style={{
          fontSize: '22px',
          fontWeight: 800,
          margin: '0 0 20px',
          textAlign: 'center',
          color: '#111',
          lineHeight: 1.25,
        }}
      >
        {station.name}
      </h2>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '24px 20px',
          marginBottom: '20px',
          textAlign: 'center',
          flex: 1,
          border: '1px solid #eaeaea',
        }}
      >
        <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#666' }}>Poupança estimada</p>
        <p style={{ margin: '0 0 16px', fontSize: '38px', fontWeight: 800, color: '#0d7a3e' }}>
          {savings}
        </p>
        <p style={{ margin: 0, fontSize: '15px', color: '#555' }}>
          {station.distance.toFixed(1)} km · ~{Math.max(1, Math.round(station.distance * 2))} min
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={() => openExternal(wazeUrl)}
          style={{
            padding: '14px',
            fontSize: '15px',
            fontWeight: 800,
            backgroundColor: '#33CCFF',
            color: '#111',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          Waze
        </button>
        <button
          type="button"
          onClick={() => openExternal(mapsUrl)}
          style={{
            padding: '14px',
            fontSize: '15px',
            fontWeight: 700,
            backgroundColor: '#fff',
            color: '#111',
            border: '2px solid #ddd',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          Maps
        </button>
      </div>

      <button
        type="button"
        onClick={onBack}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '14px',
          fontWeight: 700,
          backgroundColor: 'transparent',
          color: '#111',
          border: '2px solid #ccc',
          borderRadius: '10px',
          cursor: 'pointer',
        }}
      >
        Fechar
      </button>
    </div>
  );
};

export default NavigationHandoff;
