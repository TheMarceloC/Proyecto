import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Download,
  Factory,
  PencilRuler,
  Search,
  ShoppingBag,
} from "lucide-react";
import { catalogImage, sellers } from "@/features/marketplace/catalog";
import { useMarket } from "@/features/marketplace/store";
import { ProductCard, SellerCard } from "@/features/marketplace/ui";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "ProtoLab | Marketplace de fabricación digital en Honduras" }] }),
  component: Home,
});

const options = [
  {
    title: "Diseños digitales",
    description: "Modelos 3D y archivos descargables",
    Icon: Download,
    image: catalogImage("carcasa-iot", true),
    to: "/marketplace",
    search: { tipo: "digital" },
  },
  {
    title: "Productos físicos",
    description: "Piezas, accesorios y artículos de taller",
    Icon: Box,
    image: catalogImage("organizador-modular", true),
    to: "/marketplace",
    search: { tipo: "physical" },
  },
  {
    title: "Fabricación personalizada",
    description: "Encuentra un taller para tu proyecto",
    Icon: Factory,
    image: "/marketplace/workshops/taller-fdm.webp",
    to: "/solicitar-fabricacion",
  },
  {
    title: "Diseño y asesoría",
    description: "Modelado CAD e ingeniería a medida",
    Icon: PencilRuler,
    image: "/marketplace/workshops/estudio-cad.webp",
    to: "/servicios-diseno",
  },
] as const;
const steps = [
  {
    Icon: Search,
    title: "Encuentra lo que necesitas",
    text: "Explora diseños, productos y perfiles de especialistas.",
  },
  {
    Icon: ShoppingBag,
    title: "Compra o solicita fabricación",
    text: "Elige una publicación o comparte tu proyecto con un fabricante.",
  },
  {
    Icon: Download,
    title: "Descarga o coordina la entrega",
    text: "Accede a tus archivos en tu biblioteca. Para piezas físicas, acuerda la entrega con el vendedor.",
  },
];

function Home() {
  const { state } = useMarket();
  const featured = state.products
    .filter((product) => product.featured && !product.hidden)
    .slice(0, 8);
  return (
    <>
      <section className="market-container home-top">
        <div className="market-hero">
          <div className="hero-content">
            <div className="hero-kicker">
              <span /> Fabricación digital en Honduras
            </div>
            <h1>
              De tus ideas a<br /> <em>objetos reales.</em>
            </h1>
            <p>Descubre diseños, encuentra fabricantes y transforma tus proyectos con ProtoLab.</p>
            <div className="button-row">
              <Link to="/marketplace" className="market-button primary">
                Explorar marketplace <ArrowRight size={18} />
              </Link>
              <Link to="/solicitar-fabricacion" className="market-button hero-secondary">
                Solicitar fabricación
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/marketplace/hero.webp"
              width="1500"
              height="1000"
              fetchPriority="high"
              alt="Impresora 3D fabricando un conjunto planetario azul"
            />
          </div>
        </div>
      </section>

      <section className="market-container home-section home-categories">
        <div className="group-heading">
          <div>
            <h2>Explora ProtoLab</h2>
          </div>
        </div>
        <div className="category-grid">
          {options.map(({ title, description, Icon, image, to, ...rest }) => (
            <Link className="category-card" key={title} to={to} {...rest}>
              <img src={image} alt="" loading="lazy" />
              <div className="category-copy">
                <span>
                  <Icon size={17} />
                  {title}
                </span>
                <small>{description}</small>
              </div>
              <ArrowUpRight className="category-arrow" size={17} />
            </Link>
          ))}
        </div>
      </section>

      <section className="market-container home-section">
        <div className="group-heading">
          <div>
            <h2>Destacados del marketplace</h2>
            <p>Diseños, piezas y herramientas de nuestros colaboradores.</p>
          </div>
          <Link to="/marketplace" className="text-action">
            Ver marketplace <ArrowRight size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="home-band">
        <div className="market-container home-section">
          <div className="group-heading">
            <div>
              <h2>Fabricantes en Honduras</h2>
              <p>Encuentra un taller por ciudad, tecnología y especialidad.</p>
            </div>
            <Link className="text-action" to="/fabricantes">
              Ver fabricantes <ArrowRight size={17} />
            </Link>
          </div>
          <div className="seller-grid">
            {["protolab", "forma", "fusion"].map((id) => (
              <SellerCard key={id} seller={sellers.find((seller) => seller.id === id)!} />
            ))}
          </div>
        </div>
      </section>

      <section className="market-container home-section" id="como-funciona">
        <div className="group-heading">
          <div>
            <h2>Cómo funciona</h2>
          </div>
        </div>
        <div className="step-grid">
          {steps.map(({ Icon, title, text }) => (
            <article key={title}>
              <span className="step-icon">
                <Icon size={23} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="market-container home-section seller-banner-wrap">
        <div className="seller-banner">
          <div>
            <h2>Convierte tus habilidades y equipos en nuevas oportunidades.</h2>
            <p>
              Publica tus diseños, establece tus precios y conecta con clientes que buscan
              fabricación digital.
            </p>
            <Link to="/vender" className="market-button light">
              Comenzar a vender <ArrowRight size={18} />
            </Link>
          </div>
          <img
            src="/marketplace/workshops/taller-resina.webp"
            alt="Banco de trabajo de fabricación digital"
            loading="lazy"
          />
        </div>
      </section>
    </>
  );
}
