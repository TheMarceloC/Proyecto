import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "@/features/marketplace/account-page";

export const Route = createFileRoute("/cuenta")({
  head: () => ({ meta: [{ title: "Mi cuenta | ProtoLab" }] }),
  validateSearch: (search: Record<string, unknown>): { seccion?: string | undefined } => ({
    seccion: typeof search["seccion"] === "string" ? search["seccion"] : undefined,
  }),
  component: () => <AccountPage section={Route.useSearch().seccion} />,
});
