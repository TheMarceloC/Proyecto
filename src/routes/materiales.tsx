import { createFileRoute } from "@tanstack/react-router";
import { CtaSection, MaterialsSection, PageHeader } from "@/components/site/sections";
import { GlassCard } from "@/components/site/ui";

export const Route = createFileRoute("/materiales")({
  head: () => ({
    meta: [
      { title: "Materiales: PLA, PETG, ABS y TPU — ProtoLab" },
      {
        name: "description",
        content:
          "Guía sencilla de materiales para impresión 3D: para qué sirve cada uno y cómo elegir el adecuado para tu pieza.",
      },
      { property: "og:title", content: "Materiales: PLA, PETG, ABS y TPU — ProtoLab" },
      {
        property: "og:description",
        content: "Aprende qué material conviene a tu pieza según resistencia, uso y temperatura.",
      },
    ],
  }),
  component: MaterialesPage,
});

const terms = [
  { t: "Tolerancia", d: "Variación aceptable en las medidas de la pieza (±0.2 mm típico)." },
  { t: "Relleno (infill)", d: "Cantidad de material interno: más relleno, más resistencia y costo." },
  { t: "Orientación", d: "Cómo se coloca la pieza al imprimir; afecta la resistencia." },
];

function MaterialesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Materiales"
        title="Elige el material correcto para tu pieza"
        text="Explicaciones simples, sin lenguaje técnico innecesario."
      />
      <MaterialsSection />
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <GlassCard className="p-6">
          <p className="label-caps">Términos útiles</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {terms.map((x) => (
              <div key={x.t}>
                <p className="text-sm font-semibold text-foreground">{x.t}</p>
                <p className="mt-1 text-xs text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
      <CtaSection />
    </>
  );
}
