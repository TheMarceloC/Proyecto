import { createFileRoute } from "@tanstack/react-router";
import { DirectoryPage } from "@/features/marketplace/catalog-pages";

export const Route = createFileRoute("/fabricantes")({
  head: () => ({ meta: [{ title: "Fabricantes en Honduras | ProtoLab" }] }),
  component: DirectoryPage,
});
