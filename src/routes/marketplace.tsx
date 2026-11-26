import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage, type CatalogSearch } from "@/features/marketplace/catalog-pages";
import { categories, kinds, type Kind } from "@/features/marketplace/catalog";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace | ProtoLab" }] }),
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    tipo:
      typeof search["tipo"] === "string" && Object.hasOwn(kinds, search["tipo"])
        ? (search["tipo"] as Kind)
        : undefined,
    q: typeof search["q"] === "string" ? search["q"].slice(0, 160) : undefined,
    categoria:
      typeof search["categoria"] === "string"
        ? categories.find((category) => category === search["categoria"])
        : undefined,
  }),
  component: () => <CatalogPage search={Route.useSearch()} />,
});
