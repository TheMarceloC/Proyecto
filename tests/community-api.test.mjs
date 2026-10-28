import { test } from "node:test";
import assert from "node:assert/strict";
import server from "../.vercel/output/functions/__server.func/index.mjs";

test("API: compras individuales, archivos privados y límites de autorización", async () => {
  const originalFetch = globalThis.fetch;
  const names = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
  ];
  const originalEnv = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const a = "11111111-1111-4111-8111-111111111111",
    b = "22222222-2222-4222-8222-222222222222",
    staff = "33333333-3333-4333-8333-333333333333",
    designId = "44444444-4444-4444-8444-444444444444";
  const users = {
    alice: { id: a, email: "alice@example.com" },
    bob: { id: b, email: "bob@example.com" },
    staff: { id: staff, email: "staff@example.com" },
  };
  let signed = 0;
  let paid = false;
  let receivedPurchase;
  let receivedQuote;
  const call = (path, token, body, origin = "https://protolab.test") =>
    server.fetch(
      new Request("https://protolab.test/api/" + path, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          ...(token ? { cookie: "pl_access=" + token } : {}),
          ...(body === undefined ? {} : { "content-type": "application/json", origin }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
      {},
    );
  try {
    names.forEach((name) => delete process.env[name]);
    assert.deepEqual(await (await call("session")).json(), { configured: false, user: null });
    assert.equal((await call("quotes", "", {})).status, 503);
    assert.equal((await (await call("quotes", "", {})).json()).configured, false);
    assert.deepEqual(await (await call("designs")).json(), []);
    assert.equal((await call("uploads", "", {})).status, 503);
    process.env["SUPABASE_URL"] = "URL-inválida";
    process.env["SUPABASE_PUBLISHABLE_KEY"] = "test-publishable";
    process.env["SUPABASE_SECRET_KEY"] = "test-secret";
    assert.deepEqual(await (await call("session")).json(), { configured: false, user: null });
    assert.equal((await call("auth/signup", "", {})).status, 503);
    delete process.env["SUPABASE_PUBLISHABLE_KEY"];
    delete process.env["SUPABASE_SECRET_KEY"];
    assert.equal(
      (await call("download", "", { id: designId }, "https://evil.example")).status,
      403,
    );
    process.env["SUPABASE_URL"] = "https://storage.example.test";
    process.env["SUPABASE_ANON_KEY"] = "unit-test-anon";
    process.env["SUPABASE_SERVICE_ROLE_KEY"] = "unit-test-service";
    globalThis.fetch = async (input, init = {}) => {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      const headers = new Headers(
        init.headers || (input instanceof Request ? input.headers : undefined),
      );
      const token = (headers.get("authorization") || "").replace("Bearer ", "");
      const user = users[token];
      const json = (data) =>
        new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });
      if (url.pathname === "/auth/v1/user")
        return user
          ? json(user)
          : new Response(JSON.stringify({ message: "invalid token" }), { status: 401 });
      if (url.pathname === "/rest/v1/profiles")
        return json({ display_name: token, is_admin: token === "staff" });
      if (url.pathname === "/rest/v1/design_purchases")
        return json(
          paid &&
            url.searchParams.get("design_id") === "eq." + designId &&
            url.searchParams.get("owner_id") === "eq." + b
            ? [{ id: "66666666-6666-4666-8666-666666666666", design_id: designId, status: "paid" }]
            : [],
        );
      if (url.pathname === "/rest/v1/rpc/request_design_purchase") {
        receivedPurchase = JSON.parse(init.body);
        return json({
          id: "66666666-6666-4666-8666-666666666666",
          design_id: designId,
          amount: 250,
          status: "pending",
        });
      }
      if (url.pathname === "/rest/v1/quotes") {
        receivedQuote = JSON.parse(init.body);
        return json({ id: "55555555-5555-4555-8555-555555555555", code: "PL-IDEA-TEST" });
      }
      if (url.pathname === "/rest/v1/designs") {
        let rows;
        if (url.searchParams.has("owner_id"))
          rows = url.searchParams.get("owner_id") === "eq." + a ? [{ id: designId }] : [];
        else
          rows = [
            {
              id: url.searchParams.get("id")?.slice(3) || designId,
              owner_id:
                url.searchParams.get("id") === "eq.88888888-8888-4888-8888-888888888888" ? b : a,
              status: "approved",
              file_path: a + "/part.stl",
              image_path: null,
              title: "Diseño público",
            },
          ];
        return json(headers.get("accept")?.includes("vnd.pgrst.object") ? rows[0] : rows);
      }
      if (url.pathname.startsWith("/storage/v1/object/sign/")) {
        signed++;
        return json({ signedURL: "/object/sign/design-files/part.stl?token=test" });
      }
      throw new Error("Unexpected network call: " + url.pathname);
    };
    assert.equal((await call("admin")).status, 401, "Administración requiere cuenta");
    assert.equal(
      (await call("quotes", "", { project: "Visitante" })).status,
      401,
      "Solo guardar exige cuenta",
    );
    assert.equal((await call("admin", "bob")).status, 403, "Ser usuario no concede administración");
    assert.equal((await call("download", "", { id: designId })).status, 401);
    assert.equal(
      (await call("download", "bob", { id: designId, canDownload: true, isAdmin: true })).status,
      403,
      "No se confían flags del navegador",
    );
    assert.equal(signed, 0, "No se firma ninguna descarga bloqueada");
    assert.equal(
      (await call("download", "alice", { id: designId })).status,
      200,
      "El autor puede descargar su propio archivo",
    );
    assert.equal(signed, 1);
    assert.equal(
      (await call("download", "alice", { id: "88888888-8888-4888-8888-888888888888" })).status,
      403,
      "Ser autor de un diseño aprobado no concede acceso al de otro creador",
    );
    assert.equal(signed, 1);
    const session = await (await call("session", "bob")).json();
    assert.equal(session.user.canDownload, undefined, "No existe desbloqueo global");
    const alice = await (await call("session", "alice")).json();
    assert.equal(alice.user.canDownload, undefined);
    assert.equal((await call("purchases", "", { design_id: designId })).status, 401);
    assert.equal(
      (
        await call("admin/purchase", "bob", {
          id: designId,
          status: "paid",
          reference: "fake-payment",
        })
      ).status,
      403,
    );
    assert.equal(
      (await call("purchases", "bob", { design_id: designId })).status,
      400,
      "Comprar requiere aceptar licencia",
    );
    const purchase = await call("purchases", "bob", {
      design_id: designId,
      accepted_license: "Uso personal · ProtoLab v1",
      amount: 1,
      status: "paid",
    });
    assert.equal(purchase.status, 201);
    assert.equal((await purchase.json()).amount, 250);
    assert.deepEqual(
      receivedPurchase,
      { p_design_id: designId },
      "El servidor ignora precio y estado del navegador",
    );
    assert.equal(
      (await call("download", "bob", { id: designId })).status,
      403,
      "Solicitar compra no habilita descarga",
    );
    paid = true;
    assert.equal(
      (await call("download", "bob", { id: designId })).status,
      200,
      "Pago de este diseño permite descargar",
    );
    assert.equal(signed, 2);
    assert.equal(
      (await call("download", "bob", { id: "77777777-7777-4777-8777-777777777777" })).status,
      403,
      "Pagar otro diseño no concede acceso global",
    );
    paid = false;
    assert.equal(
      (await call("download", "bob", { id: designId })).status,
      403,
      "Una compra revocada deja de permitir descargas",
    );
    assert.equal(signed, 2);
    assert.equal(
      (await call("download", "staff", { id: designId })).status,
      200,
      "Equipo puede revisar el archivo",
    );
    const visitor = await (await call("designs")).json();
    assert.equal(visitor.length, 1, "Los diseños aprobados se pueden ver sin cuenta");
    assert.equal(
      (
        await call("uploads", "alice", {
          name: "malware.exe",
          size: 100,
          type: "application/octet-stream",
          kind: "design",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call("uploads", "alice", {
          name: "archivo.stl",
          size: 999999999,
          type: "application/octet-stream",
          kind: "design",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call("uploads", "alice", {
          name: "preview.svg",
          size: 100,
          type: "image/svg+xml",
          kind: "preview",
        })
      ).status,
      400,
    );
    assert.equal(
      (await call("quotes", "bob", { project: "Incomplete" })).status,
      400,
      "No se aceptan solicitudes incompletas",
    );
    const ideaResponse = await call("quotes", "bob", {
      project: "Soporte para mi celular",
      material: "PETG",
      quantity: 1,
      priority: "Normal",
      client_name: "Bob",
      email: "bob@example.com",
      phone: "99999999",
      city: "San Pedro Sula",
      detail: "Me gustaría un soporte para poner mi celular sobre el escritorio.",
      file_path: null,
      design_id: null,
      specifications: {
        start: "idea",
        materialSelection: "auto",
        materialEstimate: { gramsPerPiece: null, assumedWeight: false },
        printing: { hours: null },
      },
    });
    assert.equal(
      ideaResponse.status,
      201,
      "Una idea se puede cotizar sin archivo, peso ni tiempo de impresión",
    );
    assert.equal((await ideaResponse.json()).code, "PL-IDEA-TEST");
    assert.equal(receivedQuote.file_path, null);
    assert.equal(receivedQuote.specifications.materialEstimate.gramsPerPiece, null);
    assert.equal(receivedQuote.specifications.printing.hours, null);
    assert.equal(receivedQuote.price, undefined, "La solicitud no inventa un precio aprobado");
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      if (originalEnv[name] === undefined) delete process.env[name];
      else process.env[name] = originalEnv[name];
    }
  }
});
