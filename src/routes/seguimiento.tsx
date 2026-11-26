import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/seguimiento")({
  beforeLoad: () => {
    throw redirect({ to: "/cuenta", search: { seccion: "solicitudes" }, replace: true });
  },
});
