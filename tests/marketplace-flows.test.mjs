import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateCosts, exampleCosts } from "../src/features/marketplace/calculator.ts";
import { commissionRate, products, sellers } from "../src/features/marketplace/catalog.ts";
import { applyMarketAction, initialMarket, ratingFor } from "../src/features/marketplace/model.ts";

const date = "2026-11-26T18:00:00Z";
const seller = "forma";
const support = "soporte-sensor";
const design = "reductor-planetario";

test("catálogo, vendedores, ofertas y liquidaciones se relacionan", () => {
  const state = initialMarket();
  const ids = new Set(products.map((entry) => entry.id));
  const sellerIds = new Set(sellers.map((entry) => entry.id));
  assert.equal(ids.size, 28);
  assert.equal(sellerIds.size, 10);
  assert.ok(products.every((entry) => sellerIds.has(entry.sellerId) && entry.images.length === 2));
  assert.ok(state.reviews.every((entry) => ids.has(entry.productId)));
  assert.ok(
    state.offers.every((offer) => state.requests.some((request) => request.id === offer.requestId)),
  );
  assert.ok(
    state.orders.every(
      (order) =>
        sellerIds.has(order.sellerId) &&
        order.commission ===
          (order.sellerId === "protolab"
            ? 0
            : Math.round(order.total * commissionRate * 100) / 100),
    ),
  );
});

test("el carrito conserva los grupos y entrega cada diseño una vez", () => {
  let state = initialMarket();
  for (const id of [design, design, support, support])
    state = applyMarketAction(state, { type: "cart", id, quantity: 1, additive: true });
  assert.deepEqual(state.carts.daniel, [
    { productId: design, quantity: 1 },
    { productId: support, quantity: 2 },
  ]);
  state = applyMarketAction(state, {
    type: "checkout",
    sellerId: "protolab",
    method: "Tarjeta",
    id: "prueba-compra",
    date,
  });
  assert.deepEqual(state.carts.daniel, [{ productId: support, quantity: 2 }]);
  assert.equal(state.orders[0].buyerId, "daniel");
  assert.equal(state.orders[0].total, 500);
  assert.ok(state.orders[0].lines[0].asset.src.endsWith(".zip"));
  assert.ok(
    state.notifications.some(
      (notice) => notice.accountId === "protolab" && notice.title === "Nueva venta",
    ),
  );
  assert.equal(applyMarketAction(state, { type: "cart", id: design, quantity: 1 }), state);
  state = applyMarketAction(state, {
    type: "checkout",
    sellerId: seller,
    method: "Tarjeta",
    id: "prueba-pieza",
    date,
  });
  assert.equal(state.orders[0].total, 640);
  assert.equal(state.orders[0].commission, 76.8);
  assert.equal(state.orders[0].processed, false);
  assert.equal(applyMarketAction(state, { type: "settle", id: "prueba-pieza", date }), state);
  state = applyMarketAction(state, { type: "account", id: "admin" });
  state = applyMarketAction(state, { type: "settle", id: "prueba-pieza", date });
  assert.equal(state.orders[0].processed, true);
});

test("una solicitud recibe oferta, se acepta, se paga y se finaliza", () => {
  let state = initialMarket();
  const id = "prueba-fabricacion";
  const draft = {
    title: "Soporte",
    description: "Validación dimensional",
    pieceType: "Prototipo",
    application: "Montaje",
    quantity: 3,
    material: "PETG",
    color: "",
    dimensions: "",
    finish: "",
    notes: "",
    sellerId: seller,
    attachment: { name: "pieza.stl", bytes: 490, extension: ".stl" },
  };
  const offer = {
    requestId: id,
    price: 655,
    quantity: 3,
    days: 6,
    material: "PETG",
    notes: "Entrega por acordar",
  };
  const requestStatus = () => state.requests.find((entry) => entry.id === id).status;
  state = applyMarketAction(state, { type: "request", draft, id, date });
  assert.equal(requestStatus(), "Solicitud enviada");
  assert.equal(applyMarketAction(state, { type: "offer", offer, date }), state);
  state = applyMarketAction(state, { type: "account", id: seller });
  state = applyMarketAction(state, { type: "availability", id: seller });
  assert.equal(state.availability[seller], false);
  state = applyMarketAction(state, { type: "offer", offer, date });
  assert.equal(requestStatus(), "Oferta recibida");
  state = applyMarketAction(state, { type: "account", id: "daniel" });
  assert.equal(applyMarketAction(state, { type: "request", draft, id: id + "-2", date }), state);
  state = applyMarketAction(state, { type: "offer-status", id, status: "Oferta aceptada", date });
  state = applyMarketAction(state, {
    type: "offer-checkout",
    id,
    orderId: "pago",
    method: "Tarjeta",
    date,
  });
  assert.equal(requestStatus(), "Pago confirmado");
  assert.equal(state.orders[0].total, 655);
  assert.equal(state.orders[0].commission, 78.6);
  assert.equal(
    applyMarketAction(state, {
      type: "offer-checkout",
      id,
      orderId: "repetido",
      method: "Tarjeta",
      date,
    }),
    state,
  );
  state = applyMarketAction(state, { type: "account", id: seller });
  state = applyMarketAction(state, { type: "finish", id, date });
  assert.equal(requestStatus(), "Finalizado");
});

test("reseñas, publicaciones y preferencias pertenecen a la cuenta correspondiente", () => {
  let state = initialMarket();
  const current = ratingFor(state.reviews, [support]);
  assert.equal(
    applyMarketAction(state, {
      type: "review",
      productId: design,
      rating: 4,
      text: "Comentario",
      date,
    }),
    state,
  );
  state = applyMarketAction(state, {
    type: "review",
    productId: support,
    rating: 4,
    text: "Comentario",
    date,
  });
  state = applyMarketAction(state, {
    type: "review",
    productId: support,
    rating: 3,
    text: "Edición",
    date,
  });
  assert.equal(ratingFor(state.reviews, [support]).count, current.count + 1);
  assert.equal(state.reviews.find((review) => review.accountId === "daniel").rating, 3);
  state = applyMarketAction(state, { type: "preferences", field: "whatsapp", enabled: true });
  assert.equal(state.preferences.daniel.whatsapp, true);
  state = applyMarketAction(state, { type: "read" });
  assert.ok(
    state.notifications
      .filter((notice) => notice.accountId === "daniel")
      .every((notice) => notice.read),
  );
  state = applyMarketAction(state, { type: "account", id: seller });
  const product = { ...products.find((entry) => entry.id === support), name: "Nombre actualizado" };
  state = applyMarketAction(state, { type: "publish", product });
  assert.equal(state.products.find((entry) => entry.id === support).name, "Nombre actualizado");
  assert.equal(applyMarketAction(state, { type: "moderate", id: support }), state);
  state = applyMarketAction(state, { type: "account", id: "admin" });
  state = applyMarketAction(state, { type: "moderate", id: support });
  assert.equal(state.products.find((entry) => entry.id === support).hidden, true);
});

test("la calculadora convierte unidades y obtiene el margen respecto del precio", () => {
  const result = calculateCosts(exampleCosts);
  assert.equal(result.hours, 3.5);
  assert.deepEqual(
    result.amounts.map(({ value }) => value),
    [60, 2.28, 12.25, 9, 55, 18],
  );
  assert.equal(result.total, 156.53);
  assert.equal(result.suggested, 250.45);
  assert.equal(result.profit, 93.92);
  assert.equal(result.margin.toFixed(1), "37.5");
  assert.equal(calculateCosts({ ...exampleCosts, life: "" }), null);
  assert.equal(calculateCosts({ ...exampleCosts, minutes: "60" }), null);
});
