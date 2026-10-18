import { Field, PillOption, inputClass } from "./ui";
import { printerProfile, type PrintCostSettings } from "@/lib/print-pricing";

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
  return (
    <div className="space-y-5 rounded-2xl border border-brand/25 bg-brand/[0.05] p-5">
      <div>
        <p className="label-caps text-accent">Datos opcionales de impresión</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Completa solo lo que conozcas. Si no tienes estos datos, puedes dejarlos vacíos.
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
          <p className="mt-2 text-xs text-muted-foreground">Para ABS utilizamos X1 Carbon.</p>
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tiempo de impresión en horas (opcional)">
          <input
            aria-label="Tiempo de impresión en horas"
            type="number"
            min="0.01"
            max="1000"
            step="0.25"
            className={inputClass}
            value={value.hours}
            placeholder="No lo sé"
            onChange={(e) => onChange({ ...value, hours: e.target.value, timeConfirmed: true })}
          />
        </Field>
        <Field label="Ese tiempo corresponde a">
          <select
            aria-label="Base del tiempo de impresión"
            className={inputClass}
            value={value.timeBasis}
            onChange={(e) =>
              onChange({ ...value, timeBasis: e.target.value as PrintCostSettings["timeBasis"] })
            }
          >
            <option value="piece">Cada pieza</option>
            <option value="batch">Todo el lote</option>
          </select>
        </Field>
      </div>
      {!value.timeConfirmed && (
        <p className="text-xs text-muted-foreground">
          Nosotros confirmaremos el tiempo al revisar tu proyecto. No necesitas calcularlo.
        </p>
      )}
    </div>
  );
}
