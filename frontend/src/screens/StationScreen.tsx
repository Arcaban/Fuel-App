import React from 'react';
import type { SelectedStation } from '../types/selectedStation';
import {
  buildGoogleMapsDirectionsUrl,
  buildWazeNavigateUrl,
  openExternal,
} from '../utils/navigationLinks';

interface StationScreenProps {
  station: SelectedStation;
  onNavigate: () => void;
  onBack: () => void;
}

const formatUpdated = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('pt-PT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const StationScreen: React.FC<StationScreenProps> = ({
  station,
  onNavigate,
  onBack,
}) => {
  const wazeUrl = buildWazeNavigateUrl(station.latitude, station.longitude);
  const mapsUrl = buildGoogleMapsDirectionsUrl(station.latitude, station.longitude);
  const savings = station.savingsPerLiter;
  const hasSavings =
    savings !== undefined && savings !== null && Math.abs(savings) >= 0.0005;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        boxSizing: 'border-box',
        padding: '16px 16px 28px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f6f6f6',
        fontFamily: 'inherit',
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
          color: '#111',
        }}
      >
        ← Voltar
      </button>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '18px',
          padding: '22px 20px 20px',
          border: '1px solid #eaeaea',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          marginBottom: '14px',
        }}
      >
        <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Preço atual
        </p>
        <p
          style={{
            margin: '0 0 16px',
            fontSize: '42px',
            fontWeight: 800,
            color: '#111',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          €{station.price.toFixed(3)}
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#666' }}> / L</span>
        </p>

        <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#111', lineHeight: 1.3 }}>
          {station.name}
        </p>
        <p style={{ margin: 0, fontSize: '15px', color: '#555', fontWeight: 600 }}>
          {station.brand}
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '16px 18px',
          border: '1px solid #eaeaea',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #f0f0f0', marginBottom: '14px' }}>
          <span style={{ color: '#777', fontSize: '14px' }}>Distância</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>
            {station.distance.toFixed(1)} km
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #f0f0f0', marginBottom: '14px' }}>
          <span style={{ color: '#777', fontSize: '14px' }}>Tempo estimado</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>
            ~{Math.max(1, Math.round(station.distance * 2))} min
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #f0f0f0', marginBottom: '14px' }}>
          <span style={{ color: '#777', fontSize: '14px' }}>Atualizado</span>
          <span style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>
            {formatUpdated(station.lastUpdated)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#777', fontSize: '14px' }}>vs. média ({station.brand})</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '15px',
              color: hasSavings && savings! > 0 ? '#0d7a3e' : hasSavings && savings! < 0 ? '#b00020' : '#111',
            }}
          >
            {hasSavings
              ? savings! > 0
                ? `−€${savings!.toFixed(3)}/L`
                : `+€${Math.abs(savings!).toFixed(3)}/L`
              : '—'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          onClick={() => {
            openExternal(wazeUrl);
          }}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '17px',
            fontWeight: 800,
            backgroundColor: '#33CCFF',
            color: '#111',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(51,204,255,0.35)',
          }}
        >
          Abrir no Waze
        </button>
        <button
          type="button"
          onClick={() => openExternal(mapsUrl)}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            fontWeight: 700,
            backgroundColor: '#fff',
            color: '#111',
            border: '2px solid #ddd',
            borderRadius: '14px',
            cursor: 'pointer',
          }}
        >
          Google Maps
        </button>
        <button
          type="button"
          onClick={onNavigate}
          style={{
            marginTop: '4px',
            padding: '10px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#555',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Ver resumo da poupança
        </button>
      </div>
    </div>
  );
};

export default StationScreen;
