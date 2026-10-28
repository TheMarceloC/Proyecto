import { createFileRoute, Link } from "@tanstack/react-router";
import { ProcessSection, PageHeader, CtaSection } from "@/components/site/sections";
import { GlassCard } from "@/components/site/ui";
import { Eye, Upload, Download } from "lucide-react";
export const Route = createFileRoute("/como-funciona")({
  head: () => ({ meta: [{ title: "Explora, compra y fabrica — ProtoLab" }] }),
  component: How,
});
function How() {
  return (
    <>
      <PageHeader
        eyebrow="Dos caminos. Muchas ideas."
        title="Compra el diseño. O encarga la pieza."
        text="El archivo digital y la pieza fabricada son compras independientes. Elige lo que necesitas."
      />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              Icon: Eye,
              title: "Explora sin barreras",
              text: "Los diseños publicados, las imágenes y sus descripciones son visibles para cualquiera. No necesitas una cuenta para descubrir.",
            },
            {
              Icon: Upload,
              title: "Elige y solicita la compra",
              text: "Cada diseño tiene un precio aprobado según su complejidad. Crea tu cuenta, revisa la licencia y registra la compra; el pago se coordina con el equipo.",
            },
            {
              Icon: Download,
              title: "Recibe tu archivo",
              text: "Cuando el equipo verifica el pago, puedes descargar ese diseño desde tu cuenta. Si prefieres recibir la pieza física, solicita una cotización de fabricación.",
            },
          ].map((s) => (
            <GlassCard key={s.title} className="p-7">
              <s.Icon className="size-7 text-accent" />
              <h2 className="mt-5 text-xl font-bold">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </GlassCard>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-5">
          <Link to="/publicar" className="font-semibold text-accent">
            Proponer un diseño para vender →
          </Link>
          <Link to="/disenos" className="font-semibold text-accent">
            Explorar la colección →
          </Link>
        </div>
      </section>
      <ProcessSection />
      <CtaSection />
    </>
  );
}
