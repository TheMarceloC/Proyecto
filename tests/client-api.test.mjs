import { test } from "node:test";
import assert from "node:assert/strict";
import { api, CommunityApiError } from "../src/lib/community.ts";

test("cliente API: servicio sin configurar, respuesta no JSON y conexión caída se convierten en errores controlados", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({ configured: false, user: null });
    assert.deepEqual(await api("session"), { configured: false, user: null });
    globalThis.fetch = async () =>
      Response.json(
        { configured: false, error: "Envío temporalmente no disponible" },
        { status: 503 },
      );
    await assert.rejects(
      api("quotes", {}),
      (e) =>
        e instanceof CommunityApiError &&
        e.status === 503 &&
        e.configured === false &&
        e.message === "Envío temporalmente no disponible",
    );
    globalThis.fetch = async () => new Response("<html>Bad gateway</html>", { status: 502 });
    await assert.rejects(
      api("session"),
      (e) =>
        e instanceof CommunityApiError &&
        e.status === 502 &&
        !e.message.includes("Unexpected token"),
    );
    globalThis.fetch = async () => {
      throw new TypeError("Failed to fetch");
    };
    await assert.rejects(
      api("session"),
      (e) => e instanceof CommunityApiError && e.status === 0 && e.message.includes("conectar"),
    );
  } finally {
    globalThis.fetch = original;
  }
});
