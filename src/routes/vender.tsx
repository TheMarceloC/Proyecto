import { createFileRoute } from "@tanstack/react-router";
import { SellPage } from "@/features/marketplace/seller-page";
export const Route = createFileRoute("/vender")({
  head: () => ({ meta: [{ title: "Vende en ProtoLab" }] }),
  component: SellPage,
});
