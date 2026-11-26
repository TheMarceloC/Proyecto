import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, CircleHelp, RotateCcw } from "lucide-react";
import {
  calculateCosts,
  calculatorFields,
  emptyCosts,
  exampleCosts,
  type CalculatorInput,
} from "@/features/marketplace/calculator";
import { useMarket } from "@/features/marketplace/store";
import { Field, PageTitle } from "@/features/marketplace/ui";
import { formatLempiras } from "@/lib/material-pricing";

export const Route = createFileRoute("/calculadora")({
  head: () => ({ meta: [{ title: "Calculadora de costos de impresión 3D | ProtoLab" }] }),
  component: CalculatorPage,
});

const fieldGroups: { title: string; fields: (keyof CalculatorInput)[] }[] = [
  {
    title: "Material y equipo",
    fields: ["filament", "electricity", "power", "life", "equipment", "waste"],
  },
  {
    title: "Trabajo de impresión",
    fields: ["hours", "minutes", "grams", "labor", "extras", "multiplier"],
  },
];

function CalculatorPage() {
  const { ready } = useMarket();
  const [input, setInput] = useState(emptyCosts);
  const result = calculateCosts(input);
  return (
    <div className="market-container market-page">
      <PageTitle
        title="Calculadora de costos"
        breadcrumb="Calculadora de costos"
        description="Estima el costo de un trabajo de impresión 3D a partir de tus parámetros."
      >
        <div className="button-row">
          <button
            type="button"
            className="market-button secondary"
            disabled={!ready}
            onClick={() => setInput(exampleCosts)}
          >
            <Calculator size={16} /> Cargar ejemplo
          </button>
          <button
            type="button"
            className="round-icon bordered"
            aria-label="Limpiar valores"
            disabled={!ready}
            onClick={() => setInput(emptyCosts)}
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </PageTitle>
      <div className="calculator-layout">
        <div className="stack">
          {fieldGroups.map(({ title, fields }) => (
            <section key={title} className="surface flow-card">
              <h2>{title}</h2>
              <div className="form-grid">
                {fields.map((key) => {
                  const { label, ...limits } = calculatorFields[key];
                  return (
                    <Field
                      key={key}
                      label={label}
                      hint={
                        key === "multiplier"
                          ? "1.60 × aplica un recargo de 60% sobre el costo."
                          : undefined
                      }
                    >
                      <input
                        type="number"
                        disabled={!ready}
                        placeholder={key === "multiplier" ? "1.00" : "—"}
                        {...limits}
                        value={input[key]}
                        onChange={(event) => setInput({ ...input, [key]: event.target.value })}
                      />
                    </Field>
                  );
                })}
              </div>
            </section>
          ))}
          <div className="surface calculation-notes">
            <CircleHelp size={21} />
            <div>
              <h3>Cómo se calcula</h3>
              <p>
                Material = precio por kg × gramos / 1000. Electricidad = potencia en W / 1000 ×
                horas × tarifa. Desgaste = costo de equipo o reserva / vida útil productiva × horas.
                El precio sugerido es el costo total por el multiplicador. El margen estimado es la
                ganancia dividida entre el precio sugerido.
              </p>
            </div>
          </div>
        </div>
        <aside className="surface calculator-results">
          <h2>Distribución del costo</h2>
          {result ? (
            <>
              <div className="cost-segments" aria-hidden="true">
                {result.amounts.map((entry) => (
                  <span
                    key={entry.label}
                    style={{ backgroundColor: entry.color, flexGrow: entry.value }}
                  />
                ))}
              </div>
              <dl className="fact-list cost-list">
                {result.amounts.map((entry) => (
                  <div key={entry.label}>
                    <dt>
                      <i style={{ backgroundColor: entry.color }} />
                      {entry.label}
                    </dt>
                    <dd>{formatLempiras(entry.value)}</dd>
                  </div>
                ))}
              </dl>
              <div className="total-row">
                <span>Costo total</span>
                <strong>{formatLempiras(result.total)}</strong>
              </div>
              <div className="suggested-price">
                <span>Precio sugerido</span>
                <strong>{formatLempiras(result.suggested)}</strong>
                <div>
                  <span>Ganancia estimada</span>
                  <b>{formatLempiras(result.profit)}</b>
                </div>
                <div>
                  <span>Margen estimado</span>
                  <b>{result.margin.toFixed(1)}%</b>
                </div>
              </div>
            </>
          ) : (
            <p role="alert" className="field-error">
              Revisa los rangos. Si ingresas un costo de equipo, indica su vida útil en horas.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
