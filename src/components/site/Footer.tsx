import { Link } from "@tanstack/react-router";
import { BRAND, FOOTER_LINKS } from "@/lib/protolab";
import { Logo } from "./Navbar";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{BRAND.tagline}</p>
        </div>
        <nav className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
          {FOOTER_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="label-caps text-accent">Datos de demostración</p>
          <p>{BRAND.email}</p>
          <p>WhatsApp · {BRAND.whatsapp}</p>
          <p className="label-caps">{BRAND.country}</p>
          <div className="pt-2 text-xs">
            <Link to="/panel" className="hover:text-foreground">
              Mis proyectos
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-8 text-xs text-muted-foreground/70">
        © 2026 {BRAND.name}. Prototipo académico — MVP de demostración. Precios, tiempos y
        contactos mostrados son datos de demostración.
      </div>
    </footer>
  );
}
