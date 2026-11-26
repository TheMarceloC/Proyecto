import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import server from "../.vercel/output/functions/__server.func/index.mjs";
import { products, sellers } from "../src/features/marketplace/catalog.ts";

const fetchPage = (path) =>
  server.fetch(new Request("http://localhost" + path), { waitUntil() {} });
const visible = (html) =>
  html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "");
const staticFile = (url) => resolve(".vercel/output/static", "." + url);

test("las rutas principales están disponibles en la compilación", async () => {
  const routes = [
    ["/", /De tus ideas a/],
    ["/marketplace", /28 publicaciones/],
    ["/marketplace?tipo=digital", /9 publicaciones/],
    ["/producto/reductor-planetario", /Reductor planetario didáctico/],
    ["/fabricantes", /Encuentra un fabricante/],
    ["/fabricante/forma", /Forma3D/],
    ["/solicitar-fabricacion", /Información del proyecto/],
    ["/servicios-diseno", /Diseño y asesoría/],
    ["/calculadora", /Distribución del costo/],
    ["/vender", /Elige tu cuenta comercial/],
    ["/publicar", /Nueva publicación/],
    ["/carrito", /Tu carrito/],
    ["/checkout", /Confirma tu compra/],
    ["/favoritos", /Tus favoritos/],
    ["/cuenta?seccion=biblioteca", /Carcasa para nodo IoT/],
    ["/notificaciones", /Preferencias/],
    ["/admin", /Administración/],
    ["/como-funciona", /Cómo funciona ProtoLab/],
    ["/materiales", /Materiales de fabricación/],
    ["/faq", /Centro de ayuda/],
    ["/contacto", /Contacto/],
    ["/terminos", /Licencias de diseños/],
    ["/privacidad", /Datos guardados en este navegador/],
  ];
  for (const [route, text] of routes) {
    const response = await fetchPage(route);
    assert.equal(response.status, 200, route);
    const html = visible(await response.text());
    assert.match(html.replace(/\s+/g, " "), text, route);
    assert.doesNotMatch(
      html,
      /Modo demo|Datos simulados|Mock data|Vista demostrativa|Cotización automática/i,
      route,
    );
  }
});

test("los enlaces históricos redirigen y las rutas de API quedan fuera del prototipo", async () => {
  for (const [from, to] of [
    ["/cotizar", "/solicitar-fabricacion"],
    ["/disenos", "/marketplace"],
    ["/diseno/demo-carcasa-electronica", "/producto/carcasa-iot"],
    ["/panel", "/cuenta"],
    ["/seguimiento", "/cuenta"],
    ["/asesoria", "/servicios-diseno"],
  ]) {
    const response = await fetchPage(from);
    assert.ok(response.status >= 300 && response.status < 400, from);
    assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname, to, from);
  }
  for (const route of [
    "/producto/no-existe",
    "/fabricante/no-existe",
    "/api/session",
    "/api/designs",
  ]) {
    assert.equal((await fetchPage(route)).status, 404, route);
  }
});

test("las galerías, descargas y fuentes están incluidas como recursos locales", async () => {
  const urls = [
    "/marketplace/hero.webp",
    "/marketplace/fonts/inter-latin.woff2",
    "/marketplace/fonts/space-grotesk-latin.woff2",
    "/protolab-symbol.svg",
    ...products.flatMap((entry) => [
      ...entry.images.map((image) => image.src),
      ...(entry.asset ? [entry.asset.src] : []),
    ]),
    ...sellers
      .filter((entry) => entry.id !== "protolab")
      .map((entry) => "/marketplace/logos/" + entry.id + ".webp"),
    "/marketplace/workshops/taller-fdm.webp",
    "/marketplace/workshops/taller-resina.webp",
    "/marketplace/workshops/estudio-cad.webp",
  ];
  assert.equal(new Set(products.map((entry) => entry.images[0].src)).size, products.length);
  for (const url of urls) assert.ok(existsSync(staticFile(url)), "Recurso ausente: " + url);
  const response = await fetchPage("/");
  assert.match(await response.text(), /https:\/\/linktr\.ee\/pprotolab"/);
});
