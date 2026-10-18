import { formatCustomerPrice, materialEstimate } from "@/lib/material-pricing";
import { printEstimate, type PrintCostSettings } from "@/lib/print-pricing";

export function MaterialEstimate({
  material,
  grams,
  quantity,
  needsDesign,
  priceAvailable = false,
  settings,
}: {
  material: string;
  grams: number;
  quantity: number;
  needsDesign: boolean;
  priceAvailable?: boolean;
  settings?: PrintCostSettings;
}) {
  const estimate = materialEstimate(material, grams, quantity);
  const printing = settings ? printEstimate(material, grams, quantity, settings) : null;
  const valid = priceAvailable && estimate && (!settings || printing);
  const total = printing?.total ?? estimate?.total;
  return (
    <div
      className="rounded-2xl border border-accent/25 bg-accent/[0.06] p-5"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="label-caps text-accent">
        {valid ? "Precio final estimado" : "Cotización a tu medida"}
      </p>
      <p className="mt-2 font-display text-4xl font-bold text-foreground">
        {valid && total !== undefined ? formatCustomerPrice(total) : "Lo resolvemos contigo"}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {quantity} {quantity === 1 ? "pieza" : "piezas"} · revisión personalizada
      </p>
      {needsDesign && (
        <p className="mt-3 text-sm font-semibold text-accent">También te ayudamos a diseñarla.</p>
      )}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        {valid
          ? "Estimación según los datos que compartiste. "
          : "Puedes continuar sin saber el peso, el material ni las horas de impresión. "}
        Te confirmaremos el precio antes de fabricar. Diseño y envío se cotizan según tu proyecto.
      </p>
    </div>
  );
}
