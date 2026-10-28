import { test } from "node:test";
import assert from "node:assert/strict";
import { quickEstimate } from "../src/lib/quick-estimate.ts";
import { DEFAULT_PRINT_SETTINGS } from "../src/lib/print-pricing.ts";

test("visitante sin cuenta ni datos técnicos obtiene una referencia numérica solo al elegir tamaño", () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error("El presupuesto no debe depender de la red");
  };
  try {
    assert.equal(quickEstimate("PLA", 1, "", "", DEFAULT_PRINT_SETTINGS), null);
    const result = quickEstimate("PLA", 2, "small", "", DEFAULT_PRINT_SETTINGS);
    assert.equal(result.assumedWeight, true);
    assert.equal(result.assumedTime, true);
    assert.equal(result.grams, 25);
    assert.equal(result.printing.totalHours, 2);
    assert.equal(result.printing.total, 38.97);
    assert.equal(result.printing.material.consumedGrams, 57.5);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("los datos explícitos reemplazan cada referencia sin ocultar entradas inválidas", () => {
  const explicit = quickEstimate("PLA", 2, "large", "100", {
    ...DEFAULT_PRINT_SETTINGS,
    hours: "2",
    timeBasis: "batch",
  });
  assert.equal(explicit.assumedWeight, false);
  assert.equal(explicit.assumedTime, false);
  assert.equal(explicit.printing.totalHours, 2);
  assert.equal(explicit.printing.material.consumedGrams, 230);
  const mixed = quickEstimate("PLA", 2, "small", "100", {
    ...DEFAULT_PRINT_SETTINGS,
    timeBasis: "batch",
  });
  assert.equal(mixed.assumedWeight, false);
  assert.equal(mixed.assumedTime, true);
  assert.equal(mixed.printing.totalHours, 2, "las horas de referencia siempre son por pieza");
  assert.ok(quickEstimate("PLA", 1, "", "100", { ...DEFAULT_PRINT_SETTINGS, hours: "2" }));
  for (const grams of ["0", "-1", "abc", "Infinity"])
    assert.equal(quickEstimate("PLA", 1, "small", grams, DEFAULT_PRINT_SETTINGS), null);
  for (const hours of ["0", "-1", "abc", "Infinity"])
    assert.equal(quickEstimate("PLA", 1, "small", "", { ...DEFAULT_PRINT_SETTINGS, hours }), null);
});
