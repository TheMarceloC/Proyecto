import { Field, PillOption, inputClass } from "./ui";
import {
  ELECTRICITY_TARIFFS,
  printerProfile,
  type PrintCostSettings,
  type TariffId,
} from "@/lib/print-pricing";
import { formatMaterialRate } from "@/lib/material-pricing";

export function PrintCostControls({
  value,
  onChange,
  material,
}: {
  value: PrintCostSettings;
  onChange: (value: PrintCostSettings) => void;
  material: string;
}) {
  const profile = printerProfile(value.printer, material);
  const update = (key: keyof PrintCostSettings, next: string) =>
    onChange({ ...value, [key]: next });
  return (
    <div className="space-y-5 rounded-2xl border border-brand/25 bg-brand/[0.05] p-5">
      <div>
        <p className="label-caps text-accent">Tiempo, equipo y energía</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Usa los gramos y el tiempo estimado de Bambu Studio para afinar el precio.
        </p>
      </div>
      <Field label="Impresora de referencia">
        <div className="grid gap-2 sm:grid-cols-2">
          <PillOption
            selected={profile.id === "a1"}
            onClick={() => onChange({ ...value, printer: "a1", watts: "" })}
            disabled={material === "ABS"}
          >
            Bambu Lab A1
          </PillOption>
          <PillOption
            selected={profile.id === "x1c"}
            onClick={() => onChange({ ...value, printer: "x1c", watts: "" })}
          >
            Bambu Lab X1 Carbon
          </PillOption>
        </div>
        {material === "ABS" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Para ABS usamos X1 Carbon; Bambu no recomienda ABS en la A1.
          </p>
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tiempo de impresión (horas)">
          <input
            aria-label="Tiempo de impresión en horas"
            type="number"
            min="0.01"
            max="1000"
            step="0.25"
            className={inputClass}
            value={value.hours}
            onChange={(e) => onChange({ ...value, hours: e.target.value, timeConfirmed: true })}
          />
        </Field>
        <Field label="Ese tiempo corresponde a">
          <select
            aria-label="Base del tiempo de impresión"
            className={inputClass}
            value={value.timeBasis}
            onChange={(e) => update("timeBasis", e.target.value)}
          >
            <option value="piece">Cada pieza</option>
            <option value="batch">Todo el lote</option>
          </select>
        </Field>
      </div>
      {!value.timeConfirmed && (
        <p className="text-xs text-muted-foreground">
          {value.hours} h {value.timeBasis === "piece" ? "por pieza" : "para todo el lote"} es solo
          una referencia inicial editable; no se ha analizado tu archivo.
        </p>
      )}
      <details className="border-t border-border pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-accent">
          Ajustar electricidad y otros costos
        </summary>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Tarifa eléctrica de Honduras">
            <select
              aria-label="Tarifa eléctrica de Honduras"
              className={inputClass}
              value={value.tariffId}
              onChange={(e) => update("tariffId", e.target.value as TariffId)}
            >
              {Object.entries(ELECTRICITY_TARIFFS).map(([id, t]) => (
                <option key={id} value={id}>
                  {t.label} · {formatMaterialRate(t.rate)}/kWh
                </option>
              ))}
              <option value="custom">Usar tarifa de mi factura</option>
            </select>
          </Field>
          {value.tariffId === "custom" && (
            <Field label="Tarifa personalizada (L/kWh)">
              <input
                aria-label="Tarifa personalizada en lempiras por kWh"
                type="number"
                min="0.0001"
                max="100"
                step="0.0001"
                className={inputClass}
                value={value.customTariff}
                onChange={(e) => update("customTariff", e.target.value)}
              />
            </Field>
          )}
          <Field
            label="Potencia media durante la impresión (W)"
            hint={`Referencia: ${profile.watts} W. ${profile.measuredMaterial ? "Media publicada por Bambu Lab." : "Valor de PLA usado como aproximación para este material; reemplázalo por una medición."}`}
          >
            <input
              aria-label="Potencia media en vatios"
              type="number"
              min="1"
              max="5000"
              step="1"
              placeholder={String(profile.watts)}
              className={inputClass}
              value={value.watts}
              onChange={(e) => update("watts", e.target.value)}
            />
          </Field>
          <Field
            label="Máquina y mantenimiento (L/h)"
            hint="Opcional: costo del equipo / horas de vida útil + mantenimiento por hora. En 0 no se cobra este concepto."
          >
            <input
              aria-label="Costo de máquina por hora"
              type="number"
              min="0"
              max="100000"
              step="0.1"
              className={inputClass}
              value={value.machineHourly}
              onChange={(e) => update("machineHourly", e.target.value)}
            />
          </Field>
          <Field label="Trabajo manual total del pedido (min)">
            <input
              aria-label="Minutos de trabajo manual"
              type="number"
              min="0"
              max="100000"
              step="1"
              className={inputClass}
              value={value.laborMinutes}
              onChange={(e) => update("laborMinutes", e.target.value)}
            />
          </Field>
          <Field label="Mano de obra (L/h)">
            <input
              aria-label="Tarifa de mano de obra por hora"
              type="number"
              min="0"
              max="100000"
              step="0.1"
              className={inputClass}
              value={value.laborHourly}
              onChange={(e) => update("laborHourly", e.target.value)}
            />
          </Field>
          <Field
            label="Otros costos del pedido (L)"
            hint="Por ejemplo empaque, consumibles o acabado; no por pieza."
          >
            <input
              aria-label="Otros costos del pedido"
              type="number"
              min="0"
              max="100000"
              step="0.01"
              className={inputClass}
              value={value.extras}
              onChange={(e) => update("extras", e.target.value)}
            />
          </Field>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          El factor 1.75 se aplica al material. Energía, máquina y trabajo manual se suman al costo,
          sin volver a aplicar ese factor. Los valores opcionales empiezan en 0 porque aún no se han
          definido.
        </p>
      </details>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Electricidad:{" "}
        <a
          href="https://www.cree.gob.hn/tarifas-vigentes-enee/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          CREE · octubre de 2026
        </a>
        . No incluye cargo fijo mensual ni subsidios. Consumos de referencia:{" "}
        <a
          href="https://wiki.bambulab.com/en/general/power-consumption"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Bambu Lab
        </a>
        ; pueden variar con el material y la temperatura.
      </p>
    </div>
  );
}
