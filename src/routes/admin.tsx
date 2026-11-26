import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/features/marketplace/admin-page";
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administración | ProtoLab" }] }),
  validateSearch: (search: Record<string, unknown>): { seccion?: string | undefined } => ({
    seccion: typeof search["seccion"] === "string" ? search["seccion"] : undefined,
  }),
  component: () => <AdminPage section={Route.useSearch().seccion} />,
});
