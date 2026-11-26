import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage, type CheckoutSearch } from "@/features/marketplace/commerce-pages";
export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Confirmar compra | ProtoLab" }] }),
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
    vendedor: typeof search["vendedor"] === "string" ? search["vendedor"] : undefined,
    solicitud: typeof search["solicitud"] === "string" ? search["solicitud"] : undefined,
  }),
  component: () => {
    const search = Route.useSearch();
    return <CheckoutPage key={search.solicitud || search.vendedor} search={search} />;
  },
});
