import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/ejemplos")({
  beforeLoad: () => {
    throw redirect({ to: "/disenos", replace: true });
  },
});
