import { materialEstimate } from "./material-pricing.ts";

export const ELECTRICITY_TARIFFS = {
  commercial: { label: "ENEE · General en baja tensión", rate: 6.5115 },
  residential: { label: "ENEE · Residencial, siguientes a 50 kWh/mes", rate: 6.5102 },
  first50: { label: "ENEE · Residencial, primeros 50 kWh/mes", rate: 5.0031 },
} as const;
export type PrinterId = "a1" | "x1c";
export type TariffId = keyof typeof ELECTRICITY_TARIFFS | "custom";
export type PrintCostSettings = {
  printer: PrinterId;
  hours: string;
  timeBasis: "piece" | "batch";
  timeConfirmed: boolean;
  watts: string;
  tariffId: TariffId;
  customTariff: string;
  machineHourly: string;
  laborMinutes: string;
  laborHourly: string;
  extras: string;
};
export const DEFAULT_PRINT_SETTINGS: PrintCostSettings = {
  printer: "a1",
  hours: "2",
  timeBasis: "piece",
  timeConfirmed: false,
  watts: "",
  tariffId: "commercial",
  customTariff: "",
  machineHourly: "0",
  laborMinutes: "0",
  laborHourly: "0",
  extras: "0",
};
export function printerProfile(printer: PrinterId, material: string) {
  const id = material === "ABS" ? "x1c" : printer;
  return {
    id,
    name: id === "a1" ? "Bambu Lab A1" : "Bambu Lab X1 Carbon",
    watts: material === "ABS" ? 150 : id === "a1" ? 95 : 105,
    // Bambu publica PLA y ABS; PETG/TPU usan PLA solo como referencia provisional.
    measuredMaterial: material === "PLA" || material === "ABS",
  };
}
const cents = (amount: number) =>
  Math.round(amount * 100 + Math.abs(amount * 100) * Number.EPSILON);
export function printEstimate(
  material: string,
  grams: number,
  quantity: number,
  settings: PrintCostSettings,
) {
  const materialCost = materialEstimate(material, grams, quantity);
  if (!materialCost) return null;
  const profile = printerProfile(settings.printer, material);
  const hours = Number(settings.hours);
  const watts = settings.watts === "" ? profile.watts : Number(settings.watts);
  const tariff =
    settings.tariffId === "custom"
      ? Number(settings.customTariff)
      : ELECTRICITY_TARIFFS[settings.tariffId]?.rate;
  const machineHourly = Number(settings.machineHourly);
  const laborMinutes = Number(settings.laborMinutes);
  const laborHourly = Number(settings.laborHourly);
  const extras = Number(settings.extras);
  if (
    !Number.isFinite(hours) ||
    hours <= 0 ||
    hours > 1000 ||
    !Number.isFinite(watts) ||
    watts <= 0 ||
    watts > 5000 ||
    !Number.isFinite(tariff) ||
    tariff <= 0 ||
    tariff > 100 ||
    ![machineHourly, laborMinutes, laborHourly, extras].every(
      (x) => Number.isFinite(x) && x >= 0 && x <= 100000,
    ) ||
    !["piece", "batch"].includes(settings.timeBasis)
  )
    return null;
  const totalHours = hours * (settings.timeBasis === "piece" ? quantity : 1);
  // Potencia media real (W) / 1000 × horas = energía activa (kWh).
  // El cargo fijo mensual y la potencia máxima de placa no son consumo del pedido.
  const kwh = (watts / 1000) * totalHours;
  const energyCents = cents(kwh * tariff);
  const machineCents = cents(totalHours * machineHourly);
  const laborCents = cents((laborMinutes / 60) * laborHourly);
  const extrasCents = cents(extras);
  const operatingCents = energyCents + machineCents + laborCents + extrasCents;
  const totalCents = cents(materialCost.total) + operatingCents;
  return {
    material: materialCost,
    profile,
    watts,
    tariff,
    totalHours,
    kwh,
    energy: energyCents / 100,
    machine: machineCents / 100,
    labor: laborCents / 100,
    extras: extrasCents / 100,
    cost: (cents(materialCost.cost) + operatingCents) / 100,
    total: totalCents / 100,
    perPiece: totalCents / 100 / quantity,
  };
}
