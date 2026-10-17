import { createFileRoute, Link } from "@tanstack/react-router";
import { ProcessSection, PageHeader, CtaSection } from "@/components/site/sections";
import { GlassCard } from "@/components/site/ui";
import { Eye, Upload, Download } from "lucide-react";
export const Route = createFileRoute("/como-funciona")({
  head: () => ({ meta: [{ title: "Comparte, descubre y fabrica — ProtoLab" }] }),
  component: How,
});
function How() {
  return (
    <>
      <PageHeader
        eyebrow="Dos caminos. Muchas ideas."
        title="Fabrica con nosotros. Crea con todos."
        text="Pide una pieza sin tener impresora, o contribuye con un diseño para fabricar en la tuya."
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
              title: "Comparte una creación",
              text: "Crea tu cuenta, sube un archivo original y elige una licencia que permita compartir y fabricar. El equipo revisa tu publicación.",
            },
            {
              Icon: Download,
              title: "Desbloquea las descargas",
              text: "Mientras tengas al menos un diseño aprobado, podrás descargar toda la colección. No se consumen créditos por cada archivo.",
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
            Publicar mi diseño →
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
