import { createFileRoute } from "@tanstack/react-router";
import soporte from "@/assets/proj-soporte-sensor.jpg";
import carcasa from "@/assets/proj-carcasa.jpg";
import engranaje from "@/assets/proj-engranaje.jpg";
import { CtaSection, PageHeader } from "@/components/site/sections";
import { GlassCard, StatusBadge } from "@/components/site/ui";

export const Route = createFileRoute("/ejemplos")({
  head: () => ({
    meta: [
      { title: "Ejemplos de aplicaciones — ProtoLab" },
      {
        name: "description",
        content:
          "Ejemplos de piezas y prototipos: soportes, carcasas electrónicas, engranajes, piezas de reemplazo y modelos conceptuales.",
      },
      { property: "og:title", content: "Ejemplos de aplicaciones — ProtoLab" },
      {
        property: "og:description",
        content: "Piezas y prototipos que se pueden fabricar con impresión 3D FDM.",
      },
    ],
  }),
  component: EjemplosPage,
});

const PROJECTS = [
  {
    img: soporte,
    title: "Soporte para sensor",
    material: "PETG",
    tech: "Impresión 3D FDM",
    time: "2 días",
    category: "Mecatrónica",
  },
  {
    img: carcasa,
    title: "Carcasa electrónica",
    material: "PLA",
    tech: "Impresión 3D FDM",
    time: "3 días",
    category: "Electrónica",
  },
  {
    img: engranaje,
    title: "Engranaje de prueba",
    material: "PETG",
    tech: "Impresión 3D FDM",
    time: "1 día",
    category: "Mecánica",
  },
  {
    img: engranaje,
    title: "Prototipo académico",
    material: "PLA",
    tech: "Impresión 3D FDM",
    time: "2 días",
    category: "Universitario",
  },
  {
    img: soporte,
    title: "Pieza de reemplazo",
    material: "ABS",
    tech: "Impresión 3D FDM",
    time: "3 días",
    category: "Mantenimiento",
  },
  {
    img: carcasa,
    title: "Modelo conceptual",
    material: "PLA",
    tech: "Impresión 3D FDM",
    time: "2 días",
    category: "Diseño de producto",
  },
];

function EjemplosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ejemplos de aplicaciones"
        title="Lo que se puede fabricar"
        text="Piezas de referencia para mostrar tipos de aplicación. No representan clientes reales."
        cta={{ to: "/cotizar", label: "Cotizar una pieza similar" }}
      />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <GlassCard
              key={p.title}
              className="overflow-hidden transition hover:-translate-y-0.5 hover:border-accent/30"
            >
              <img
                src={p.img}
                alt={p.title}
                loading="lazy"
                width={768}
                height={576}
                className="h-44 w-full object-cover"
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                  <StatusBadge label={p.category} tone="muted" />
                </div>
                <dl className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Material</dt>
                    <dd className="text-foreground">{p.material}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tecnología</dt>
                    <dd className="text-foreground">{p.tech}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tiempo aproximado</dt>
                    <dd className="text-foreground">{p.time}</dd>
                  </div>
                </dl>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
      <CtaSection />
    </>
  );
}
