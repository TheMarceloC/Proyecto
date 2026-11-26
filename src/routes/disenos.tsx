import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/disenos")({
  beforeLoad: () => {
    throw redirect({ to: "/marketplace", search: { tipo: "digital" }, replace: true });
  },
});
