# Play Store Listing — tanq.

## App details

| Field | Value |
|-------|-------|
| **App name** | tanq. |
| **Package name** | com.tanq.app |
| **Category** | Maps & Navigation |
| **Content rating** | Everyone |
| **Target audience** | Drivers in Portugal |

---

## Store listing text

### Title (max 30 chars)
```
tanq. - Combustível Portugal
```

### Short description (max 80 chars)
```
Preços de combustível em tempo real nos postos mais próximos de ti.
```

### Full description (max 4000 chars)
```
Encontra os postos de combustível mais baratos perto de ti, em tempo real.

O tanq. consulta diretamente a plataforma oficial da Direção-Geral de Energia e Geologia (DGEG) para te mostrar os preços atualizados de Gasolina 95, Diesel e Gasolina 98 nos postos de abastecimento à tua volta.

✓ PREÇOS OFICIAIS EM TEMPO REAL
Dados fornecidos pela DGEG — a mesma fonte usada pelo governo português. Sem estimativas, sem atrasos.

✓ POSTOS ORDENADOS POR PREÇO OU DISTÂNCIA
Compara de um relance todos os postos no raio que definires (1 a 50 km). Ordena por preço para encontrar o mais barato, ou por distância para o mais próximo.

✓ MAPA INTEGRADO
Vê todos os postos num mapa. O pin laranja indica o mais barato. Toca num posto para ver detalhes e abrir diretamente no Waze ou Google Maps.

✓ TODAS AS MARCAS
Galp, Repsol, BP, Cepsa, Prio, Intermarché, Auchan, Silva & Feijão e mais. Filtra por marca ou vê todos os postos da zona.

✓ PRIVACIDADE PRIMEIRO
A tua localização é usada apenas para pesquisar postos próximos e nunca é guardada em servidores. Sem publicidade, sem rastreio.

---

Dados de preços: DGEG — precoscombustiveis.dgeg.gov.pt (dados públicos abertos)
Os nomes de marcas pertencem aos respetivos titulares.
```

---

## Required assets checklist

### Icons
- [ ] **512×512 px** — high-res app icon (PNG, no transparency)
- [ ] **Feature graphic** — 1024×500 px (PNG/JPEG) — banner shown on store page

### Screenshots (min 2, max 8 per device type)
Required sizes for **phone**:
- Minimum: 320 px on the short side
- Maximum: 3840 px on the long side
- Aspect ratio: 16:9 or 9:16

**Recommended screenshots to capture:**
1. HomeScreen — brand grid with prices (landscape of app)
2. BrandScreen — sorted station list (Mais baratos)
3. BrandScreen — map view with pins
4. BrandScreen — station expanded with Waze/Google Maps buttons
5. Onboarding screen

### Privacy policy URL
Required field in Play Store. Options:
- Host `PLAY_STORE.md` privacy section on GitHub Pages
- Or create a simple page at Railway (serve a static `/privacy` route)
- Must be publicly accessible before submission

---

## App content questionnaire (Play Console)

| Question | Answer |
|----------|--------|
| Does the app contain ads? | No |
| Does the app offer in-app purchases? | No |
| Does the app target children? | No |
| Does the app use location? | Yes — to find nearby fuel stations |
| Is location used in the background? | No — only while app is in use |
| Does the app access contacts/SMS/phone? | No |
| Does the app use a VPN service? | No |

---

## Data safety section (Play Console)

| Field | Value |
|-------|-------|
| Data collected | Location (approximate) |
| Purpose | App functionality (find nearby stations) |
| Data shared with third parties | Location coordinates sent to DGEG public API |
| Is data encrypted in transit? | Yes |
| Can users request data deletion? | Yes — revoke location permission in device settings |

---

## Steps to publish

1. Open **Play Console** → Create app → "tanq." / com.tanq.app
2. Complete store listing (title, description, screenshots, icon)
3. Set content rating → complete questionnaire
4. Fill data safety section
5. Add privacy policy URL (public link required)
6. Create release → upload the signed APK or AAB
7. Submit for review (typically 1–3 days for new apps)
