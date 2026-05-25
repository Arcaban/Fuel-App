import { Application, Request, Response } from 'express';
import { getNearby, getByBrand, getStation } from '../controllers/stationController';
import { getBrandPricesByLocation } from '../controllers/priceController';
import { getTrends } from '../controllers/statsController';
import { getConfirmations, addConfirmation } from '../controllers/confirmationController';

const PRIVACY_HTML = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Política de Privacidade — tanq.</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; color: #1a1a1a; line-height: 1.7; }
    h1 { font-size: 28px; margin-bottom: 4px; }
    h2 { font-size: 18px; margin-top: 36px; margin-bottom: 8px; }
    p, li { font-size: 15px; color: #333; }
    ul { padding-left: 20px; }
    a { color: #1a73e8; }
    .meta { color: #666; font-size: 14px; margin-bottom: 40px; }
    hr { border: none; border-top: 1px solid #e0e0e0; margin: 40px 0; }
  </style>
</head>
<body>
  <h1>Política de Privacidade</h1>
  <p class="meta">Aplicação: <strong>tanq.</strong> &nbsp;|&nbsp; Última atualização: 23 de maio de 2026</p>

  <h2>1. Responsável pelo tratamento</h2>
  <p>O responsável pelo tratamento dos dados pessoais recolhidos através da aplicação <strong>tanq.</strong> é Ricardo Arcaban, contactável através do endereço de e‑mail <a href="mailto:tanq.fuel@gmail.com">tanq.fuel@gmail.com</a>.</p>

  <h2>2. Dados recolhidos</h2>
  <p>A aplicação tanq. recolhe exclusivamente a <strong>localização geográfica aproximada</strong> do dispositivo, com o único propósito de pesquisar postos de combustível nas proximidades do utilizador.</p>
  <ul>
    <li>A localização é solicitada apenas enquanto a aplicação está em utilização ativa.</li>
    <li>A localização <strong>não é recolhida em segundo plano</strong>.</li>
    <li>Não são recolhidos dados de identificação pessoal, histórico de navegação, contactos, mensagens ou qualquer outra categoria de dados sensíveis.</li>
  </ul>

  <h2>3. Base jurídica do tratamento</h2>
  <p>O tratamento dos dados de localização baseia‑se no <strong>consentimento explícito</strong> do utilizador, nos termos do artigo 6.º, n.º 1, alínea a) do Regulamento (UE) 2016/679 (RGPD) e da Lei n.º 58/2019. O utilizador pode revogar o consentimento em qualquer momento através das definições do dispositivo.</p>

  <h2>4. Armazenamento e retenção</h2>
  <p>A localização do utilizador <strong>não é armazenada em servidores</strong>. As coordenadas são transmitidas diretamente à API pública da Direção‑Geral de Energia e Geologia (DGEG) para obter os preços dos postos próximos, sendo descartadas imediatamente após a resposta.</p>

  <h2>5. Partilha de dados com terceiros</h2>
  <p>As coordenadas de localização são enviadas à <strong>DGEG</strong> (precoscombustiveis.dgeg.gov.pt), entidade pública portuguesa, exclusivamente para consulta dos preços de combustível. Não são partilhados dados com quaisquer outras entidades terceiras, redes de publicidade ou plataformas de análise.</p>

  <h2>6. Segurança</h2>
  <p>Todas as comunicações entre a aplicação e os servidores são efetuadas através de <strong>HTTPS</strong>, garantindo a cifragem dos dados em trânsito.</p>

  <h2>7. Direitos do utilizador</h2>
  <p>Nos termos do RGPD, o utilizador tem o direito de:</p>
  <ul>
    <li>Aceder aos seus dados pessoais;</li>
    <li>Solicitar a retificação ou eliminação;</li>
    <li>Opor‑se ao tratamento;</li>
    <li>Solicitar a portabilidade dos dados.</li>
  </ul>
  <p>Como a aplicação não armazena dados em servidor, o exercício prático destes direitos consiste em <strong>revogar a permissão de localização</strong> nas definições do dispositivo Android.</p>

  <h2>8. Direito de reclamação</h2>
  <p>O utilizador tem o direito de apresentar reclamação à autoridade de controlo competente em Portugal: <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong> — <a href="https://www.cnpd.pt" target="_blank">www.cnpd.pt</a>.</p>

  <h2>9. Menores</h2>
  <p>A aplicação tanq. não se destina a menores de 16 anos e não recolhe intencionalmente dados de menores.</p>

  <h2>10. Contacto</h2>
  <p>Para qualquer questão relacionada com privacidade ou proteção de dados, contacte: <a href="mailto:tanq.fuel@gmail.com">tanq.fuel@gmail.com</a></p>

  <hr />
  <p style="font-size:13px;color:#999;">tanq. &copy; 2026 &nbsp;|&nbsp; Dados de preços: DGEG — precoscombustiveis.dgeg.gov.pt (dados públicos abertos)</p>
</body>
</html>`;

export const setRoutes = (app: Application): void => {
    // Health check
    app.get('/', (_req: Request, res: Response) => {
        res.json({ status: 'ok', message: 'Fuel decision routing assistant API' });
    });

    // Privacy policy (required for Play Store)
    app.get('/privacy', (_req: Request, res: Response) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(PRIVACY_HTML);
    });

    // Stats / price trends (active only when DATABASE_URL is set)
    app.get('/api/stats/trends', getTrends);

    // Station endpoints
    app.get('/api/stations/nearby', getNearby);
    app.get('/api/stations/brand/:brand', getByBrand);
    app.get('/api/stations/:id/confirmations', getConfirmations);
    app.post('/api/stations/:id/confirm', addConfirmation);
    app.get('/api/stations/:id', getStation);

    // Price endpoints
    app.get('/api/prices/brands', getBrandPricesByLocation);
};