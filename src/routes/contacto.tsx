import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/features/marketplace/info-pages";
export const Route = createFileRoute("/contacto")({
  head: () => ({ meta: [{ title: "Contacto | ProtoLab" }] }),
  component: () => <ContactPage />,
});
