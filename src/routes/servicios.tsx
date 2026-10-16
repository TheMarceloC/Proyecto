import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ServicesSection, CtaSection, AudienceSection } from "@/components/site/sections";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios de fabricación digital — ProtoLab" },
      {
        name: "description",
        content:
          "Impresión 3D, diseño y modelado, prototipado, asesoría técnica y fabricación personalizada bajo pedido.",
      },
      { property: "og:title", content: "Servicios de fabricación digital — ProtoLab" },
      {
        property: "og:description",
        content: "Impresión 3D, modelado, prototipado y fabricación personalizada bajo pedido.",
      },
    ],
  }),
  component: ServiciosPage,
});

function ServiciosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Servicios"
        title="Todo el proceso de fabricación en un solo lugar"
        text="Iniciamos con impresión 3D FDM y ampliamos hacia más tecnologías de manufactura digital."
        cta={{ to: "/cotizar", label: "Cotizar ahora" }}
      />
      <ServicesSection />
      <AudienceSection />
      <CtaSection />
    </>
  );
}
