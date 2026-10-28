import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("Comercio SQL: licencias anteriores, precios, aislamiento y verificación de pagos", async () => {
  const db = new PGlite();
  const alice = "11111111-1111-4111-8111-111111111111",
    bob = "22222222-2222-4222-8222-222222222222",
    staff = "33333333-3333-4333-8333-333333333333";
  async function login(id) {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec("set role authenticated");
  }
  const request = async (id) =>
    (await db.query("select to_jsonb(public.request_design_purchase($1)) as purchase", [id]))
      .rows[0].purchase;
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role;
      create schema auth; create schema storage;
      create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      create function auth.role() returns text language sql stable as $$select current_user::text$$;
      grant usage on schema auth to anon,authenticated;
      grant execute on function auth.uid(),auth.role() to anon,authenticated;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    `);
    await db.exec(
      await readFile(
        new URL("../supabase/migrations/202610170001_community.sql", import.meta.url),
        "utf8",
      ),
    );
    for (const [id, name] of [
      [alice, "Alice"],
      [bob, "Bob"],
      [staff, "Staff"],
    ])
      await db.query("insert into auth.users values($1,$2)", [
        id,
        JSON.stringify({ display_name: name }),
      ]);
    await db.query("update public.profiles set is_admin=true where id=$1", [staff]);
    const legacy = (
      await db.query(
        "insert into public.designs(owner_id,author_name,title,description,category,material,license,file_path,image_path,status) values($1,'Alice','Anterior','Una descripción suficientemente extensa del diseño anterior.','Mecánica','PLA','CC BY 4.0','legacy.stl','legacy.png','approved') returning id",
        [alice],
      )
    ).rows[0].id;
    await db.exec(
      await readFile(
        new URL("../supabase/migrations/202610270001_design_commerce.sql", import.meta.url),
        "utf8",
      ),
    );
    assert.deepEqual(
      (
        await db.query(
          "select status,license,price,commercial_consent from public.designs where id=$1",
          [legacy],
        )
      ).rows[0],
      { status: "pending", license: "CC BY 4.0", price: null, commercial_consent: false },
      "No se inventa consentimiento ni se cambia una licencia anterior",
    );
    await login(staff);
    await assert.rejects(
      db.query(
        "update public.designs set status='approved',price=100,commercial_reviewed=true where id=$1",
        [legacy],
      ),
      /check constraint/,
    );
    await login(alice);
    const reserve = async (kind, ext) =>
      (await db.query("select public.reserve_upload($1,$2,1000) as ticket", [kind, ext])).rows[0]
        .ticket.path;
    const file = await reserve("design", "stl"),
      image = await reserve("preview", "png");
    const values = [
      alice,
      "Alice",
      "Soporte original",
      "Una descripción completa de una pieza original para montaje.",
      "Mecánica",
      "PLA",
      "Uso personal · ProtoLab v1",
      file,
      image,
      "intermediate",
      "Modelado y ajuste de encajes con tres componentes.",
      250,
      true,
      "Autorizo venta de archivos y fabricación; compensación a acordar por escrito.",
    ];
    const insertion =
      "insert into public.designs(owner_id,author_name,title,description,category,material,license,file_path,image_path,complexity,complexity_notes,proposed_price,commercial_consent,sales_agreement) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) returning id";
    const designId = (await db.query(insertion, values)).rows[0].id;
    assert.equal(
      (
        await db.query(
          "update public.designs set status='approved',price=1 where id=$1 returning id",
          [designId],
        )
      ).rows.length,
      0,
      "El creador no aprueba su precio",
    );
    await login(bob);
    assert.equal((await db.query("select id from public.designs")).rows.length, 0);
    await assert.rejects(db.query(insertion, values), /row-level security/);
    await assert.rejects(
      db.query("select sales_agreement from public.designs"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select proposed_price,review_note from public.designs"),
      /permission denied/,
      "Precios propuestos y notas internas privados",
    );
    await assert.rejects(request(designId), /Design unavailable/);
    await login(staff);
    await assert.rejects(
      db.query(
        "update public.designs set status='approved',price=0,commercial_reviewed=true where id=$1",
        [designId],
      ),
      /check constraint/,
    );
    await assert.rejects(
      db.query("update public.designs set status='approved',price=250 where id=$1", [designId]),
      /check constraint/,
    );
    await db.query(
      "update public.designs set status='approved',price=250,commercial_reviewed=true,review_note='Archivo y acuerdo revisados con el creador' where id=$1",
      [designId],
    );
    await db.exec("reset role; select set_config('request.jwt.claim.sub','',false); set role anon");
    assert.equal((await db.query("select id,price,complexity from public.designs")).rows.length, 1);
    await assert.rejects(db.query("select * from public.design_purchases"), /permission denied/);
    await assert.rejects(request(designId), /permission denied/);
    await login(alice);
    await assert.rejects(request(designId), /Own design/);
    await login(bob);
    const p = await request(designId);
    assert.equal(p.amount, 250);
    assert.equal(p.license, "Uso personal · ProtoLab v1");
    assert.equal(p.status, "pending");
    assert.equal((await request(designId)).id, p.id, "No se duplican compras");
    await assert.rejects(
      db.query("update public.design_purchases set status='paid' where id=$1", [p.id]),
      /permission denied/,
    );
    await assert.rejects(
      db.query(
        "insert into public.design_purchases(owner_id,design_id,design_title,amount,license) values($1,$2,'Hack',1,'Hack')",
        [bob, designId],
      ),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select public.review_design_purchase($1,'paid','FAKE-1')", [p.id]),
      /Admin required/,
    );
    await login(alice);
    assert.equal((await db.query("select id from public.design_purchases")).rows.length, 0);
    await login(staff);
    await db.query("update public.designs set price=400 where id=$1", [designId]);
    await login(bob);
    assert.equal((await request(designId)).amount, 250, "Se conserva precio de solicitud");
    await login(staff);
    await db.query("select public.review_design_purchase($1,'paid','BANK-001')", [p.id]);
    await db.query("select public.review_design_purchase($1,'paid','BANK-001')", [p.id]);
    await db.exec("reset role");
    assert.equal(
      (await db.query("select * from public.purchase_events")).rows.length,
      1,
      "Verificación idempotente y auditada",
    );
    const second = (
      await db.query(
        "insert into public.designs(owner_id,author_name,title,description,category,material,license,file_path,image_path,status,complexity_notes,price,proposed_price,commercial_consent,commercial_reviewed,sales_agreement) values($1,'Alice','Otro diseño','Una descripción suficientemente extensa del segundo diseño.','Mecánica','PLA','Uso personal · ProtoLab v1','second.stl','second.png','approved','Trabajo de modelado suficientemente documentado',500,500,true,true,'Condiciones comerciales acordadas y verificadas') returning id",
        [alice],
      )
    ).rows[0].id;
    await login(bob);
    const p2 = await request(second);
    assert.equal(
      (
        await db.query(
          "select id from public.design_purchases where design_id=$1 and status='paid'",
          [designId],
        )
      ).rows.length,
      1,
    );
    assert.equal(
      (
        await db.query(
          "select id from public.design_purchases where design_id=$1 and status='paid'",
          [second],
        )
      ).rows.length,
      0,
      "Comprar uno no habilita otros",
    );
    await login(staff);
    await assert.rejects(
      db.query("select public.review_design_purchase($1,'paid','BANK-001')", [p2.id]),
      /unique constraint/,
    );
    await db.query("select public.review_design_purchase($1,'revoked','REVIEW-001')", [p.id]);
    await login(bob);
    assert.equal(
      (
        await db.query(
          "select id from public.design_purchases where design_id=$1 and status='paid'",
          [designId],
        )
      ).rows.length,
      0,
    );
    assert.equal(
      (await request(designId)).status,
      "revoked",
      "No se sortea revocación creando otra compra",
    );
  } finally {
    await db.close();
  }
});
