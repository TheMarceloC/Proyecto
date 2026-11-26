import { createFileRoute } from "@tanstack/react-router";
import { ProcessPage } from "@/features/marketplace/info-pages";
export const Route = createFileRoute("/como-funciona")({
  head: () => ({ meta: [{ title: "Cómo funciona | ProtoLab" }] }),
  component: () => <ProcessPage />,
});
