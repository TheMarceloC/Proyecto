import { createFileRoute, Link } from "@tanstack/react-router";
import { formatCustomerPrice } from "@/lib/material-pricing";
import { useQuery } from "@tanstack/react-query";
import { Plus, Upload } from "lucide-react";
import { MemberGate } from "@/components/community/Account";
import { PageHeader } from "@/components/site/sections";
import { GlassCard, StatusBadge, ActionLink } from "@/components/site/ui";
import { api, type Quote, type Design } from "@/lib/community";
import { ORDER_STATUSES } from "@/lib/protolab";
export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [{ title: "Mis proyectos — ProtoLab" }, { name: "robots", content: "noindex" }],
  }),
  component: Panel,
});
function Panel() {
  return (
    <>
      <PageHeader
        eyebrow="Tu espacio de trabajo"
        title="Lo que estás creando."
        text="Tus solicitudes de fabricación y tus aportaciones a la comunidad, en un solo lugar."
      />
      <section className="mx-auto max-w-7xl px-6 py-10">
        <MemberGate>
          <Projects />
        </MemberGate>
      </section>
    </>
  );
}
function Projects() {
  const orders = useQuery({ queryKey: ["quotes"], queryFn: () => api<Quote[]>("quotes") });
  const designs = useQuery({
    queryKey: ["my-designs"],
    queryFn: () => api<Design[]>("designs?mine=1"),
  });
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <ActionLink to="/cotizar">
          <Plus className="size-4" />
          Solicitar fabricación
        </ActionLink>
        <ActionLink to="/publicar" variant="ghost">
          <Upload className="size-4" />
          Publicar diseño
        </ActionLink>
      </div>
      <h2 className="mt-10 text-2xl font-bold">Mis cotizaciones y pedidos</h2>
      {orders.isError ? (
        <p className="mt-5 text-red-300">No se pudieron cargar tus solicitudes.</p>
      ) : orders.isPending ? (
        <p role="status" className="mt-5 text-muted-foreground">
          Cargando solicitudes…
        </p>
      ) : !orders.data.length ? (
        <GlassCard className="mt-5 p-8">
          <p className="text-muted-foreground">
            Todavía no tienes solicitudes. Elige un diseño o cuéntanos qué pieza necesitas.
          </p>
        </GlassCard>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {orders.data.map((o) => (
            <GlassCard key={o.id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs text-muted-foreground">{o.code}</p>
                <StatusBadge label={ORDER_STATUSES[o.status_index] || "En revisión"} />
              </div>
              <h3 className="mt-4 text-xl font-bold">{o.project}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {o.material} · {o.quantity} {o.quantity === 1 ? "pieza" : "piezas"} ·{" "}
                {new Date(o.created_at).toLocaleDateString("es-HN")}
              </p>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm">
                  {o.price === null ? "Precio por confirmar" : formatCustomerPrice(Number(o.price))}
                </p>
                <Link
                  to="/seguimiento"
                  search={{ codigo: o.code }}
                  className="font-semibold text-accent text-sm"
                >
                  Ver seguimiento →
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
      <h2 className="mt-12 text-2xl font-bold">Mis diseños</h2>
      {designs.isError ? (
        <p className="mt-5 text-red-300">No se pudieron cargar tus diseños.</p>
      ) : designs.isPending ? (
        <p role="status" className="mt-5 text-muted-foreground">
          Cargando diseños…
        </p>
      ) : !designs.data.length ? (
        <GlassCard className="mt-5 p-8">
          <p className="text-muted-foreground">
            Tu primera publicación puede abrir toda la colección. Comparte una creación original
            para empezar.
          </p>
        </GlassCard>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {designs.data.map((d) => (
            <GlassCard key={d.id} className="overflow-hidden">
              {d.image_url && (
                <img src={d.image_url} alt={d.title} className="aspect-[4/3] w-full object-cover" />
              )}
              <div className="p-5">
                <StatusBadge
                  label={
                    { pending: "En revisión", approved: "Publicado", rejected: "Requiere cambios" }[
                      d.status
                    ]
                  }
                />
                <h3 className="mt-3 font-bold">{d.title}</h3>
                {d.review_note && (
                  <p className="mt-2 text-sm text-muted-foreground">{d.review_note}</p>
                )}
                {d.status === "approved" && (
                  <Link
                    to="/diseno/$id"
                    params={{ id: d.id }}
                    className="mt-4 inline-block text-sm text-accent"
                  >
                    Ver publicación →
                  </Link>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
}
