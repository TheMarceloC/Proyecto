import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/site/sections";
import { ActionLink, GlassCard, StatusBadge, btnStyles } from "@/components/site/ui";
import { ORDER_STATUSES, allOrders, type Order } from "@/lib/protolab";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Mis proyectos — ProtoLab" },
      {
        name: "description",
        content:
          "Panel del cliente: proyectos activos, cotizaciones pendientes y proyectos terminados en un solo lugar.",
      },
      { property: "og:title", content: "Mis proyectos — ProtoLab" },
      {
        property: "og:description",
        content: "Consulta tus cotizaciones y el avance de cada pieza fabricada.",
      },
    ],
  }),
  component: PanelPage,
});

function PanelPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    setOrders(allOrders());
  }, []);

  const active = orders?.filter((o) => o.statusIndex > 2 && o.statusIndex < 6).length ?? 0;
  const pending = orders?.filter((o) => o.statusIndex <= 2).length ?? 0;
  const done = orders?.filter((o) => o.statusIndex === 6).length ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Panel del cliente · Datos de demostración"
        title="Mis proyectos"
        text="Vista de demostración de una futura cuenta de usuario. Los proyectos mostrados son datos de demostración."
      />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Proyectos activos", active],
            ["Cotizaciones pendientes", pending],
            ["Proyectos terminados", done],
          ].map(([label, value]) => (
            <GlassCard key={String(label)} className="p-5">
              <p className="text-xs text-muted-foreground">{label}</p>
              {orders ? (
                <p className="mt-1 font-display text-3xl font-bold text-foreground">{value}</p>
              ) : (
                <div className="mt-2 h-8 w-12 animate-pulse rounded bg-white/10" />
              )}
            </GlassCard>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ActionLink to="/cotizar">
            <Plus className="size-4" /> Nuevo proyecto
          </ActionLink>
          <ActionLink to="/seguimiento" variant="ghost">
            Ver seguimiento
          </ActionLink>
        </div>

        <GlassCard className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border text-left">
                <tr className="label-caps">
                  <th className="p-4 font-medium">Código</th>
                  <th className="p-4 font-medium">Proyecto</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders
                  ? orders.map((o) => (
                      <tr key={o.code} className="transition hover:bg-white/5">
                        <td className="p-4 text-foreground">{o.code}</td>
                        <td className="p-4 text-foreground">{o.project}</td>
                        <td className="p-4">
                          <StatusBadge
                            label={ORDER_STATUSES[o.statusIndex]!}
                            tone={o.statusIndex === 6 ? "muted" : "accent"}
                          />
                        </td>
                        <td className="p-4 text-muted-foreground">{o.createdAt}</td>
                        <td className="p-4">
                          <Link
                            to="/seguimiento"
                            search={{ codigo: o.code }}
                            className="text-accent hover:underline"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))
                  : Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="p-4" colSpan={5}>
                          <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="mt-6">
          <Link to="/cotizar" className={btnStyles.brand}>
            Ver cotización
          </Link>
        </div>
      </section>
    </>
  );
}
