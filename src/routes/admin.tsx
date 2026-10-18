import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { MemberGate, useMember } from "@/components/community/Account";
import { Button, GlassCard, inputClass, Field } from "@/components/site/ui";
import { PageHeader } from "@/components/site/sections";
import { api, errorText, type Design, type Quote } from "@/lib/community";
import { ORDER_STATUSES } from "@/lib/protolab";
type AdminDesign = Design & { file_path: string };
type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  kind: string;
  created_at: string;
  file_path: string | null;
};
type AdminData = { designs: AdminDesign[]; quotes: Quote[]; messages: Message[] };
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Administración — ProtoLab" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: Admin,
});
function Admin() {
  return (
    <>
      <PageHeader
        eyebrow="Equipo ProtoLab"
        title="Del archivo a la fabricación."
        text="Revisa publicaciones, cotiza proyectos y mantén informado a cada cliente."
      />
      <section className="mx-auto max-w-7xl px-6 py-10">
        <MemberGate>
          <AdminContent />
        </MemberGate>
      </section>
    </>
  );
}
function AdminContent() {
  const member = useMember();
  const qc = useQueryClient();
  const [tab, setTab] = useState("Diseños");
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ["admin"],
    queryFn: () => api<AdminData>("admin"),
    enabled: member.data?.user?.isAdmin === true,
    retry: false,
  });
  const perform = async (path: string, body: unknown) => {
    setBusy(true);
    try {
      await api(path, body);
      await query.refetch();
      await qc.invalidateQueries({ queryKey: ["member"] });
      toast.success("Cambio guardado.");
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setBusy(false);
    }
  };
  const file = async (path: string, bucket: string) => {
    try {
      window.open(
        (await api<{ url: string }>("admin/file", { path, bucket })).url,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      toast.error(errorText(error));
    }
  };
  if (!member.data?.user?.isAdmin)
    return (
      <GlassCard className="p-8">
        <h2 className="text-xl font-bold">Acceso reservado al equipo.</h2>
        <p className="mt-3 text-muted-foreground">Tu cuenta no tiene permisos de administración.</p>
      </GlassCard>
    );
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Diseños por revisar", query.data?.designs.filter((d) => d.status === "pending").length],
          ["Solicitudes cargadas", query.data?.quotes.length],
          ["Mensajes recibidos", query.data?.messages.length],
        ].map(([label, value]) => (
          <GlassCard key={label} className="p-6">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value ?? "—"}</p>
          </GlassCard>
        ))}
      </div>
      <div className="my-8 flex gap-2">
        {["Diseños", "Fabricación", "Mensajes"].map((t) => (
          <Button variant={tab === t ? "primary" : "ghost"} key={t} onClick={() => setTab(t)}>
            {t}
          </Button>
        ))}
      </div>
      {query.isPending && <p role="status">Cargando…</p>}
      {query.isError && (
        <p role="alert" className="text-red-300">
          No pudimos cargar los datos.{" "}
          <button onClick={() => query.refetch()} className="underline">
            Reintentar
          </button>
        </p>
      )}
      {tab === "Diseños" && (
        <div className="grid gap-5 md:grid-cols-2">
          {query.data?.designs.map((d) => (
            <GlassCard key={d.id} className="p-6">
              <div className="flex gap-4">
                {d.image_url && (
                  <img src={d.image_url} alt="" className="size-20 rounded-xl object-cover" />
                )}
                <div>
                  <h2 className="text-lg font-bold">{d.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {d.author_name} · {d.license}
                  </p>
                  <p className="mt-2 text-xs text-accent">{d.status}</p>
                </div>
              </div>
              <p className="my-4 whitespace-pre-wrap text-sm text-muted-foreground">
                {d.description}
              </p>
              <Button
                variant="ghost"
                className="mb-5"
                onClick={() => file(d.file_path, "design-files")}
              >
                Revisar archivo 3D
              </Button>
              <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  const action = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
                  perform("admin/review", {
                    id: d.id,
                    status: action || "rejected",
                    note: data.get("note"),
                  });
                }}
              >
                <textarea
                  aria-label={"Notas para " + d.title}
                  name="note"
                  rows={3}
                  required
                  minLength={10}
                  maxLength={1000}
                  defaultValue={d.review_note || ""}
                  placeholder="Notas de revisión: archivo, derechos y descripción…"
                  className={inputClass}
                />
                <p className="my-3 text-xs text-muted-foreground">
                  Antes de aprobar, comprueba el archivo, la imagen, la descripción y que la
                  licencia permita compartir y fabricar.
                </p>
                <div className="flex gap-3">
                  <Button name="action" value="approved" disabled={busy}>
                    Aprobar
                  </Button>
                  <Button name="action" value="rejected" variant="ghost" disabled={busy}>
                    Solicitar cambios
                  </Button>
                </div>
              </form>
            </GlassCard>
          ))}
        </div>
      )}
      {tab === "Fabricación" && (
        <div className="space-y-5">
          {query.data?.quotes.map((o) => (
            <GlassCard key={o.id} className="p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="font-mono text-xs text-accent">{o.code}</p>
                  <h2 className="mt-2 text-xl font-bold">{o.project}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {o.client_name} · {o.email} · {o.phone} · {o.city}
                  </p>
                  <p className="mt-3 text-sm">
                    {o.specifications["materialSelection"] === "auto"
                      ? "Material por recomendar"
                      : o.material}{" "}
                    · {o.quantity} piezas · {o.priority}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {o.detail}
                  </p>
                  <pre className="mt-4 whitespace-pre-wrap break-words text-xs text-muted-foreground">
                    {JSON.stringify(o.specifications, null, 2)}
                  </pre>
                  {o.file_path && (
                    <Button
                      variant="ghost"
                      className="mt-4"
                      onClick={() => file(o.file_path!, "quote-files")}
                    >
                      Abrir adjunto
                    </Button>
                  )}
                  {o.design_id && (
                    <a href={"/diseno/" + o.design_id} className="ml-4 text-sm text-accent">
                      Ver diseño de catálogo ↗
                    </a>
                  )}
                </div>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    perform("admin/quote", {
                      id: o.id,
                      status_index: Number(data.get("status")),
                      price: data.get("price") ? Number(data.get("price")) : null,
                      estimated_delivery: String(data.get("delivery") || "") || null,
                    });
                  }}
                >
                  <Field label="Estado">
                    <select name="status" defaultValue={o.status_index} className={inputClass}>
                      {ORDER_STATUSES.map((s, i) => (
                        <option key={s} value={i}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Precio cotizado (L)">
                    <input
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      defaultValue={o.price ?? ""}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Entrega acordada">
                    <input
                      name="delivery"
                      maxLength={120}
                      defaultValue={o.estimated_delivery || ""}
                      className={inputClass}
                    />
                  </Field>
                  <Button disabled={busy}>Guardar cotización y estado</Button>
                </form>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
      {tab === "Mensajes" && (
        <div className="space-y-4">
          {query.data?.messages.map((m) => (
            <GlassCard key={m.id} className="p-6">
              <p className="label-caps text-accent">
                {m.kind === "advice" ? "Asesoría" : "Contacto"}
              </p>
              <h2 className="mt-3 font-bold">{m.name}</h2>
              <a href={"mailto:" + m.email} className="mt-1 inline-block text-sm text-accent">
                {m.email}
              </a>
              <p className="mt-4 whitespace-pre-wrap text-muted-foreground">{m.message}</p>
              {m.file_path && (
                <Button
                  variant="ghost"
                  className="mt-4"
                  onClick={() => file(m.file_path!, "quote-files")}
                >
                  Ver adjunto
                </Button>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
}
