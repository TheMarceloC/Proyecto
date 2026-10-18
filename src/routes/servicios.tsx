import { createFileRoute } from "@tanstack/react-router";
import {
  PageHeader,
  ServicesSection,
  CtaSection,
  AudienceSection,
  MaterialsSection,
} from "@/components/site/sections";

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
        text="Diseño, modelado e impresión 3D FDM para convertir tus proyectos en piezas."
        cta={{ to: "/cotizar", label: "Cotizar ahora" }}
      />
      <ServicesSection />
      <MaterialsSection />
      <AudienceSection />
      <CtaSection />
    </>
  );
}
