import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  Button,
  GlassCard,
  ProgressBar,
  SectionHeading,
  inputClass,
} from "@/components/site/ui";
import { DEMO_ORDERS, ORDER_STATUSES, findOrder, type Order } from "@/lib/protolab";

type SearchParams = { codigo?: string };

export const Route = createFileRoute("/seguimiento")({
  validateSearch: (search: Record<string, unknown>): SearchParams =>
    typeof search["codigo"] === "string" ? { codigo: search["codigo"] } : {},

  head: () => ({
    meta: [
      { title: "Seguimiento de pedido — ProtoLab" },
      {
        name: "description",
        content:
          "Consulta el estado de tu proyecto con tu código de pedido: revisión, cotización, fabricación y entrega.",
      },
      { property: "og:title", content: "Seguimiento de pedido — ProtoLab" },
      {
        property: "og:description",
        content: "Ingresa tu código y revisa en qué etapa está tu pieza.",
      },
    ],
  }),
  component: SeguimientoPage,
});

function SeguimientoPage() {
  const { codigo } = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState(codigo ?? "");
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);

  // Orders live in the browser for this demo, so resolve them after hydration.
  useEffect(() => {
    const found = codigo ? findOrder(codigo) : undefined;
    setOrder(found);
    setNotFound(Boolean(codigo) && !found);
  }, [codigo]);

  function search() {
    navigate({ to: "/seguimiento", search: { codigo: input.trim().toUpperCase() } });
  }


  const progress = order
    ? Math.round(((order.statusIndex + 1) / ORDER_STATUSES.length) * 100)
    : 0;

  return (
    <section className="mx-auto max-w-5xl px-6 pt-14 pb-20">
      <SectionHeading
        eyebrow="Seguimiento"
        title="Consulta tu pedido"
        text="Ingresa el código que recibiste al enviar tu solicitud."
      />

      <GlassCard className="mt-8 p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className={inputClass}
            placeholder="PL-2026-00124"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <Button variant="brand" onClick={search} className="sm:w-auto">
            <Search className="size-4" /> Buscar
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="px-4 py-2 text-xs"
            onClick={() => {
              const demo = DEMO_ORDERS[0]!.code;
              setInput(demo);
              navigate({ to: "/seguimiento", search: { codigo: demo } });
            }}
          >
            Ver pedido de demostración
          </Button>
          <p className="text-xs text-muted-foreground">
            Códigos de demostración: {DEMO_ORDERS.map((o) => o.code).join(" · ")}
          </p>
        </div>

      </GlassCard>

      {codigo && !order && notFound ? (
        <GlassCard className="mt-6 p-6 text-sm text-muted-foreground">
          No encontramos el código <span className="text-foreground">{codigo}</span>. Verifica e
          intenta de nuevo.
        </GlassCard>
      ) : null}

      {order ? (
        <div className="mt-6 grid animate-step-in gap-6 lg:grid-cols-2">
          <GlassCard className="p-6">
            <p className="label-caps">Estados del pedido</p>
            <ol className="relative mt-5">
              <div className="absolute top-2 bottom-2 left-[15px] w-px bg-border" />
              {ORDER_STATUSES.map((s, i) => {
                const done = i < order.statusIndex;
                const current = i === order.statusIndex;
                return (
                  <li key={s} className="relative flex gap-4 pb-5 last:pb-0">
                    <span
                      className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        current
                          ? "bg-accent text-accent-foreground ring-4 ring-accent/20"
                          : done
                            ? "bg-accent/30 text-foreground"
                            : "bg-white/10 text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p
                        className={`text-sm ${current ? "font-semibold text-accent" : done ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {s}
                      </p>
                      {current ? (
                        <p className="text-xs text-muted-foreground">En curso · {progress}%</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </GlassCard>

          <div className="space-y-4">
            <GlassCard className="p-6">
              <p className="label-caps">Detalle del pedido</p>
              <div className="mt-4 space-y-2 text-sm">
                {[
                  ["Pedido", order.code],
                  ["Proyecto", order.project],
                  ["Tecnología", order.technology],
                  ["Material", order.material],
                  ["Cantidad", `${order.quantity} unidades`],
                  ["Prioridad", order.priority],
                  ["Entrega estimada", order.estimatedDelivery],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border/60 py-1.5">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-right text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-semibold text-accent">{progress}%</span>
              </div>
              <ProgressBar value={progress} />
              <p className="mt-3 text-xs text-muted-foreground">
                Estado actual: {ORDER_STATUSES[order.statusIndex]}
              </p>
            </GlassCard>
          </div>
        </div>
      ) : null}
    </section>
  );
}
