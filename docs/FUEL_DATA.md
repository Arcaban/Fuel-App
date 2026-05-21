# Fuel price data sources (Portugal)

## Recommended: DGEG (default)

**Source:** [precoscombustiveis.dgeg.gov.pt](https://precoscombustiveis.dgeg.gov.pt/)  
**Authority:** Direção-Geral de Energia e Geologia (DGEG)

Portuguese fuel stations are **legally required** to report price changes to DGEG. This is the most accurate source for Portugal.

| Aspect | Detail |
|--------|--------|
| Coverage | ~3,300 stations nationwide |
| Update frequency | When stations change prices (typically daily) |
| Cost | Free, public API |
| Fuel types | Gasóleo simples, Gasóleo especial, Gasolina 95/98, GPL Auto, GNC |

### API endpoints used

- `PesquisarPostos?idDistrito={id}` — station list with coordinates (cached 1h per district)
- `GetDadosPosto?id={stationId}` — full prices per fuel type (cached 15min per station)

### Configuration

```env
FUEL_DATA_PROVIDER=dgeg
DGEG_MAX_STATIONS=40
```

Set `FUEL_DATA_PROVIDER=mock` to use local test data without calling DGEG.

**Note:** First load near your location may take 10–20 seconds while station prices are fetched from DGEG.

---

## Alternatives (not integrated)

| Provider | Pros | Cons |
|----------|------|------|
| [precoscombustiveis.pt](https://precoscombustiveis.pt/) | Same DGEG data, friendly UI | No public API documented |
| [fuelprice.pt](https://fuelprice.pt/) | Real-time DGEG mirror | No public API |
| [OilPriceAPI](https://www.oilpriceapi.com/) | Simple REST | National averages only, weekly updates — not per-station |
| Google Places + scraping | Rich POI data | Against ToS; no official prices |

---

## Maps (future)

For station locations and routing, consider:

- **OpenStreetMap / Overpass** — free station POI data (no prices)
- **Google Maps Platform** — Places + Directions (paid, API key required)

Prices should always come from DGEG; maps are for navigation only.
