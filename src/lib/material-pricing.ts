// Bases orientativas en HNL; ver PRECIOS_MATERIALES.md para fuentes y alcance.
// Solo materia prima: sin tiempo de máquina, margen, envío ni consultoría.
export const MATERIAL_PRICES = {
  PLA: 0.8,
  PETG: 1,
  ABS: 1.45,
  TPU: 1.4,
} as const;
export type PricedMaterial = keyof typeof MATERIAL_PRICES;
export const DEFAULT_GRAMS = 50;
export const formatLempiras = (amount: number) =>
  `L ${amount.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export function materialEstimate(material: string, grams: number, quantity = 1) {
  const rate = MATERIAL_PRICES[material as PricedMaterial];
  if (
    !rate ||
    !Number.isFinite(grams) ||
    grams <= 0 ||
    grams > 50000 ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 1000
  )
    return null;
  return { rate, grams, quantity, total: Math.round(rate * grams * quantity * 100) / 100 };
}
