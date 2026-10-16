import { createFileRoute } from "@tanstack/react-router";
import { AdviceSection, CtaSection, PageHeader, ProcessSection } from "@/components/site/sections";
import { GlassCard } from "@/components/site/ui";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Cómo funciona — ProtoLab" },
      {
        name: "description",
        content:
          "Sube tu diseño, recibe cotización y asesoría, aprueba, fabricamos y das seguimiento hasta recibir tu pieza.",
      },
      { property: "og:title", content: "Cómo funciona — ProtoLab" },
      {
        property: "og:description",
        content: "El proceso completo: de subir tu diseño a recibir tu pieza terminada.",
      },
    ],
  }),
  component: ComoFuncionaPage,
});

const flow = [
  "Subir diseño",
  "Recibir cotización",
  "Recibir asesoría",
  "Aprobar",
  "Fabricar",
  "Dar seguimiento",
  "Recibir pieza",
];

function ComoFuncionaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Proceso"
        title="Convierte tu diseño en una pieza real"
        text="Un flujo claro, sin llamadas ni cotizaciones interminables."
        cta={{ to: "/cotizar", label: "Subir mi diseño" }}
      />
      <ProcessSection eyebrow="Los 5 pasos" />
      <section className="mx-auto max-w-7xl px-6 py-8">
        <GlassCard className="p-6">
          <p className="label-caps">Flujo completo</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-3 text-sm">
            {flow.map((f, i) => (
              <span key={f} className="flex items-center gap-2">
                <span className="rounded-lg border border-border bg-white/5 px-3 py-1.5 text-foreground">
                  {f}
                </span>
                {i < flow.length - 1 ? <span className="text-accent">→</span> : null}
              </span>
            ))}
          </div>
        </GlassCard>
      </section>
      <AdviceSection />
      <CtaSection />
    </>
  );
}
