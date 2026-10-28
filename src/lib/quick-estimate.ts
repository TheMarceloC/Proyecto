import { printEstimate, type PrintCostSettings } from "./print-pricing.ts";

// Escenarios comerciales iniciales para orientar presupuesto. No provienen de
// un análisis CAD ni de mediciones de ProtoLab. Validar con pedidos y laminador.
export const QUICK_SIZES = [
  {
    id: "small",
    label: "Pequeña",
    description: "Cabe en la palma de la mano",
    grams: 25,
    hours: 1,
  },
  {
    id: "medium",
    label: "Mediana",
    description: "Similar a una caja pequeña",
    grams: 100,
    hours: 4,
  },
  {
    id: "large",
    label: "Grande",
    description: "Más grande que una caja pequeña",
    grams: 250,
    hours: 10,
  },
] as const;
export type QuickSize = (typeof QUICK_SIZES)[number]["id"] | "";
export function quickEstimate(
  material: string,
  quantity: number,
  size: QuickSize,
  gramsInput: string,
  settings: PrintCostSettings,
) {
  const reference = QUICK_SIZES.find((item) => item.id === size);
  const assumedWeight = gramsInput.trim() === "";
  const assumedTime = settings.hours.trim() === "";
  // Un dato inválido que sí se escribió nunca se reemplaza silenciosamente.
  const grams = assumedWeight ? reference?.grams : Number(gramsInput);
  const hours = assumedTime ? reference?.hours : Number(settings.hours);
  if (grams === undefined || hours === undefined) return null;
  const effectiveSettings: PrintCostSettings = {
    ...settings,
    hours: String(hours),
    // La referencia siempre es por pieza, aun si el selector técnico quedó en lote.
    timeBasis: assumedTime ? "piece" : settings.timeBasis,
  };
  const printing = printEstimate(material, grams, quantity, effectiveSettings);
  return printing
    ? {
        printing,
        grams,
        settings: effectiveSettings,
        assumedWeight,
        assumedTime,
        reference: reference?.label ?? null,
      }
    : null;
}
