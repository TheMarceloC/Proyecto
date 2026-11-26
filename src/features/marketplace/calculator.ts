import { equipmentDepreciationHourly } from "../../lib/print-pricing.ts";
import { roundMoney } from "./model.ts";

export const calculatorFields = {
  filament: { label: "Precio del filamento (L/kg)", min: 0, max: 1000000, step: 0.01 },
  electricity: { label: "Electricidad (L/kWh)", min: 0, max: 1000, step: 0.01 },
  power: { label: "Potencia promedio (W)", min: 0, max: 100000, step: 1 },
  life: { label: "Vida útil productiva (h)", min: 1, max: 1000000, step: 1 },
  equipment: { label: "Costo de equipo o reserva (L)", min: 0, max: 1000000, step: 0.01 },
  waste: { label: "Desperdicio de material (%)", min: 0, max: 100, step: 0.1 },
  hours: { label: "Horas", min: 0, max: 1000, step: 1 },
  minutes: { label: "Minutos", min: 0, max: 59, step: 1 },
  grams: { label: "Peso de material (g)", min: 0, max: 1000000, step: 0.1 },
  labor: { label: "Mano de obra por trabajo (L)", min: 0, max: 1000000, step: 0.01 },
  extras: { label: "Insumos adicionales (L)", min: 0, max: 1000000, step: 0.01 },
  multiplier: { label: "Multiplicador comercial (×)", min: 1, max: 100, step: 0.01 },
} as const;

type CalculatorField = keyof typeof calculatorFields;
export type CalculatorInput = Record<CalculatorField, string>;
const keys = Object.keys(calculatorFields) as CalculatorField[];
export const emptyCosts = Object.fromEntries(keys.map((key) => [key, ""])) as CalculatorInput;
export const exampleCosts: CalculatorInput = {
  filament: "375",
  electricity: "6.51",
  power: "100",
  life: "5000",
  equipment: "17500",
  waste: "15",
  hours: "3",
  minutes: "30",
  grams: "160",
  labor: "55",
  extras: "18",
  multiplier: "1.6",
};

export function calculateCosts(input: CalculatorInput) {
  const values = Object.fromEntries(keys.map((key) => [key, Number(input[key])])) as Record<
    CalculatorField,
    number
  >;
  if (
    keys.some(
      (key) =>
        !Number.isFinite(values[key]) ||
        (input[key] &&
          (values[key] < calculatorFields[key].min || values[key] > calculatorFields[key].max)) ||
        (calculatorFields[key].step === 1 && !Number.isInteger(values[key])),
    )
  )
    return null;
  if (values.equipment > 0 && values.life === 0) return null;

  const hours = values.hours + values.minutes / 60;
  const material = (values.grams * values.filament) / 1000;
  // W / 1000 × h gives kWh. Multiplying the material cost by waste gives only the extra material.
  const amounts = [
    { label: "Material", value: roundMoney(material), color: "#3e60eb" },
    {
      label: "Electricidad",
      value: roundMoney((values.power / 1000) * hours * values.electricity),
      color: "#42afdd",
    },
    {
      label: "Desgaste",
      value: roundMoney(
        (equipmentDepreciationHourly(values.equipment, 0, values.life) ?? 0) * hours,
      ),
      color: "#7868cd",
    },
    { label: "Desperdicio", value: roundMoney((material * values.waste) / 100), color: "#e48259" },
    { label: "Mano de obra", value: roundMoney(values.labor), color: "#17977d" },
    { label: "Insumos adicionales", value: roundMoney(values.extras), color: "#718198" },
  ];
  const total = roundMoney(amounts.reduce((sum, entry) => sum + entry.value, 0));
  const suggested = roundMoney(total * (values.multiplier || 1));
  const profit = roundMoney(suggested - total);
  return {
    hours,
    amounts,
    total,
    suggested,
    profit,
    margin: suggested ? (profit / suggested) * 100 : 0,
  };
}
