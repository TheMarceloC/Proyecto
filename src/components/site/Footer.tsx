import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Globe2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./Navbar";

const sections = [
  {
    name: "Explora",
    items: [
      { to: "/marketplace", label: "Marketplace" },
      { to: "/fabricantes", label: "Fabricantes" },
      { to: "/servicios-diseno", label: "Servicios de diseño" },
      { to: "/vender", label: "Vender en ProtoLab" },
    ],
  },
  {
    name: "Recursos",
    items: [
      { to: "/como-funciona", label: "Cómo funciona" },
      { to: "/calculadora", label: "Calculadora de costos" },
      { to: "/materiales", label: "Materiales" },
      { to: "/faq", label: "Ayuda" },
    ],
  },
  {
    name: "ProtoLab",
    items: [
      { to: "/contacto", label: "Contacto" },
      { to: "/terminos", label: "Términos y condiciones" },
      { to: "/privacidad", label: "Privacidad" },
    ],
  },
] as const;

async function share() {
  const url = window.location.origin;
  try {
    if (navigator.share) await navigator.share({ title: "ProtoLab", url });
    else {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado");
    }
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "AbortError"))
      toast.error("Puedes compartir ProtoLab copiando la dirección del navegador.");
  }
}

export function Footer() {
  return (
    <footer className="market-footer">
      <div className="market-container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Tu idea. Tu pieza. Fabricada.</p>
          <span>
            <Globe2 size={15} /> Honduras · HNL
          </span>
        </div>
        {sections.map((section) => (
          <nav aria-label={section.name} key={section.name}>
            <h3>{section.name}</h3>
            {section.items.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
            {section.name === "ProtoLab" && (
              <a
                className="footer-social"
                href="https://linktr.ee/pprotolab"
                target="_blank"
                rel="noopener noreferrer"
              >
                Redes sociales <ArrowUpRight size={13} />
              </a>
            )}
          </nav>
        ))}
      </div>
      <div className="market-container footer-bottom">
        <span>© 2026 ProtoLab</span>
        <button type="button" onClick={() => void share()}>
          <Share2 size={15} /> Compartir ProtoLab <ArrowUpRight size={14} />
        </button>
      </div>
    </footer>
  );
}
