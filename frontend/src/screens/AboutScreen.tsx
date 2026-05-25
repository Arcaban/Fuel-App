import React from 'react';

const BG      = '#0F1623';
const SURFACE = '#1A2333';
const INK     = '#F0F3F8';
const MUTED   = '#94A3BC';
const HAIR    = '#26314A';
const FONT    = "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const APP_VERSION = '0.5.0';

interface AboutScreenProps {
  onBack: () => void;
}

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '28px' }}>
    <p
      style={{
        margin: '0 0 10px',
        fontSize: '11px',
        color: MUTED,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontWeight: 700,
      }}
    >
      {title}
    </p>
    <div
      style={{
        backgroundColor: SURFACE,
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  </div>
);

const Row = ({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => (
  <div
    style={{
      padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${HAIR}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px',
    }}
  >
    <span style={{ fontSize: '14px', color: MUTED, fontWeight: 500, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: '14px', color: INK, fontWeight: 600, textAlign: 'right' }}>{value}</span>
  </div>
);

const TextBlock = ({ text, last = false }: { text: string; last?: boolean }) => (
  <div
    style={{
      padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${HAIR}`,
    }}
  >
    <p style={{ margin: 0, fontSize: '14px', color: INK, lineHeight: 1.6 }}>{text}</p>
  </div>
);

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => (
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
      <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 900, color: INK, letterSpacing: '-0.5px' }}>
        Sobre o tanq<span style={{ color: '#0F8754' }}>.</span>
      </h1>
      <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>
        Versão {APP_VERSION}
      </p>
    </div>

    {/* Scrollable content */}
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px' }}>

      <Section title="A aplicação">
        <TextBlock
          text="O tanq. mostra os preços de combustível em tempo real nos postos de abastecimento mais próximos de ti em Portugal Continental e Ilhas."
        />
        <TextBlock
          text="Os preços são fornecidos pela Direção-Geral de Energia e Geologia (DGEG) através da plataforma pública precoscombustiveis.dgeg.gov.pt."
          last
        />
      </Section>

      <Section title="Fonte de dados">
        <Row label="Fornecedor" value="DGEG – Direção-Geral de Energia e Geologia" />
        <Row label="Portal" value="precoscombustiveis.dgeg.gov.pt" />
        <Row label="Tipo de dados" value="Dados públicos abertos" last />
      </Section>

      <Section title="Marcas e insígnias">
        <TextBlock
          text="Os nomes e logótipos das marcas de combustível apresentados na aplicação (Galp, Repsol, BP, Cepsa, Prio, Intermarché, Auchan, Silva & Feijão e outras) são propriedade dos respetivos titulares. O tanq. não tem qualquer afiliação, patrocínio ou relação comercial com estas marcas. Os nomes são usados exclusivamente para identificar os postos de abastecimento reportados na plataforma pública da DGEG."
          last
        />
      </Section>

      <Section title="Aplicação">
        <Row label="Versão" value={APP_VERSION} />
        <Row label="Plataforma" value="Android (via Capacitor)" />
        <Row label="Dados de mapa" value="© CartoDB / OpenStreetMap" last />
      </Section>

      <Section title="Contacto">
        <TextBlock text="Para questões, sugestões ou problemas com a aplicação, entra em contacto através de tanq.fuel@gmail.com." last />
      </Section>

    </div>
  </div>
);

export default AboutScreen;
