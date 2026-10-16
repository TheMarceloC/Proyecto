import { createFileRoute } from "@tanstack/react-router";
import { CtaSection, FaqList, PageHeader } from "@/components/site/sections";
import { FAQS } from "@/lib/protolab";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Preguntas frecuentes — ProtoLab" },
      {
        name: "description",
        content:
          "Archivos aceptados, tiempos de fabricación, elección de material, cálculo de precio y proyectos para estudiantes.",
      },
      { property: "og:title", content: "Preguntas frecuentes — ProtoLab" },
      {
        property: "og:description",
        content: "Respuestas rápidas sobre archivos, materiales, precios y tiempos.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Preguntas frecuentes"
        text="Lo que más nos preguntan antes de fabricar una pieza."
      />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <FaqList items={FAQS} />
      </section>
      <CtaSection />
    </>
  );
}
