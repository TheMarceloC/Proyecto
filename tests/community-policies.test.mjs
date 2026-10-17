import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("Políticas de comunidad: lectura pública, moderación y aislamiento de pedidos", async () => {
  const db = new PGlite();
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
    const alice = "11111111-1111-4111-8111-111111111111",
      bob = "22222222-2222-4222-8222-222222222222",
      staff = "33333333-3333-4333-8333-333333333333";
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
    async function login(id) {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
      await db.exec("set role authenticated");
    }
    async function reserve(kind, ext) {
      const r = await db.query("select public.reserve_upload($1,$2,1000) as ticket", [kind, ext]);
      return r.rows[0].ticket.path;
    }
    await login(alice);
    assert.equal((await db.query("select * from public.profiles")).rows.length, 1);
    await assert.rejects(
      db.query("update public.profiles set is_admin=true where id=$1", [alice]),
      /permission denied/,
    );
    const file = await reserve("design", "stl"),
      image = await reserve("preview", "png");
    const values = [
      alice,
      "Alice",
      "Soporte original",
      "Una descripción de más de cuarenta caracteres para este diseño original.",
      "Mecánica",
      "PLA",
      "CC BY 4.0",
      file,
      image,
    ];
    const insertion =
      "insert into public.designs(owner_id,author_name,title,description,category,material,license,file_path,image_path) values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id";
    const designId = (await db.query(insertion, values)).rows[0].id;
    assert.equal(
      (
        await db.query("select * from public.designs where owner_id=$1 and status='approved'", [
          alice,
        ])
      ).rows.length,
      0,
    );
    assert.equal(
      (
        await db.query("update public.designs set status='approved' where id=$1 returning id", [
          designId,
        ])
      ).rows.length,
      0,
      "Un creador no puede aprobar su diseño",
    );
    await login(bob);
    assert.equal(
      (await db.query("select * from public.designs")).rows.length,
      0,
      "Los pendientes son privados",
    );
    await assert.rejects(
      db.query(insertion, values),
      /row-level security/,
      "No se puede suplantar al autor",
    );
    await login(staff);
    await db.query(
      "update public.designs set status='approved',review_note='Archivo revisado por el equipo' where id=$1",
      [designId],
    );
    await db.exec("reset role; select set_config('request.jwt.claim.sub','',false); set role anon");
    assert.equal(
      (await db.query("select * from public.designs")).rows.length,
      1,
      "El visitante puede ver los publicados",
    );
    await assert.rejects(db.query("select * from public.quotes"), /permission denied/);
    await login(bob);
    assert.equal(
      (
        await db.query("select id from public.designs where owner_id=$1 and status='approved'", [
          bob,
        ])
      ).rows.length,
      0,
      "Ver diseños no desbloquea descargas",
    );
    const q = (
      await db.query(
        "insert into public.quotes(owner_id,project,material,quantity,priority,client_name,email,phone,city,detail) values($1,'Proyecto propio','PLA',1,'Normal','Bob','bob@example.com','12345678','SPS','Una solicitud de fabricación real') returning id",
        [bob],
      )
    ).rows[0].id;
    await assert
      .rejects(
        db.query("update public.quotes set price=1 where id=$1", [q]),
        /permission denied|row-level security/,
      )
      .catch(async () => {
        assert.equal(
          (await db.query("select price from public.quotes where id=$1", [q])).rows[0].price,
          null,
        );
      });
    await login(alice);
    assert.equal(
      (await db.query("select * from public.quotes")).rows.length,
      0,
      "Cada pedido es privado",
    );
    assert.equal(
      (
        await db.query("select id from public.designs where owner_id=$1 and status='approved'", [
          alice,
        ])
      ).rows.length,
      1,
    );
    await login(staff);
    await db.query("update public.designs set status='rejected' where id=$1", [designId]);
    await login(alice);
    assert.equal(
      (
        await db.query("select id from public.designs where owner_id=$1 and status='approved'", [
          alice,
        ])
      ).rows.length,
      0,
      "Retirar el único aprobado revoca la elegibilidad",
    );
    await assert.rejects(
      db.query("select public.reserve_upload('preview','svg',1000)"),
      /Invalid preview/,
    );
    await assert.rejects(
      db.query("select public.reserve_upload('design','exe',1000)"),
      /Invalid design/,
    );
    await assert.rejects(
      db.query("select public.reserve_upload('design','stl',999999999)"),
      /Invalid upload/,
    );
    for (let i = 0; i < 18; i++) await reserve("quote", "stl");
    await assert.rejects(
      db.query("select public.reserve_upload('quote','stl',1000)"),
      /Daily upload limit/,
    );
  } finally {
    await db.close();
  }
});
