import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductDetail } from "@/features/marketplace/catalog-pages";
import { products } from "@/features/marketplace/catalog";

export const Route = createFileRoute("/producto/$id")({
  beforeLoad: ({ params }) => {
    const localId = /^pl-[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(params.id);
    if (!localId && !products.some((entry) => entry.id === params.id)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      {
        title:
          (products.find((entry) => entry.id === params.id)?.name ?? "Publicación") + " | ProtoLab",
      },
    ],
  }),
  component: () => <ProductDetail id={Route.useParams().id} />,
});
