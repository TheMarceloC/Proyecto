import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cotizar")({
  beforeLoad: () => {
    throw redirect({ to: "/solicitar-fabricacion", replace: true });
  },
});
