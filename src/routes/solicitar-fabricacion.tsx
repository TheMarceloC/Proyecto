import { createFileRoute } from "@tanstack/react-router";
import { RequestPage, type RequestSearch } from "@/features/marketplace/request-page";

export const Route = createFileRoute("/solicitar-fabricacion")({
  head: () => ({ meta: [{ title: "Solicitar fabricación | ProtoLab" }] }),
  validateSearch: (search: Record<string, unknown>): RequestSearch => ({
    fabricante: typeof search["fabricante"] === "string" ? search["fabricante"] : undefined,
    producto: typeof search["producto"] === "string" ? search["producto"] : undefined,
    servicio: search["servicio"] === "diseno" ? "diseno" : undefined,
  }),
  component: () => {
    const search = Route.useSearch();
    return (
      <RequestPage
        search={search}
        key={[search.fabricante, search.producto, search.servicio].join(":")}
      />
    );
  },
});
