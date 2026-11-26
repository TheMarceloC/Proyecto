import { createFileRoute } from "@tanstack/react-router";
import { PublicationPage } from "@/features/marketplace/seller-page";
export const Route = createFileRoute("/publicar")({
  head: () => ({ meta: [{ title: "Publicaciones | ProtoLab" }] }),
  validateSearch: (search: Record<string, unknown>): { editar?: string | undefined } => ({
    editar: typeof search["editar"] === "string" ? search["editar"] : undefined,
  }),
  component: () => <PublicationPage id={Route.useSearch().editar} />,
});
