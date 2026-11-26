import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/marketplace/info-pages";
export const Route = createFileRoute("/privacidad")({
  head: () => ({ meta: [{ title: "Privacidad | ProtoLab" }] }),
  component: () => <LegalPage privacy />,
});
