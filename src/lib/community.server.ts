import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { DESIGN_LICENSE } from "./design-commerce";

const designFields =
  "id,owner_id,title,description,category,material,license,author_name,image_path,status,created_at,complexity,complexity_notes,price";
const ownerDesignFields =
  "id,owner_id,title,description,category,material,license,author_name,image_path,status,review_note,created_at,complexity,complexity_notes,proposed_price,price,commercial_consent,commercial_reviewed";
const uuid = z.string().uuid();
const text = (max: number) => z.string().trim().min(1).max(max);
const credentials = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  name: text(60).optional(),
});
// Variables exclusivamente del servidor (también en Vercel, seguido de redeploy):
// SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY y SUPABASE_SECRET_KEY.
// La secret nunca debe exponerse mediante VITE_* ni enviarse al navegador.
// Legacy anon/service_role se admiten para proyectos anteriores.
const publicKey = () => process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_ANON_KEY"];
const secretKey = () =>
  process.env["SUPABASE_SECRET_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"];
const configured = () => {
  try {
    const url = new URL(process.env["SUPABASE_URL"] || "");
    return (
      ["https:", "http:"].includes(url.protocol) &&
      Boolean(publicKey()?.trim() && secretKey()?.trim())
    );
  } catch {
    return false;
  }
};
function clients() {
  const url = process.env["SUPABASE_URL"]!;
  const anon = publicKey()!;
  const options = {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  };
  return {
    url,
    anon,
    options,
    admin: createClient(url, secretKey()!, options),
    auth: createClient(url, anon, options),
  };
}
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
function checked<T>(result: {
  data: T;
  error: { message: string; code?: string } | null;
}): NonNullable<T> {
  if (result.error) {
    if (result.error.message.includes("Daily submission limit"))
      throw new ApiError(429, "Alcanzaste el límite diario de solicitudes. Intenta mañana.");
    if (result.error.message.includes("Daily upload limit"))
      throw new ApiError(429, "Alcanzaste el límite diario de archivos. Intenta mañana.");
    if (result.error.message.includes("Design unavailable"))
      throw new ApiError(409, "El diseño ya no está disponible para la compra.");
    if (result.error.message.includes("Own design"))
      throw new ApiError(400, "Puedes descargar tu propio diseño sin comprarlo.");
    if (result.error.message.includes("Invalid payment transition"))
      throw new ApiError(
        409,
        "El estado de la compra cambió. Actualiza la lista antes de continuar.",
      );
    console.error("Supabase:", result.error.code, result.error.message);
    throw new ApiError(
      400,
      "No se pudo guardar o consultar la información. Revisa los datos e intenta de nuevo.",
    );
  }
  if (result.data == null) throw new ApiError(404, "El registro no está disponible.");
  return result.data;
}
export async function communityApi(request: Request): Promise<Response> {
  const cookies: string[] = [];
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\//, "").replace(/\/$/, "");
  const json = (data: unknown, status = 200) => {
    const headers = new Headers({
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    });
    cookies.forEach((cookie) => headers.append("set-cookie", cookie));
    return new Response(JSON.stringify(data), { status, headers });
  };
  const cookie = (name: string, value: string, maxAge: number) =>
    cookies.push(
      name +
        "=" +
        encodeURIComponent(value) +
        "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" +
        maxAge +
        (url.protocol === "https:" ? "; Secure" : ""),
    );
  const setSession = (session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }) => {
    cookie("pl_access", session.access_token, session.expires_in);
    cookie("pl_refresh", session.refresh_token, 60 * 60 * 24 * 30);
  };
  try {
    if (!["GET", "POST"].includes(request.method)) throw new ApiError(405, "Método no permitido.");
    if (request.method === "POST") {
      // Las mutaciones con cookies solo se aceptan desde el origen de la aplicación.
      if (request.headers.get("origin") !== url.origin)
        throw new ApiError(403, "Origen de la solicitud no permitido.");
      if (!request.headers.get("content-type")?.startsWith("application/json"))
        throw new ApiError(415, "Se requiere JSON.");
    }
    if (route === "session" && !configured()) return json({ configured: false, user: null });
    if (
      route === "designs" &&
      request.method === "GET" &&
      url.searchParams.get("mine") !== "1" &&
      !configured()
    )
      return json([]);
    if (!configured())
      return json(
        {
          configured: false,
          error:
            "El envío de solicitudes y el acceso a cuentas no están disponibles ahora. Puedes seguir explorando y estimando tu pieza.",
        },
        503,
      );
    const { auth, admin, anon, options } = clients();
    const rawCookies = Object.fromEntries(
      (request.headers.get("cookie") || "")
        .split(";")
        .filter(Boolean)
        .map((value) => {
          const i = value.indexOf("=");
          return [value.slice(0, i).trim(), decodeURIComponent(value.slice(i + 1))];
        }),
    );
    let access = rawCookies["pl_access"];
    let user = access ? (await auth.auth.getUser(access)).data.user : null;
    if (!user && rawCookies["pl_refresh"]) {
      const refreshed = await auth.auth.refreshSession({ refresh_token: rawCookies["pl_refresh"] });
      if (refreshed.data.session && refreshed.data.user) {
        setSession(refreshed.data.session);
        access = refreshed.data.session.access_token;
        user = refreshed.data.user;
      } else {
        cookie("pl_access", "", 0);
        cookie("pl_refresh", "", 0);
      }
    }
    const db = createClient(process.env["SUPABASE_URL"]!, anon, {
      ...options,
      global: { headers: access ? { Authorization: "Bearer " + access } : {} },
    });
    const profile = user
      ? checked(
          await db.from("profiles").select("display_name,is_admin").eq("id", user.id).single(),
        )
      : null;
    const isAdmin = profile?.is_admin === true;
    const requireUser = () => {
      if (!user) throw new ApiError(401, "Inicia sesión para continuar.");
      return user;
    };
    const requireAdmin = () => {
      requireUser();
      if (!isAdmin) throw new ApiError(403, "Acceso reservado al equipo de ProtoLab.");
    };
    const body = async () => {
      const raw = await request.text();
      if (raw.length > 30000) throw new ApiError(413, "La solicitud es demasiado grande.");
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        throw new ApiError(400, "La solicitud no es válida.");
      }
    };
    const verifiedFile = async (path: string | null | undefined, kind: string) => {
      if (!path) return null;
      requireUser();
      const ticket = checked(
        await db
          .from("upload_tickets")
          .select("path,bucket,bytes")
          .eq("path", path)
          .eq("kind", kind)
          .single(),
      );
      if (!ticket) throw new ApiError(400, "Adjunto no válido.");
      const info = await admin.storage.from(ticket.bucket).info(path);
      if (info.error || !info.data)
        throw new ApiError(400, "El archivo no terminó de cargarse. Vuelve a adjuntarlo.");
      if (info.data.size !== Number(ticket.bytes)) {
        await admin.storage.from(ticket.bucket).remove([path]);
        throw new ApiError(
          400,
          "El archivo guardado no coincide con el tamaño indicado. Vuelve a cargarlo.",
        );
      }
      return path;
    };
    const decorate = async <T extends { image_path?: string | null }>(row: T) => ({
      ...row,
      image_url: row.image_path
        ? checked(await admin.storage.from("design-previews").createSignedUrl(row.image_path, 3600))
            .signedUrl
        : null,
    });
    if (route === "auth/login" && request.method === "POST") {
      const input = credentials.parse(await body());
      const result = await auth.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (result.error || !result.data.session)
        throw new ApiError(
          401,
          "No pudimos iniciar sesión. Comprueba correo, contraseña y confirmación del correo.",
        );
      setSession(result.data.session);
      return json({ ok: true });
    }
    if (route === "auth/signup" && request.method === "POST") {
      // Producción: conectar un SMTP propio en Supabase Auth para confirmaciones.
      // https://supabase.com/docs/guides/auth/auth-smtp
      // El SMTP de Auth no envía automáticamente correos de cotizaciones.
      const input = credentials.extend({ name: text(60) }).parse(await body());
      const result = await auth.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: { display_name: input.name },
          emailRedirectTo: url.origin + "/cuenta",
        },
      });
      if (result.error)
        throw new ApiError(
          400,
          "No se pudo crear la cuenta. Revisa los datos o intenta más tarde.",
        );
      if (result.data.session) setSession(result.data.session);
      return json({ ok: true, confirmationRequired: !result.data.session });
    }
    if (route === "auth/logout" && request.method === "POST") {
      if (access) await admin.auth.admin.signOut(access, "local");
      cookie("pl_access", "", 0);
      cookie("pl_refresh", "", 0);
      return json({ ok: true });
    }
    if (route === "session" && request.method === "GET") {
      return json({
        configured: true,
        user: user
          ? {
              id: user.id,
              email: user.email,
              name: profile?.display_name || "Creador",
              isAdmin,
            }
          : null,
      });
    }
    if (route === "designs" && request.method === "GET") {
      if (url.searchParams.get("mine") === "1") {
        const member = requireUser();
        // Las notas de revisión y el precio propuesto son privados. El filtro de identidad
        // es obligatorio al usar el cliente de servicio para recuperar estos campos.
        const rows = checked(
          await admin
            .from("designs")
            .select(ownerDesignFields)
            .eq("owner_id", member.id)
            .order("created_at", { ascending: false })
            .limit(100),
        );
        return json(await Promise.all(rows.map(decorate)));
      }
      const query = db
        .from("designs")
        .select(designFields)
        .order("created_at", { ascending: false })
        .limit(100);
      return json(await Promise.all(checked(await query.eq("status", "approved")).map(decorate)));
    }
    const detailMatch = route.match(/^designs\/([0-9a-f-]+)$/);
    if (detailMatch && request.method === "GET") {
      const id = uuid.parse(detailMatch[1]);
      const design = checked(
        await db.from("designs").select(designFields).eq("id", id).maybeSingle(),
      );
      if (!design) throw new ApiError(404, "Este diseño no está disponible.");
      return json(await decorate(design));
    }
    if (route === "uploads" && request.method === "POST") {
      requireUser();
      const input = z
        .object({
          name: text(180),
          size: z
            .number()
            .int()
            .min(1)
            .max(50 * 1024 * 1024),
          type: z.string().max(100),
          kind: z.enum(["design", "preview", "quote"]),
        })
        .parse(await body());
      const ext = input.name.split(".").pop()?.toLowerCase() || "";
      const allowed =
        input.kind === "preview"
          ? ["jpg", "jpeg", "png", "webp"]
          : input.kind === "design"
            ? ["stl", "obj", "3mf", "step", "stp"]
            : [
                "stl",
                "obj",
                "3mf",
                "step",
                "stp",
                "jpg",
                "jpeg",
                "png",
                "webp",
                "pdf",
                "dxf",
                "dwg",
              ];
      if (!allowed.includes(ext) || (input.kind === "preview" && input.size > 5 * 1024 * 1024))
        throw new ApiError(400, "Formato o tamaño de archivo no permitido.");
      const reservation = checked(
        await db.rpc("reserve_upload", {
          p_kind: input.kind,
          p_extension: ext,
          p_bytes: input.size,
        }),
      ) as { path: string; bucket: string };
      const signed = checked(
        await admin.storage
          .from(reservation.bucket)
          .createSignedUploadUrl(reservation.path, { upsert: false }),
      );
      return json({ path: reservation.path, url: signed.signedUrl });
    }
    if (route === "designs" && request.method === "POST") {
      const member = requireUser();
      const input = z
        .object({
          title: text(100),
          description: z.string().trim().min(40).max(4000),
          category: z.enum([
            "Organización",
            "Mecánica",
            "Electrónica",
            "Hogar",
            "Arte y accesorios",
            "Educación",
          ]),
          material: z.enum(["PLA", "PETG", "ABS", "TPU"]),
          license: z.literal(DESIGN_LICENSE),
          complexity: z.enum(["basic", "intermediate", "advanced"]),
          complexity_notes: z.string().trim().min(20).max(2000),
          proposed_price: z.number().int().min(1).max(1000000),
          commercial_consent: z.literal(true),
          sales_agreement: z.string().trim().min(20).max(2000),
          file_path: text(300),
          image_path: text(300),
          rights: z.literal(true),
        })
        .parse(await body());
      const file = await verifiedFile(input.file_path, "design");
      const image = await verifiedFile(input.image_path, "preview");
      const { rights: _rights, ...values } = input;
      return json(
        checked(
          await db
            .from("designs")
            .insert({
              ...values,
              file_path: file,
              image_path: image,
              owner_id: member.id,
              author_name: profile?.display_name || "Creador",
            })
            .select("id")
            .single(),
        ),
        201,
      );
    }
    if (route === "download" && request.method === "POST") {
      const member = requireUser();
      const { id } = z.object({ id: uuid }).parse(await body());
      const design = checked(
        await db.from("designs").select("id,file_path,status,owner_id").eq("id", id).maybeSingle(),
      );
      if (!design || (design.status !== "approved" && !isAdmin))
        throw new ApiError(404, "El diseño no está disponible.");
      if (!isAdmin && design.owner_id !== member.id) {
        const purchase = checked(
          await db
            .from("design_purchases")
            .select("id")
            .eq("owner_id", member.id)
            .eq("design_id", id)
            .eq("status", "paid")
            .limit(1),
        );
        if (!purchase.length)
          throw new ApiError(
            403,
            "Compra este diseño y espera la confirmación del pago para descargarlo.",
          );
      }
      // El archivo permanece privado. La URL solo se firma después de comprobar la regla en el servidor.
      return json({
        url: checked(
          await admin.storage
            .from("design-files")
            .createSignedUrl(design.file_path, 60, { download: true }),
        ).signedUrl,
      });
    }
    if (route === "purchases" && request.method === "GET") {
      const member = requireUser();
      let query = db
        .from("design_purchases")
        .select("id,owner_id,design_id,design_title,amount,currency,license,status,created_at")
        .eq("owner_id", member.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (url.searchParams.has("design"))
        query = query.eq("design_id", uuid.parse(url.searchParams.get("design")));
      return json(checked(await query));
    }
    if (route === "purchases" && request.method === "POST") {
      requireUser();
      const input = z
        .object({ design_id: uuid, accepted_license: z.literal(DESIGN_LICENSE) })
        .parse(await body());
      // La función SQL captura precio y licencia publicados; nunca acepta importe ni estado del cliente.
      return json(
        checked(await db.rpc("request_design_purchase", { p_design_id: input.design_id }).single()),
        201,
      );
    }
    if (route === "quotes" && request.method === "POST") {
      // Persistencia únicamente: para correos reales de solicitudes se requiere
      // un envío transaccional del servidor (SMTP/proveedor), remitente validado
      // y reintentos/idempotencia. Configurar SMTP de Auth no implementa ese envío.
      const member = requireUser();
      const input = z
        .object({
          project: text(120),
          material: z.enum(["PLA", "PETG", "ABS", "TPU"]),
          quantity: z.number().int().min(1).max(1000),
          priority: z.enum(["Normal", "Urgente"]),
          client_name: text(100),
          email: z.string().email().max(254),
          phone: text(30),
          city: text(100),
          detail: z.string().trim().max(4000),
          file_path: text(300).nullable().optional(),
          design_id: uuid.nullable().optional(),
          specifications: z
            .record(z.unknown())
            .refine((value) => JSON.stringify(value).length <= 6000),
        })
        .parse(await body());
      const file = await verifiedFile(input.file_path, "quote");
      if (input.design_id) {
        const design = checked(
          await db
            .from("designs")
            .select("id")
            .eq("id", input.design_id)
            .eq("status", "approved")
            .maybeSingle(),
        );
        if (!design) throw new ApiError(400, "Selecciona un diseño publicado.");
      }
      if (!file && !input.design_id && input.detail.length < 20)
        throw new ApiError(
          400,
          "Adjunta un archivo o describe tu proyecto con al menos 20 caracteres.",
        );
      return json(
        checked(
          await db
            .from("quotes")
            .insert({ ...input, file_path: file, owner_id: member.id })
            .select("id,code")
            .single(),
        ),
        201,
      );
    }
    if (route === "quotes" && request.method === "GET") {
      requireUser();
      let query = db
        .from("quotes")
        .select("*")
        .eq("owner_id", requireUser().id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (url.searchParams.get("code"))
        query = query.eq("code", url.searchParams.get("code")!.toUpperCase().trim());
      return json(checked(await query));
    }
    if (route === "messages" && request.method === "POST") {
      const member = requireUser();
      const input = z
        .object({
          name: text(100),
          email: z.string().email().max(254),
          message: z.string().trim().min(20).max(4000),
          kind: z.enum(["contact", "advice"]),
          file_path: text(300).nullable().optional(),
        })
        .parse(await body());
      const file = await verifiedFile(input.file_path, "quote");
      checked(
        await db
          .from("messages")
          .insert({ ...input, file_path: file, owner_id: member.id })
          .select("id")
          .single(),
      );
      return json({ ok: true }, 201);
    }
    if (route === "admin" && request.method === "GET") {
      requireAdmin();
      const designs = checked(
        await admin
          .from("designs")
          .select(
            "id,owner_id,title,description,category,material,license,author_name,image_path,status,review_note,created_at,complexity,complexity_notes,proposed_price,price,commercial_consent,commercial_reviewed,file_path,sales_agreement",
          )
          .order("created_at", { ascending: false })
          .limit(100),
      );
      const quotes = checked(
        await db.from("quotes").select("*").order("created_at", { ascending: false }).limit(100),
      );
      const messages = checked(
        await db.from("messages").select("*").order("created_at", { ascending: false }).limit(100),
      );
      const purchases = checked(
        await db
          .from("design_purchases")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
      );
      return json({
        designs: await Promise.all(designs.map(decorate)),
        quotes,
        messages,
        purchases,
      });
    }
    if (route === "admin/review" && request.method === "POST") {
      requireAdmin();
      const input = z
        .object({
          id: uuid,
          status: z.enum(["approved", "rejected"]),
          note: z.string().trim().min(10).max(1000),
          price: z.number().int().min(1).max(1000000).nullable(),
          complexity: z.enum(["basic", "intermediate", "advanced"]),
          commercial_reviewed: z.boolean(),
        })
        .parse(await body());
      const design = checked(
        await db.from("designs").select("file_path").eq("id", input.id).single(),
      );
      if (input.status === "approved" && (!input.price || !input.commercial_reviewed))
        throw new ApiError(
          400,
          "Confirma el precio y el acuerdo comercial del creador antes de publicar.",
        );
      if (
        input.status === "approved" &&
        (await admin.storage.from("design-files").info(design.file_path)).error
      )
        throw new ApiError(400, "No se puede aprobar sin un archivo guardado.");
      checked(
        await db
          .from("designs")
          .update({
            status: input.status,
            review_note: input.note,
            price: input.price,
            complexity: input.complexity,
            commercial_reviewed: input.commercial_reviewed,
          })
          .eq("id", input.id)
          .select("id")
          .single(),
      );
      return json({ ok: true });
    }
    if (route === "admin/purchase" && request.method === "POST") {
      requireAdmin();
      const input = z
        .object({
          id: uuid,
          status: z.enum(["paid", "revoked"]),
          reference: z.string().trim().min(5).max(200),
        })
        .parse(await body());
      // Solo el equipo puede confirmar tras verificar un pago real. No se procesa ni simula un cobro.
      const result = await db.rpc("review_design_purchase", {
        p_id: input.id,
        p_status: input.status,
        p_reference: input.reference,
      });
      if (result.error) checked(result);
      return json({ ok: true });
    }
    if (route === "admin/quote" && request.method === "POST") {
      requireAdmin();
      const input = z
        .object({
          id: uuid,
          status_index: z.number().int().min(0).max(6),
          price: z.number().positive().max(10000000).nullable(),
          estimated_delivery: z.string().trim().max(120).nullable(),
        })
        .parse(await body());
      const { id, ...changes } = input;
      checked(await db.from("quotes").update(changes).eq("id", id).select("id").single());
      return json({ ok: true });
    }
    if (route === "admin/file" && request.method === "POST") {
      requireAdmin();
      const { path, bucket } = z
        .object({ path: text(300), bucket: z.enum(["quote-files", "design-files"]) })
        .parse(await body());
      return json({
        url: checked(await admin.storage.from(bucket).createSignedUrl(path, 60, { download: true }))
          .signedUrl,
      });
    }
    throw new ApiError(404, "Recurso no encontrado.");
  } catch (error) {
    if (error instanceof z.ZodError) {
      const labels: Record<string, string> = {
        email: "correo",
        password: "contraseña",
        name: "nombre",
        title: "nombre del diseño",
        description: "descripción",
        category: "categoría",
        material: "material",
        license: "licencia",
        file_path: "archivo",
        image_path: "portada",
        rights: "autorización de publicación",
        quantity: "cantidad",
        client_name: "nombre de contacto",
        phone: "teléfono",
        city: "ciudad",
        detail: "descripción del proyecto",
        message: "mensaje",
        size: "tamaño del archivo",
        price: "precio",
        proposed_price: "precio propuesto",
        complexity: "complejidad",
        complexity_notes: "justificación de complejidad",
        commercial_consent: "autorización comercial",
        commercial_reviewed: "revisión comercial",
        sales_agreement: "condiciones comerciales",
        accepted_license: "aceptación de licencia",
        reference: "referencia del pago",
      };
      const fields = [
        ...new Set(error.issues.map((issue) => labels[String(issue.path[0])] || "formulario")),
      ];
      return json(
        {
          error:
            "Revisa " +
            fields.join(", ") +
            ". Completa los campos y respeta los formatos y límites indicados.",
        },
        400,
      );
    }
    if (error instanceof ApiError) return json({ error: error.message }, error.status);
    console.error("ProtoLab API", error instanceof Error ? error.message : "Error");
    return json({ error: "No se pudo completar la solicitud. Intenta más tarde." }, 500);
  }
}
