import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import server from "../.vercel/output/functions/__server.func/index.mjs";

test("las muestras y sus imágenes se entregan en el HTML inicial sin esperar al catálogo remoto", async () => {
  const response = await server.fetch(new Request("http://localhost/disenos"), { waitUntil() {} });
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const title of [
    "Soporte para sensor",
    "Carcasa para electrónica",
    "Conjunto de engranajes",
  ]) {
    assert.ok(html.includes(`alt="${title}"`), `Muestra ausente del HTML: ${title}`);
  }
  assert.ok(html.includes("no incluyen archivos descargables"));
  const images = [...html.matchAll(/<img[^>]*src="(\/assets\/[^\"]+\.jpg)"/g)];
  assert.ok(images.length >= 3, "El servidor debe entregar las imágenes de muestra");
  for (const [, asset] of images)
    assert.ok(
      existsSync(resolve(".vercel/output/static", "." + asset)),
      `Imagen ausente del build: ${asset}`,
    );
});
