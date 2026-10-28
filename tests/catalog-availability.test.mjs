import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import server from "../.vercel/output/functions/__server.func/index.mjs";

test("solo el catálogo demostrativo muestra precios de ejemplo y no se exponen márgenes", async () => {
  for (const route of ["/", "/cotizar", "/disenos", "/servicios", "/materiales", "/faq"]) {
    const response = await server.fetch(new Request("http://localhost" + route), {
      waitUntil() {},
    });
    assert.equal(response.status, 200);
    const html = await response.text();
    const visible = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "");
    assert.doesNotMatch(
      visible,
      /recargo|margen|factor de 1\.75|costo del material consumido|ajustar electricidad/i,
      route,
    );
    if (route === "/disenos") {
      assert.match(visible, /Vista demostrativa/);
      assert.match(visible, /L\s*100/);
      assert.match(visible, /L\s*250/);
      assert.match(visible, /L\s*500/);
      assert.doesNotMatch(visible, /Cargando publicaciones|Publicación revisada/);
    } else assert.doesNotMatch(visible, /L\s+[\d,]+/, route);
    if (route === "/cotizar") {
      assert.match(visible, /Cotización a tu medida/);
      assert.match(visible, /Puedes continuar sin saber el peso/);
    }
  }
});

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
  assert.ok(html.includes("No se procesan compras ni descargas"));
  const images = [...html.matchAll(/<img[^>]*src="(\/assets\/[^\"]+\.jpg)"/g)];
  assert.ok(images.length >= 3, "El servidor debe entregar las imágenes de muestra");
  for (const [, asset] of images)
    assert.ok(
      existsSync(resolve(".vercel/output/static", "." + asset)),
      `Imagen ausente del build: ${asset}`,
    );
});

test("el detalle y la propuesta de venta se pueden presentar sin Supabase ni cuenta", async () => {
  for (const path of [
    "/diseno/demo-soporte-sensor",
    "/diseno/demo-carcasa-electronica",
    "/diseno/demo-conjunto-engranajes",
  ]) {
    const response = await server.fetch(new Request("http://localhost" + path), { waitUntil() {} });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /Diseño de demostración/);
    assert.match(html, /Comprar diseño · demo/);
    assert.match(html, /Cotizar pieza fabricada/);
    assert.doesNotMatch(html, /Publicación revisada|Iniciar sesión para comprar/);
  }
  const response = await server.fetch(new Request("http://localhost/publicar"), { waitUntil() {} });
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Precio propuesto del archivo/);
  assert.match(html, /Previsualizar envío · demo/);
});
