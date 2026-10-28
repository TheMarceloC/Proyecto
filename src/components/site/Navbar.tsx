import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BRAND, NAV_LINKS } from "@/lib/protolab";
import { btnStyles } from "./ui";
import { MemberButton } from "@/components/community/Account";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img
        src="/protolab-symbol.svg"
        alt=""
        aria-hidden="true"
        width={40}
        height={40}
        className="size-10 shrink-0"
      />
      <span className="font-display font-bold tracking-tight text-foreground">{BRAND.name}</span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <MemberButton />
          <Link to="/cotizar" className={`${btnStyles.primary} px-4 py-2`}>
            <span className="sm:hidden">Cotizar</span>
            <span className="hidden sm:inline">Cotizar pieza</span>
          </Link>
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg border border-border text-foreground lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="animate-step-in border-t border-border bg-background/95 px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                activeProps={{ className: "text-foreground bg-white/5" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/cuenta"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              Mi cuenta
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
