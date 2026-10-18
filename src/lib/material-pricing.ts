// Costos por kg proporcionados por el usuario el 18/10/2026, en HNL.
export const MATERIAL_COSTS_PER_KG = { PLA: 375, PETG: 338, ABS: 640, TPU: 600 } as const;
export const MATERIAL_MARKUP_FACTOR = 1.75;
// Precio por gramo sin redondear; redondeamos únicamente los importes del pedido.
export const MATERIAL_PRICES = {
  PLA: (MATERIAL_COSTS_PER_KG.PLA / 1000) * MATERIAL_MARKUP_FACTOR,
  PETG: (MATERIAL_COSTS_PER_KG.PETG / 1000) * MATERIAL_MARKUP_FACTOR,
  ABS: (MATERIAL_COSTS_PER_KG.ABS / 1000) * MATERIAL_MARKUP_FACTOR,
  TPU: (MATERIAL_COSTS_PER_KG.TPU / 1000) * MATERIAL_MARKUP_FACTOR,
} as const;
export type PricedMaterial = keyof typeof MATERIAL_PRICES;
export const DEFAULT_GRAMS = 50;
export const formatLempiras = (amount: number) =>
  `L ${amount.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// Presentación al cliente: el cálculo interno conserva su precisión.
export const formatCustomerPrice = (amount: number) =>
  `L ${Math.round(amount).toLocaleString("es-HN", { maximumFractionDigits: 0 })}`;
export const formatMaterialRate = (amount: number) =>
  `L ${amount.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`;
export function materialEstimate(material: string, grams: number, quantity = 1) {
  const rate = MATERIAL_PRICES[material as PricedMaterial];
  if (
    !Object.hasOwn(MATERIAL_COSTS_PER_KG, material) ||
    !rate ||
    !Number.isFinite(grams) ||
    grams <= 0 ||
    grams > 50000 ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 1000
  )
    return null;
  // Trabajamos en centavos y calculamos el recargo por diferencia para que el
  // desglose mostrado sume exactamente, incluso con fracciones de centavo.
  const rawCostCents = (MATERIAL_COSTS_PER_KG[material as PricedMaterial] * grams * quantity) / 10;
  const costCents = Math.round(rawCostCents + Number.EPSILON * rawCostCents);
  const rawTotalCents = rawCostCents * MATERIAL_MARKUP_FACTOR;
  const totalCents = Math.round(rawTotalCents + Number.EPSILON * rawTotalCents);
  return {
    rate,
    grams,
    quantity,
    cost: costCents / 100,
    markup: (totalCents - costCents) / 100,
    total: totalCents / 100,
  };
}
