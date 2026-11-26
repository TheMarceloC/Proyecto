import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/features/marketplace/commerce-pages";
export const Route = createFileRoute("/carrito")({
  head: () => ({ meta: [{ title: "Carrito | ProtoLab" }] }),
  component: CartPage,
});
