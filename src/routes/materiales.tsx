import { createFileRoute } from "@tanstack/react-router";
import { MaterialsPage } from "@/features/marketplace/info-pages";
export const Route = createFileRoute("/materiales")({
  head: () => ({ meta: [{ title: "Materiales | ProtoLab" }] }),
  component: () => <MaterialsPage />,
});
