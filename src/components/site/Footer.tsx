import { Link } from "@tanstack/react-router";
import { BRAND, FOOTER_LINKS } from "@/lib/protolab";
import { Logo } from "./Navbar";
export function Footer() {
  return (
    <footer className="mt-10 border-t border-border pb-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Una comunidad que comparte ideas. Un taller que las hace realidad.
          </p>
        </div>
        <nav
          aria-label="Enlaces del pie"
          className="grid grid-cols-2 gap-y-3 text-sm text-muted-foreground"
        >
          {FOOTER_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-accent">
              {l.label}
            </Link>
          ))}
        </nav>
        <div>
          <p className="label-caps text-accent">Crea con nosotros</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Comparte tu diseño o encuentra tu próxima pieza en la comunidad.
          </p>
          <Link to="/publicar" className="mt-4 inline-block text-sm font-semibold text-accent">
            Publicar un diseño ↗
          </Link>
          <p className="mt-5 text-xs text-muted-foreground">{BRAND.country}</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-border px-6 pt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} ProtoLab · Diseña. Comparte. Fabrica.
      </div>
    </footer>
  );
}
