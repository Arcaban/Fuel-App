import React from 'react';

const BG      = '#0F1623';
const SURFACE = '#1A2333';
const INK     = '#F0F3F8';
const MUTED   = '#94A3BC';
const HAIR    = '#26314A';
const FONT    = "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      margin: '28px 0 10px',
      fontSize: '15px',
      fontWeight: 800,
      color: INK,
      letterSpacing: '-0.1px',
    }}
  >
    {children}
  </h2>
);

const Body = ({ children }: { children: React.ReactNode }) => (
  <p style={{ margin: '0 0 12px', fontSize: '14px', color: MUTED, lineHeight: 1.7 }}>
    {children}
  </p>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: INK, fontWeight: 600 }}>{children}</span>
);

const InfoCard = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      backgroundColor: SURFACE,
      borderRadius: '12px',
      padding: '14px 16px',
      marginBottom: '16px',
      borderLeft: `3px solid ${HAIR}`,
    }}
  >
    <p style={{ margin: 0, fontSize: '13px', color: MUTED, lineHeight: 1.6 }}>{children}</p>
  </div>
);

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => (
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
    <div style={{ padding: '4px 20px 8px', flexShrink: 0 }}>
      <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 900, color: INK, letterSpacing: '-0.5px' }}>
        Privacidade
      </h1>
      <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>
        Última atualização: maio de 2026
      </p>
    </div>

    {/* Scrollable content */}
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 40px' }}>

      <InfoCard>
        Resumo: o tanq. acede à tua localização para mostrar postos próximos. <Highlight>Não guardamos, vendemos nem partilhamos os teus dados pessoais.</Highlight>
      </InfoCard>

      <SectionHeading>1. Responsável pelo tratamento</SectionHeading>
      <Body>
        O responsável pelo tratamento dos dados pessoais recolhidos pela aplicação tanq. é o seu desenvolvedor individual, contactável através de <Highlight>suporte@tanq.app</Highlight>.
      </Body>

      <SectionHeading>2. Dados recolhidos</SectionHeading>
      <Body>
        A aplicação acede à <Highlight>localização aproximada do teu dispositivo</Highlight> (latitude e longitude) durante a utilização ativa da app. Não recolhemos nome, endereço de email, número de telefone, identificadores de dispositivo nem quaisquer outros dados pessoais.
      </Body>
      <Body>
        Não utilizamos cookies, trackers analíticos, SDKs de publicidade nem serviços de telemetria de terceiros.
      </Body>

      <SectionHeading>3. Finalidade e base legal</SectionHeading>
      <Body>
        A localização é utilizada <Highlight>exclusivamente</Highlight> para pesquisar postos de combustível próximos e apresentar os respetivos preços, consultados em tempo real na plataforma pública da DGEG (precoscombustiveis.dgeg.gov.pt).
      </Body>
      <Body>
        Base legal: consentimento do utilizador, nos termos do art.º 6.º, n.º 1, al. a) do Regulamento (UE) 2016/679 (RGPD) e da Lei n.º 58/2019, de 8 de agosto.
      </Body>

      <SectionHeading>4. Armazenamento e retenção</SectionHeading>
      <Body>
        A tua localização é processada <Highlight>localmente no dispositivo</Highlight> e enviada diretamente ao servidor da DGEG para pesquisa de postos. Não é armazenada em servidores próprios da aplicação. As preferências de combustível e raio de pesquisa são guardadas localmente no dispositivo (sessionStorage) e eliminadas ao fechar a aplicação.
      </Body>

      <SectionHeading>5. Partilha de dados</SectionHeading>
      <Body>
        Os dados de localização são transmitidos à DGEG (entidade pública portuguesa) unicamente para obter a listagem de postos próximos. A DGEG é responsável pelo tratamento dos dados que recebe no âmbito da sua plataforma pública. Não partilhamos os teus dados com quaisquer outras entidades terceiras.
      </Body>

      <SectionHeading>6. Os teus direitos</SectionHeading>
      <Body>
        Ao abrigo do RGPD tens direito a: <Highlight>acesso, retificação, apagamento, limitação do tratamento, portabilidade e oposição</Highlight> relativamente aos teus dados pessoais. Uma vez que não armazenamos dados de localização, podes exercer estes direitos revogando a permissão de localização nas definições do teu dispositivo Android.
      </Body>
      <Body>
        Tens também o direito de apresentar reclamação à <Highlight>CNPD – Comissão Nacional de Proteção de Dados</Highlight> (cnpd.pt) se considerares que o tratamento dos teus dados viola o RGPD.
      </Body>

      <SectionHeading>7. Permissão de localização</SectionHeading>
      <Body>
        A permissão de localização é solicitada na primeira utilização e pode ser revogada a qualquer momento em <Highlight>Definições do dispositivo → Aplicações → tanq. → Permissões → Localização</Highlight>. Se a permissão for negada, a aplicação utilizará Lisboa como localização padrão.
      </Body>

      <SectionHeading>8. Menores</SectionHeading>
      <Body>
        A aplicação não é direcionada a menores de 16 anos nem recolhe dados de menores de forma intencional.
      </Body>

      <SectionHeading>9. Alterações a esta política</SectionHeading>
      <Body>
        Qualquer alteração relevante a esta política será refletida nesta secção com a data de atualização. Recomendamos que a consultes periodicamente.
      </Body>

      <SectionHeading>10. Contacto</SectionHeading>
      <Body>
        Para questões relacionadas com privacidade, contacta-nos em <Highlight>suporte@tanq.app</Highlight>.
      </Body>

    </div>
  </div>
);

export default PrivacyPolicyScreen;
