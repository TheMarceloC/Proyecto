import { Link, useRouterState } from "@tanstack/react-router";
import { Boxes, ArrowUpRight } from "lucide-react";
export function FloatingQuote() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/cotizar") return null;
  return (
    <Link
      to="/cotizar"
      aria-label="Cotizar mi pieza"
      className="fixed right-4 bottom-4 z-40 inline-flex min-h-16 items-center gap-3 rounded-2xl border border-accent/40 bg-accent px-5 py-4 text-base font-bold text-accent-foreground shadow-[0_8px_35px_#06d6a045] transition hover:-translate-y-1 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:right-7 sm:bottom-7 sm:min-h-20 sm:px-7 sm:text-lg"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-black/10">
        <Boxes className="size-6" />
      </span>
      <span>
        Cotizar mi pieza
        <span className="hidden text-[11px] font-medium opacity-70 sm:block">
          Hagamos realidad tu proyecto
        </span>
      </span>
      <ArrowUpRight className="size-5" />
    </Link>
  );
}
