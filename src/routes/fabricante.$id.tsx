import { createFileRoute, notFound } from "@tanstack/react-router";
import { SellerDetail } from "@/features/marketplace/catalog-pages";
import { sellerFor } from "@/features/marketplace/model";

export const Route = createFileRoute("/fabricante/$id")({
  loader: ({ params }) => {
    const seller = sellerFor(params.id);
    if (!seller) throw notFound();
    return seller;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: (loaderData?.name ?? "Fabricante") + " | ProtoLab" }],
  }),
  component: () => <SellerDetail key={Route.useParams().id} seller={Route.useLoaderData()} />,
});
