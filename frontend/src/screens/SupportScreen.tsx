import React from 'react';

const BG      = '#0F1623';
const SURFACE = '#1A2333';
const INK     = '#F0F3F8';
const MUTED   = '#94A3BC';
const HAIR    = '#26314A';
const FONT    = "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

interface SupportScreenProps {
  onBack: () => void;
}

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SupportScreen: React.FC<SupportScreenProps> = ({ onBack }) => (
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
    <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 8px', flexShrink: 0 }}>
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

    {/* Content */}
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 40px' }}>

      {/* Heart */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 27S3 19 3 11a6 6 0 0 1 11-3.3A6 6 0 0 1 29 11C29 19 16 27 16 27Z" fill="#EF4444" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 900, color: INK, letterSpacing: '-0.5px', textAlign: 'center' }}>
        Apoiar o tanq<span style={{ color: '#EF4444' }}>.</span>
      </h1>
      <p style={{ margin: '0 0 32px', fontSize: '14px', color: MUTED, textAlign: 'center', lineHeight: 1.5 }}>
        Desenvolvido por uma pessoa, para toda a gente.
      </p>

      {/* Message card */}
      <div
        style={{
          backgroundColor: SURFACE,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <p style={{ margin: '0 0 12px', fontSize: '15px', color: INK, lineHeight: 1.7 }}>
          O tanq. é feito nas horas livres com um objetivo simples: <strong>manter a app gratuita e sem anúncios</strong> para sempre.
        </p>
        <p style={{ margin: '0 0 12px', fontSize: '15px', color: INK, lineHeight: 1.7 }}>
          Se a app te poupar dinheiro no combustível, considera retribuir com o valor de um café. Ajuda a cobrir os custos do servidor e motiva a continuar a melhorá-la.
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: MUTED, lineHeight: 1.6 }}>
          Qualquer contribuição, por menor que seja, faz diferença. Obrigado 🙏
        </p>
      </div>

      {/* PayPal button */}
      <a
        href="https://paypal.me/tanqfuelapp"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          width: '100%',
          padding: '16px',
          borderRadius: '14px',
          backgroundColor: '#0070BA',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 800,
          textAlign: 'center',
          textDecoration: 'none',
          boxSizing: 'border-box',
          letterSpacing: '-0.2px',
        }}
      >
        Apoiar via PayPal
      </a>

      <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: '12px', color: HAIR }}>
        Paga com cartão, PayPal ou conta bancária · seguro e sem comissões para mim
      </p>

    </div>
  </div>
);

export default SupportScreen;
