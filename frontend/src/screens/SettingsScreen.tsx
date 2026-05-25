import React, { useState } from 'react';

const BG      = '#0F1623';
const SURFACE = '#1A2333';
const INK     = '#F0F3F8';
const MUTED   = '#94A3BC';
const HAIR    = '#26314A';
const FONT    = "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const APP_VERSION = '0.5.0';

interface SettingsScreenProps {
  onBack: () => void;
  onAbout: () => void;
  onPrivacy: () => void;
  locationDenied: boolean;
}

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 3l4 4-4 4" stroke={MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      margin: '0 0 8px',
      fontSize: '11px',
      color: MUTED,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontWeight: 700,
    }}
  >
    {children}
  </p>
);

const MenuItem = ({
  label,
  subtitle,
  onPress,
  last = false,
  danger = false,
}: {
  label: string;
  subtitle?: string;
  onPress?: () => void;
  last?: boolean;
  danger?: boolean;
}) => (
  <div
    role={onPress ? 'button' : undefined}
    tabIndex={onPress ? 0 : undefined}
    onClick={onPress}
    onKeyDown={onPress ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPress(); } } : undefined}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${HAIR}`,
      cursor: onPress ? 'pointer' : 'default',
    }}
  >
    <div>
      <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: danger ? '#E05050' : INK }}>
        {label}
      </p>
      {subtitle && (
        <p style={{ margin: '2px 0 0', fontSize: '12px', color: MUTED }}>
          {subtitle}
        </p>
      )}
    </div>
    {onPress && <ChevronRight />}
  </div>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onAbout, onPrivacy, locationDenied }) => {
  const [consumption, setConsumption] = useState<number>(() =>
    parseInt(localStorage.getItem('tanq_consumption') || '7', 10)
  );

  const handleConsumption = (val: number) => {
    setConsumption(val);
    localStorage.setItem('tanq_consumption', String(val));
  };

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
        gap: '12px',
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
    </div>

    {/* Title */}
    <div style={{ padding: '4px 20px 24px', flexShrink: 0 }}>
      <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: INK, letterSpacing: '-0.5px' }}>
        Definições
      </h1>
    </div>

    {/* Content */}
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 40px' }}>

      {/* Preferences section */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>Preferências</SectionLabel>
        <div style={{ backgroundColor: SURFACE, borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 600, color: INK }}>
              Consumo do veículo
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {[5, 7, 9].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleConsumption(val)}
                  style={{
                    padding: '7px 18px',
                    borderRadius: '20px',
                    border: consumption === val ? '1.5px solid #0F8754' : `1.5px solid ${HAIR}`,
                    backgroundColor: consumption === val ? '#0F8754' : 'transparent',
                    color: consumption === val ? '#fff' : MUTED,
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: FONT,
                  }}
                >
                  {val}L
                </button>
              ))}
              <span style={{ fontSize: '12px', color: HAIR }}>/100km</span>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: HAIR }}>
              Usado para calcular a poupança real ao comparar postos.
            </p>
          </div>
        </div>
      </div>

      {/* Location section */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>Localização</SectionLabel>
        <div style={{ backgroundColor: SURFACE, borderRadius: '14px', overflow: 'hidden' }}>
          <MenuItem
            label="Estado da permissão"
            subtitle={locationDenied ? 'Negada — a usar Lisboa como padrão' : 'Permitida'}
            last
          />
        </div>
        {locationDenied && (
          <div
            style={{
              marginTop: '10px',
              padding: '12px 14px',
              backgroundColor: 'rgba(194,106,26,0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(194,106,26,0.2)',
            }}
          >
            <p style={{ margin: 0, fontSize: '13px', color: '#C26A1A', lineHeight: 1.5 }}>
              Para ativar a localização, vai a <strong>Definições do dispositivo → Aplicações → tanq. → Permissões → Localização</strong> e seleciona "Permitir apenas durante a utilização".
            </p>
          </div>
        )}
      </div>

      {/* Legal section */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>Legal</SectionLabel>
        <div style={{ backgroundColor: SURFACE, borderRadius: '14px', overflow: 'hidden' }}>
          <MenuItem
            label="Política de Privacidade"
            subtitle="RGPD · dados recolhidos e direitos"
            onPress={onPrivacy}
          />
          <MenuItem
            label="Sobre o tanq."
            subtitle="Versão, fontes de dados, marcas"
            onPress={onAbout}
            last
          />
        </div>
      </div>

      {/* Data section */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>Dados</SectionLabel>
        <div style={{ backgroundColor: SURFACE, borderRadius: '14px', overflow: 'hidden' }}>
          <MenuItem
            label="Fonte de preços"
            subtitle="DGEG — precoscombustiveis.dgeg.gov.pt"
            last
          />
        </div>
      </div>

      {/* Support section */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>Apoiar</SectionLabel>
        <div
          style={{
            backgroundColor: SURFACE,
            borderRadius: '14px',
            overflow: 'hidden',
            padding: '16px',
          }}
        >
          <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: INK }}>
            Desenvolvido por uma pessoa, para toda a gente.
          </p>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: MUTED, lineHeight: 1.6 }}>
            O tanq. é feito nas horas livres com o objetivo de se manter gratuito e sem anúncios. Se a app te é útil, qualquer contribuição ajuda a cobrir os custos do servidor e a continuar a melhorá-la.
          </p>
          <a
            href="https://paypal.me/tanqfuelapp"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              backgroundColor: '#FF5E5B',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 800,
              textAlign: 'center',
              textDecoration: 'none',
              boxSizing: 'border-box',
              letterSpacing: '-0.1px',
            }}
          >
            Apoiar via PayPal
          </a>
        </div>
      </div>

      {/* Beta disclaimer */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'rgba(148,163,188,0.07)',
          borderRadius: '10px',
          border: `1px solid ${HAIR}`,
          marginBottom: '24px',
        }}
      >
        <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: MUTED }}>
          Versão Beta
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: HAIR, lineHeight: 1.6 }}>
          O tanq. está em desenvolvimento ativo. Algumas funcionalidades estão a ser refinadas. Se encontrares algum problema, o teu feedback é muito bem-vindo em{' '}
          <span style={{ color: MUTED, fontWeight: 600 }}>tanq.fuel@gmail.com</span>.
        </p>
      </div>

      {/* App info */}
      <div style={{ textAlign: 'center', paddingTop: '4px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: HAIR }}>
          tanq. · versão {APP_VERSION} beta
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: HAIR }}>
          Dados © DGEG · Mapas © CartoDB / OpenStreetMap
        </p>
      </div>

    </div>
  </div>
  );
};

export default SettingsScreen;
