import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { MemberGate } from "@/components/community/Account";
import { PageHeader } from "@/components/site/sections";
import { Button, GlassCard, inputClass, ProgressBar } from "@/components/site/ui";
import { api, type Quote } from "@/lib/community";
import { ORDER_STATUSES } from "@/lib/protolab";
export const Route = createFileRoute("/seguimiento")({
  validateSearch: (s: Record<string, unknown>): { codigo?: string } =>
    typeof s["codigo"] === "string" ? { codigo: s["codigo"].slice(0, 60) } : {},
  head: () => ({
    meta: [{ title: "Seguimiento de tu pieza — ProtoLab" }, { name: "robots", content: "noindex" }],
  }),
  component: Tracking,
});
function Tracking() {
  return (
    <>
      <PageHeader
        eyebrow="Cada paso cuenta"
        title="Tu pieza, paso a paso."
        text="Consulta las solicitudes vinculadas a tu cuenta con el código de tu proyecto."
      />
      <section className="mx-auto max-w-5xl px-6 py-10">
        <MemberGate>
          <TrackingContent />
        </MemberGate>
      </section>
    </>
  );
}
function TrackingContent() {
  const { codigo } = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState(codigo || "");
  const query = useQuery({
    queryKey: ["tracking", codigo],
    queryFn: () => api<Quote[]>("quotes?code=" + encodeURIComponent(codigo || "")),
    enabled: Boolean(codigo),
    retry: false,
  });
  const order = query.data?.[0];
  return (
    <>
      <GlassCard className="p-6">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/seguimiento", search: { codigo: input.trim().toUpperCase() } });
          }}
        >
          <input
            aria-label="Código de proyecto"
            required
            maxLength={60}
            className={inputClass}
            placeholder="Tu código PL-…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button>
            <Search className="size-4" />
            Buscar
          </Button>
        </form>
      </GlassCard>
      {codigo && query.isPending && (
        <p role="status" className="mt-6 text-muted-foreground">
          Consultando tu solicitud…
        </p>
      )}
      {query.isError && (
        <p role="alert" className="mt-6 text-red-300">
          No pudimos consultar el proyecto. Intenta de nuevo.
        </p>
      )}
      {codigo && query.isSuccess && !order && (
        <GlassCard className="mt-6 p-6">
          <p className="text-muted-foreground">
            No encontramos ese código en tu cuenta. Verifica que sea el código de tu solicitud.
          </p>
        </GlassCard>
      )}
      {order && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <GlassCard className="p-6">
            <p className="label-caps">Estado de fabricación</p>
            <ol className="mt-6 space-y-5">
              {ORDER_STATUSES.map((status, i) => (
                <li key={status} className="flex items-center gap-3">
                  <span
                    className={
                      "grid size-8 shrink-0 place-items-center rounded-full text-xs " +
                      (i <= order.status_index
                        ? "bg-accent text-accent-foreground"
                        : "bg-white/5 text-muted-foreground")
                    }
                  >
                    {i + 1}
                  </span>
                  <span
                    className={
                      i === order.status_index
                        ? "font-semibold text-accent"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {status}
                  </span>
                </li>
              ))}
            </ol>
          </GlassCard>
          <div className="space-y-5">
            <GlassCard className="p-6">
              <p className="font-mono text-xs text-muted-foreground">{order.code}</p>
              <h2 className="mt-3 text-2xl font-bold">{order.project}</h2>
              <dl className="mt-5 space-y-4 text-sm">
                {[
                  [
                    "Material",
                    order.specifications["materialSelection"] === "auto"
                      ? "Por recomendar"
                      : order.material,
                  ],
                  ["Cantidad", String(order.quantity)],
                  ["Prioridad", order.priority],
                  ["Entrega", order.estimated_delivery || "Por confirmar"],
                ].map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 border-b border-border pb-3">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </GlassCard>
            <GlassCard className="p-6">
              <ProgressBar value={((order.status_index + 1) / ORDER_STATUSES.length) * 100} />
              <p className="mt-3 text-xs text-muted-foreground">
                {ORDER_STATUSES[order.status_index]}
              </p>
            </GlassCard>
          </div>
        </div>
      )}
    </>
  );
}
