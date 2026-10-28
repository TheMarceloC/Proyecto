import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { MemberGate } from "@/components/community/Account";
import { PageHeader } from "@/components/site/sections";
import { GlassCard, StatusBadge, ActionLink, Button } from "@/components/site/ui";
import { api, errorText, type Quote, type Design, type DesignPurchase } from "@/lib/community";
import { designPrice, PURCHASE_STATUSES } from "@/lib/design-commerce";
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
        text="Tus compras de archivos, publicaciones y solicitudes de fabricación, en un solo lugar."
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
  const [downloading, setDownloading] = useState<string | null>(null);
  const purchases = useQuery({
    queryKey: ["purchases"],
    queryFn: () => api<DesignPurchase[]>("purchases"),
    retry: false,
  });
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
      <h2 className="mt-10 text-2xl font-bold">Mis compras de diseños</h2>
      {purchases.isPending ? (
        <p role="status" className="mt-5">
          Cargando compras…
        </p>
      ) : purchases.isError ? (
        <div className="mt-5">
          <p role="alert">No pudimos consultar tus compras.</p>
          <Button variant="ghost" onClick={() => purchases.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : !purchases.data.length ? (
        <GlassCard className="mt-5 p-6">
          <p className="text-muted-foreground">
            Aquí encontrarás los archivos que compres y el estado de cada solicitud.
          </p>
          <Link to="/disenos" className="mt-3 inline-block text-accent">
            Explorar diseños →
          </Link>
        </GlassCard>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {purchases.data.map((p) => (
            <GlassCard key={p.id} className="p-6">
              <StatusBadge label={PURCHASE_STATUSES[p.status]} />
              <h3 className="mt-3 text-lg font-bold">{p.design_title}</h3>
              <p className="mt-2 text-xl font-bold">{designPrice(p.amount)}</p>
              <p className="mt-2 text-xs text-muted-foreground">Archivo digital · {p.license}</p>
              <p className="mt-2 break-all text-xs text-muted-foreground">Referencia: {p.id}</p>
              {p.status === "paid" ? (
                <Button
                  className="mt-4"
                  disabled={downloading === p.id}
                  onClick={async () => {
                    setDownloading(p.id);
                    try {
                      window.location.assign(
                        (await api<{ url: string }>("download", { id: p.design_id })).url,
                      );
                    } catch (error) {
                      toast.error(errorText(error));
                    } finally {
                      setDownloading(null);
                    }
                  }}
                >
                  <Download className="size-4" />
                  {downloading === p.id ? "Preparando…" : "Descargar archivo"}
                </Button>
              ) : (
                <>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {p.status === "pending"
                      ? "Coordina el pago e indica esta referencia al equipo. Registrar la compra no realiza un cobro."
                      : "El acceso fue revocado. Consulta el motivo con el equipo."}
                  </p>
                  <Link to="/contacto" className="mt-3 inline-block text-sm text-accent">
                    Contactar al equipo →
                  </Link>
                </>
              )}
            </GlassCard>
          ))}
        </div>
      )}
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
                {o.specifications["materialSelection"] === "auto"
                  ? "Material por recomendar"
                  : o.material}{" "}
                · {o.quantity} {o.quantity === 1 ? "pieza" : "piezas"} ·{" "}
                {new Date(o.created_at).toLocaleDateString("es-HN")}
              </p>
              <div className="mt-5 flex items-center justify-between">
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
            Propón tu primer diseño para vender. Revisamos complejidad, precio y condiciones antes
            de publicarlo.
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
                <p className="mt-2 text-sm text-accent">
                  {d.price !== null
                    ? designPrice(d.price)
                    : d.proposed_price != null
                      ? "Propuesto: " + designPrice(d.proposed_price)
                      : "Precio por definir"}
                </p>
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
