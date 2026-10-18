import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PRINT_SETTINGS, printEstimate, printerProfile } from "../src/lib/print-pricing.ts";

test("A1: material con recargo más electricidad, sin aplicar recargo a la energía", () => {
  const estimate = printEstimate("PLA", 100, 2, DEFAULT_PRINT_SETTINGS);
  assert.equal(estimate.totalHours, 4);
  assert.equal(estimate.kwh, 0.38);
  assert.equal(estimate.energy, 2.47);
  assert.equal(estimate.material.cost, 75);
  assert.equal(estimate.material.markup, 56.25);
  assert.equal(estimate.total, 133.72);
});
test("tiempo por lote no se multiplica por cantidad; trabajo y extras son por pedido", () => {
  const estimate = printEstimate("PLA", 100, 2, {
    ...DEFAULT_PRINT_SETTINGS,
    timeBasis: "batch",
    machineHourly: "5",
    laborMinutes: "30",
    laborHourly: "80",
    extras: "10",
  });
  assert.equal(estimate.totalHours, 2);
  assert.equal(estimate.energy, 1.24);
  assert.equal(estimate.machine, 10);
  assert.equal(estimate.labor, 40);
  assert.equal(estimate.extras, 10);
  assert.equal(estimate.total, 192.49);
  assert.equal(estimate.cost, 136.24);
});
test("ABS se asigna a X1C, y PETG/TPU se identifican como aproximaciones", () => {
  const estimate = printEstimate("ABS", 100, 1, DEFAULT_PRINT_SETTINGS);
  assert.equal(estimate.profile.id, "x1c");
  assert.equal(estimate.watts, 150);
  assert.equal(estimate.energy, 1.95);
  assert.equal(estimate.total, 113.95);
  assert.equal(printerProfile("a1", "PETG").measuredMaterial, false);
  assert.equal(printerProfile("x1c", "TPU").measuredMaterial, false);
});
test("tarifa de factura y vatios medidos reemplazan los valores predeterminados", () => {
  const estimate = printEstimate("PLA", 100, 1, {
    ...DEFAULT_PRINT_SETTINGS,
    printer: "x1c",
    tariffId: "custom",
    customTariff: "5",
    watts: "200",
  });
  assert.equal(estimate.energy, 2);
  assert.equal(estimate.total, 67.63);
  for (const invalid of [
    { hours: "" },
    { hours: "-1" },
    { watts: "-2" },
    { customTariff: "", tariffId: "custom" },
    { extras: "-1" },
  ]) {
    assert.equal(printEstimate("PLA", 50, 1, { ...DEFAULT_PRINT_SETTINGS, ...invalid }), null);
  }
});
