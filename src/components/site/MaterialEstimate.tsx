import {
  DEFAULT_GRAMS,
  formatLempiras,
  formatMaterialRate,
  materialEstimate,
} from "@/lib/material-pricing";
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
      <p className="label-caps text-accent">
        {settings ? "Estimación del pedido" : "Estimación de materiales"}
      </p>
      <p className="mt-2 font-display text-3xl font-bold text-foreground">
        {valid && total !== undefined ? formatLempiras(total) : "Revisa los datos del cálculo"}
      </p>
      {needsDesign && (
        <p className="mt-1 text-sm font-semibold text-accent">+ consultoría y diseño por cotizar</p>
      )}
      {estimate && (
        <p className="mt-3 text-xs text-muted-foreground">
          {grams} g por pieza × {quantity} {quantity === 1 ? "pieza" : "piezas"} ×{" "}
          {formatMaterialRate(estimate.rate)}/g · {material}
        </p>
      )}
      {estimate && (
        <dl className="mt-4 space-y-2 border-t border-accent/15 pt-3 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Costo del material consumido</dt>
            <dd>{formatLempiras(estimate.cost)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Recargo sobre material (75 %)</dt>
            <dd>{formatLempiras(estimate.markup)}</dd>
          </div>
          {settings && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Electricidad</dt>
              <dd>{printing ? formatLempiras(printing.energy) : "Por revisar"}</dd>
            </div>
          )}
          {printing && printing.machine > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Máquina y mantenimiento</dt>
              <dd>{formatLempiras(printing.machine)}</dd>
            </div>
          )}
          {printing && printing.labor > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Trabajo manual</dt>
              <dd>{formatLempiras(printing.labor)}</dd>
            </div>
          )}
          {printing && printing.extras > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Otros costos</dt>
              <dd>{formatLempiras(printing.extras)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3 font-semibold">
            <dt>Subtotal estimado</dt>
            <dd>{valid && total !== undefined ? formatLempiras(total) : "Por revisar"}</dd>
          </div>
          {printing && quantity > 1 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Promedio por pieza</dt>
              <dd>{formatLempiras(printing.perPiece)}</dd>
            </div>
          )}
        </dl>
      )}
      {printing && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {printing.profile.name} ·{" "}
          {printing.totalHours.toLocaleString("es-HN", { maximumFractionDigits: 2 })} h totales ·{" "}
          {printing.watts} W medios
          <br />
          {printing.kwh.toLocaleString("es-HN", { maximumFractionDigits: 4 })} kWh ×{" "}
          {formatMaterialRate(printing.tariff)}/kWh
        </p>
      )}
      {printing && !printing.profile.measuredMaterial && settings?.watts === "" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Potencia aproximada a partir de PLA; ajusta los vatios si tienes una medición para{" "}
          {material}.
        </p>
      )}
      {settings && !settings.timeConfirmed && (
        <p className="mt-2 text-xs text-muted-foreground">
          Tiempo inicial de referencia: {settings.hours} h{" "}
          {settings.timeBasis === "piece" ? "por pieza" : "por lote"}. Confírmalo en Fabricación.
        </p>
      )}
      {assumed && (
        <p className="mt-2 text-xs text-muted-foreground">
          Referencia inicial de {DEFAULT_GRAMS} g por pieza. Puedes cambiarla en Fabricación.
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {settings
          ? "Incluye material con recargo y electricidad estimada. Máquina, trabajo manual y extras solo se incluyen si se indican."
          : "Material con recargo incluido."}{" "}
        Confirmaremos el consumo al preparar la impresión. Consultoría y envío se cotizan aparte.
      </p>
    </div>
  );
}
