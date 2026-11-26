import { createFileRoute } from "@tanstack/react-router";
import { FavoritesPage } from "@/features/marketplace/commerce-pages";
export const Route = createFileRoute("/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos | ProtoLab" }] }),
  component: FavoritesPage,
});
