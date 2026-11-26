import { createFileRoute } from "@tanstack/react-router";
import { DesignServices } from "@/features/marketplace/catalog-pages";

export const Route = createFileRoute("/servicios-diseno")({
  head: () => ({ meta: [{ title: "Servicios de diseño y asesoría | ProtoLab" }] }),
  component: DesignServices,
});
