import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/features/marketplace/info-pages";
export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "Ayuda | ProtoLab" }] }),
  component: () => <HelpPage />,
});
