import { createFileRoute } from "@tanstack/react-router";
import { PurchasePage } from "@/features/marketplace/commerce-pages";
export const Route = createFileRoute("/compra/$id")({
  head: () => ({ meta: [{ title: "Compra confirmada | ProtoLab" }] }),
  component: () => <PurchasePage id={Route.useParams().id} />,
});
