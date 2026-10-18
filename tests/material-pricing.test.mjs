import { test } from "node:test";
import assert from "node:assert/strict";
import { materialEstimate, formatMaterialRate } from "../src/lib/material-pricing.ts";

test("precios acordados para 1 kg: costo, recargo y subtotal", () => {
  for (const [material, cost, markup, total] of [
    ["PLA", 375, 281.25, 656.25],
    ["PETG", 338, 253.5, 591.5],
    ["TPU", 600, 450, 1050],
    ["ABS", 640, 480, 1120],
  ]) {
    const result = materialEstimate(material, 1000);
    assert.equal(result.cost, cost);
    assert.equal(result.markup, markup);
    assert.equal(result.total, total);
  }
});

test("consumo de varias piezas y redondeo de medios centavos", () => {
  assert.equal(materialEstimate("PLA", 100, 2).total, 131.25);
  assert.equal(materialEstimate("PETG", 50).total, 29.58);
  assert.equal(materialEstimate("PETG", 50).markup, 12.68);
  assert.equal(materialEstimate("PLA", 50).total, 32.81);
  assert.equal(formatMaterialRate(materialEstimate("PLA", 1).rate), "L 0.65625");
  for (const material of ["PLA", "PETG", "ABS", "TPU"]) {
    for (const grams of [0.1, 1, 35, 50, 80, 100, 333.3]) {
      const result = materialEstimate(material, grams, 3);
      assert.equal(Math.round((result.cost + result.markup) * 100), Math.round(result.total * 100));
    }
  }
});

test("rechaza pesos y cantidades inválidos", () => {
  for (const grams of [0, -1, NaN, Infinity, 50001])
    assert.equal(materialEstimate("PLA", grams), null);
  for (const quantity of [0, -1, 1.5, 1001, NaN])
    assert.equal(materialEstimate("PETG", 50, quantity), null);
  assert.equal(materialEstimate("desconocido", 50), null);
});
