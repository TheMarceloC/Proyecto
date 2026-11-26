import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/asesoria")({
  beforeLoad: () => {
    throw redirect({ to: "/servicios-diseno", replace: true });
  },
});
