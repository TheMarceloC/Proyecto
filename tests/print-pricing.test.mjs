import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PRINT_SETTINGS,
  printEstimate,
  printerProfile,
  equipmentDepreciationHourly,
} from "../src/lib/print-pricing.ts";
// Conserva las regresiones del modelo anterior con merma explícita cero.
const SETTINGS = { ...DEFAULT_PRINT_SETTINGS, hours: "2", wastePercent: "0" };

test("A1: material con recargo más electricidad, sin aplicar recargo a la energía", () => {
  const estimate = printEstimate("PLA", 100, 2, SETTINGS);
  assert.equal(estimate.totalHours, 4);
  assert.equal(estimate.kwh, 0.38);
  assert.equal(estimate.energy, 2.47);
  assert.equal(estimate.material.cost, 75);
  assert.equal(estimate.material.markup, 56.25);
  assert.equal(estimate.total, 133.72);
});
test("tiempo por lote no se multiplica por cantidad; trabajo y extras son por pedido", () => {
  const estimate = printEstimate("PLA", 100, 2, {
    ...SETTINGS,
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
  const estimate = printEstimate("ABS", 100, 1, SETTINGS);
  assert.equal(estimate.profile.id, "x1c");
  assert.equal(estimate.watts, 150);
  assert.equal(estimate.energy, 1.95);
  assert.equal(estimate.total, 113.95);
  assert.equal(printerProfile("a1", "PETG").measuredMaterial, false);
  assert.equal(printerProfile("x1c", "TPU").measuredMaterial, false);
});
test("tarifa de factura y vatios medidos reemplazan los valores predeterminados", () => {
  const estimate = printEstimate("PLA", 100, 1, {
    ...SETTINGS,
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
    assert.equal(printEstimate("PLA", 50, 1, { ...SETTINGS, ...invalid }), null);
  }
});

test("costos estructurales: depreciación por hora, empaque/logística por pedido y merma inicial", () => {
  const estimate = printEstimate("PLA", 100, 2, {
    ...DEFAULT_PRINT_SETTINGS,
    hours: "2",
    timeBasis: "batch",
    machineHourly: "5",
    laborMinutes: "30",
    laborHourly: "80",
    extras: "10",
    depreciationHourly: "2",
    packaging: "6",
    logistics: "20",
  });
  assert.equal(estimate.material.consumedGrams, 230);
  assert.equal(estimate.depreciation, 4);
  assert.equal(estimate.packaging, 6);
  assert.equal(estimate.logistics, 20);
  assert.equal(estimate.cost, 177.49);
  assert.equal(estimate.total, 242.18);
  assert.deepEqual(estimate.unconfiguredCosts, []);
  const partial = printEstimate("PLA", 100, 1, { ...DEFAULT_PRINT_SETTINGS, hours: "2" });
  assert.ok(partial.unconfiguredCosts.includes("depreciationHourly"));
  assert.equal(
    printEstimate("PLA", 100, 1, DEFAULT_PRINT_SETTINGS),
    null,
    "sin horas no se inventa un total",
  );
  for (const invalid of [
    { wastePercent: "" },
    { wastePercent: "-1" },
    { wastePercent: "101" },
    { depreciationHourly: "-1" },
    { packaging: "NaN" },
    { logistics: "Infinity" },
  ])
    assert.equal(printEstimate("PLA", 100, 1, { ...SETTINGS, ...invalid }), null);
});

test("depreciación presupuestada sin asignar una vida útil ficticia", () => {
  assert.equal(equipmentDepreciationHourly(10000, 2000, 4000), 2);
  assert.equal(equipmentDepreciationHourly(10000, 10000, 4000), 0);
  for (const args of [
    [100, 200, 1000],
    [100, 0, 0],
    [-1, 0, 100],
    [100, -1, 100],
    [Infinity, 0, 100],
  ])
    assert.equal(equipmentDepreciationHourly(...args), null);
});
