/** Parse DGEG price strings like "2,019 €/litro" or "0,859 €" */
export const parseDgegPrice = (preco: string | null | undefined): number | null => {
  if (!preco) return null;
  const cleaned = preco
    .replace(/\s*€\s*\/\s*litro/gi, '')
    .replace(/\s*€/g, '')
    .replace(/\s/g, '')
    .replace(',', '.');
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
};
