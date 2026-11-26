import { createFileRoute, redirect } from "@tanstack/react-router";
const previous: Record<string, string> = {
  "demo-soporte-sensor": "soporte-sensor",
  "demo-carcasa-electronica": "carcasa-iot",
  "demo-conjunto-engranajes": "engranajes-aula",
};
export const Route = createFileRoute("/diseno/$id")({
  beforeLoad: ({ params }) => {
    const id = previous[params.id];
    throw id
      ? redirect({ to: "/producto/$id", params: { id }, replace: true })
      : redirect({ to: "/marketplace", search: { tipo: "digital" }, replace: true });
  },
});
