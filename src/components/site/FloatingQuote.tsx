import { Link, useRouterState } from "@tanstack/react-router";
import { Boxes } from "lucide-react";

/** Burbuja flotante permanente: la acción comercial principal es cotizar. */
export function FloatingQuote() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/cotizar") return null;

  return (
    <Link
      to="/cotizar"
      aria-label="Cotizar pieza"
      className="fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-bold text-accent-foreground shadow-glow transition hover:brightness-110 sm:right-6 sm:bottom-6 sm:px-5"
    >
      <Boxes className="size-5" />
      <span className="hidden sm:inline">Cotizar pieza</span>
      <span className="sm:hidden">Cotizar</span>
    </Link>
  );
}
