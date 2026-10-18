import { DEFAULT_GRAMS, formatLempiras, materialEstimate } from "@/lib/material-pricing";

export function MaterialEstimate({
  material,
  grams,
  quantity,
  needsDesign,
  assumed = false,
}: {
  material: string;
  grams: number;
  quantity: number;
  needsDesign: boolean;
  assumed?: boolean;
}) {
  const estimate = materialEstimate(material, grams, quantity);
  return (
    <div
      className="rounded-2xl border border-accent/25 bg-accent/[0.06] p-5"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="label-caps text-accent">Estimación de materiales</p>
      <p className="mt-2 font-display text-3xl font-bold text-foreground">
        {estimate ? formatLempiras(estimate.total) : "Indica un peso válido"}
      </p>
      {needsDesign && (
        <p className="mt-1 text-sm font-semibold text-accent">+ consultoría y diseño por cotizar</p>
      )}
      {estimate && (
        <p className="mt-3 text-xs text-muted-foreground">
          {grams} g por pieza × {quantity} {quantity === 1 ? "pieza" : "piezas"} ×{" "}
          {formatLempiras(estimate.rate)}/g · {material}
        </p>
      )}
      {assumed && (
        <p className="mt-2 text-xs text-muted-foreground">
          Referencia inicial de {DEFAULT_GRAMS} g por pieza. Puedes cambiarla en Fabricación.
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Solo material, sujeto al peso que confirmemos al preparar la impresión. No incluye
        fabricación ni envío.
      </p>
    </div>
  );
}
