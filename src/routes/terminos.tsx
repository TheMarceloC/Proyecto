import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/marketplace/info-pages";
export const Route = createFileRoute("/terminos")({
  head: () => ({ meta: [{ title: "Términos y condiciones | ProtoLab" }] }),
  component: () => <LegalPage />,
});
