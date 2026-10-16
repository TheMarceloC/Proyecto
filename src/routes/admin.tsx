import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/sections";
import { GlassCard, StatusBadge } from "@/components/site/ui";
import { ORDER_STATUSES, allOrders, type Order } from "@/lib/protolab";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel interno — ProtoLab" },
      {
        name: "description",
        content:
          "Vista de operación: solicitudes nuevas, cotizaciones pendientes, pedidos aprobados y trabajos en fabricación.",
      },
      { property: "og:title", content: "Panel interno — ProtoLab" },
      {
        property: "og:description",
        content: "Demostración de la operación interna de ProtoLab.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const STATS = [
  { label: "Solicitudes nuevas", value: 12, tone: "text-foreground" },
  { label: "Cotizaciones pendientes", value: 5, tone: "text-brand" },
  { label: "Proyectos activos", value: 8, tone: "text-accent" },
  { label: "Proyectos terminados", value: 24, tone: "text-foreground" },
];

const ACTIONS = ["Revisar", "Cotizar", "Cambiar estado", "Contactar cliente"];

function AdminPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    setOrders(allOrders());
  }, []);

  function advance(code: string) {
    setOrders(
      (prev) =>
        prev?.map((o) =>
          o.code === code
            ? { ...o, statusIndex: Math.min(ORDER_STATUSES.length - 1, o.statusIndex + 1) }
            : o,
        ) ?? null,
    );
    toast.success(`Estado actualizado · ${code}`);
  }

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Panel administrativo"
        text="Cómo se gestionan internamente las solicitudes y la producción."
      />
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <GlassCard key={s.label} className="p-5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`mt-1 font-display text-3xl font-bold ${s.tone}`}>{s.value}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-border text-left">
                <tr className="label-caps">
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Proyecto</th>
                  <th className="p-4 font-medium">Material</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Prioridad</th>
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders
                  ? orders.map((o) => (
                      <tr key={o.code} className="transition hover:bg-white/5">
                        <td className="p-4 text-foreground">{o.client ?? "—"}</td>
                        <td className="p-4">
                          <p className="text-foreground">{o.project}</p>
                          <p className="text-xs text-muted-foreground">{o.code}</p>
                        </td>
                        <td className="p-4 text-muted-foreground">{o.material}</td>
                        <td className="p-4">
                          <StatusBadge
                            label={ORDER_STATUSES[o.statusIndex]!}
                            tone={o.statusIndex === 6 ? "muted" : "accent"}
                          />
                        </td>
                        <td className="p-4">
                          <StatusBadge
                            label={o.priority}
                            tone={o.priority === "Urgente" ? "brand" : "muted"}
                          />
                        </td>
                        <td className="p-4 text-muted-foreground">{o.createdAt}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {ACTIONS.map((a) => (
                              <button
                                key={a}
                                type="button"
                                onClick={() =>
                                  a === "Cambiar estado"
                                    ? advance(o.code)
                                    : toast(`${a} · ${o.code}`)
                                }
                                className="rounded-lg border border-border bg-white/5 px-2.5 py-1 text-xs text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  : Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td className="p-4" colSpan={7}>
                            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>
    </>
  );
}
