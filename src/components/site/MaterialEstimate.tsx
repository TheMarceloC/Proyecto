import { formatCustomerPrice, materialEstimate } from "@/lib/material-pricing";
import { printEstimate, type PrintCostSettings } from "@/lib/print-pricing";

export function MaterialEstimate({
  material,
  grams,
  quantity,
  needsDesign,
  assumed = false,
  settings,
}: {
  material: string;
  grams: number;
  quantity: number;
  needsDesign: boolean;
  assumed?: boolean;
  settings?: PrintCostSettings;
}) {
  const estimate = materialEstimate(material, grams, quantity);
  const printing = settings ? printEstimate(material, grams, quantity, settings) : null;
  const valid = estimate && (!settings || printing);
  const total = printing?.total ?? estimate?.total;
  return (
    <div
      className="rounded-2xl border border-accent/25 bg-accent/[0.06] p-5"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="label-caps text-accent">Precio final estimado</p>
      <p className="mt-2 font-display text-4xl font-bold text-foreground">
        {valid && total !== undefined ? formatCustomerPrice(total) : "Revisa los datos de tu pieza"}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Total por {quantity} {quantity === 1 ? "pieza" : "piezas"} · {material}
      </p>
      {needsDesign && (
        <p className="mt-3 text-sm font-semibold text-accent">+ consultoría por cotizar</p>
      )}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        {assumed || (settings && !settings.timeConfirmed)
          ? "Usamos un peso o tiempo de referencia. "
          : ""}
        Confirmaremos el precio al revisar tu proyecto. Envío aparte.
      </p>
    </div>
  );
}
