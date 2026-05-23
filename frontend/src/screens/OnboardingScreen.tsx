import React from 'react';

const BG      = '#0F1623';
const SURFACE = '#1A2333';
const INK     = '#F0F3F8';
const MUTED   = '#94A3BC';
const HAIR    = '#26314A';
const FONT    = "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

interface OnboardingScreenProps {
  onComplete: () => void;
}

const PinIllustration = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <circle cx="36" cy="36" r="36" fill={SURFACE} />
    <path
      d="M36 16C28.268 16 22 22.268 22 30c0 11.25 14 26 14 26s14-14.75 14-26c0-7.732-6.268-14-14-14Zm0 19a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
      fill="#0F8754"
    />
  </svg>
);

const FeatureRow = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px 16px',
      backgroundColor: SURFACE,
      borderRadius: '12px',
    }}
  >
    <div style={{ flexShrink: 0 }}>{icon}</div>
    <span style={{ fontSize: '14px', fontWeight: 500, color: INK, lineHeight: 1.4 }}>
      {text}
    </span>
  </div>
);

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const handleContinue = () => {
    localStorage.setItem('onboarding_complete', '1');
    onComplete();
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
        padding: '0 24px',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {/* Logo */}
        <div style={{ marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '52px',
              fontWeight: 900,
              letterSpacing: '-3px',
              margin: '0 0 8px',
              lineHeight: 1,
              color: INK,
            }}
          >
            tanq<span style={{ color: '#0F8754' }}>.</span>
          </h1>
          <p style={{ margin: 0, fontSize: '15px', color: MUTED, fontWeight: 400 }}>
            Preços de combustível em Portugal.
          </p>
        </div>

        {/* Pin illustration */}
        <div style={{ marginBottom: '32px' }}>
          <PinIllustration />
        </div>

        {/* Heading */}
        <h2
          style={{
            margin: '0 0 10px',
            fontSize: '24px',
            fontWeight: 800,
            color: INK,
            letterSpacing: '-0.3px',
            lineHeight: 1.25,
          }}
        >
          Precisamos da tua localização
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: '15px', color: MUTED, lineHeight: 1.6 }}>
          Para mostrar os postos de combustível mais próximos e os respetivos preços, o tanq. precisa de aceder à tua localização enquanto usas a app.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          <FeatureRow
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#0F8754" strokeWidth="1.5" />
                <path d="M7 10l2 2 4-4" stroke="#0F8754" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            text="Postos ordenados por preço e distância"
          />
          <FeatureRow
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#0F8754" strokeWidth="1.5" />
                <path d="M7 10l2 2 4-4" stroke="#0F8754" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            text="Preços em tempo real da DGEG"
          />
          <FeatureRow
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#0F8754" strokeWidth="1.5" />
                <path d="M7 10l2 2 4-4" stroke="#0F8754" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            text="A tua localização nunca é guardada em servidores"
          />
        </div>

        {/* Privacy note */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: SURFACE,
            borderRadius: '10px',
            borderLeft: `3px solid ${HAIR}`,
          }}
        >
          <p style={{ margin: 0, fontSize: '12px', color: MUTED, lineHeight: 1.5 }}>
            A tua localização é usada apenas para pesquisar postos próximos e não é armazenada nem partilhada com terceiros. Consulta a nossa{' '}
            <span style={{ color: INK, fontWeight: 600 }}>Política de Privacidade</span>{' '}
            nas Definições.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '16px 0 40px' }}>
        <button
          type="button"
          onClick={handleContinue}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: '#0F8754',
            color: '#fff',
            fontSize: '17px',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '-0.2px',
            fontFamily: FONT,
          }}
        >
          Permitir e continuar
        </button>
        <p
          style={{
            margin: '12px 0 0',
            textAlign: 'center',
            fontSize: '12px',
            color: MUTED,
          }}
        >
          Podes alterar esta permissão nas definições do dispositivo.
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;
