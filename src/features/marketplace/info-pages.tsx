import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Box,
  Download,
  Factory,
  FileBox,
  HelpCircle,
  MapPin,
  PencilRuler,
} from "lucide-react";
import { LICENSE_TERMS } from "@/lib/design-commerce";
import { MATERIALS } from "@/lib/protolab";
import { PageTitle } from "./ui";

const faqs = [
  [
    "¿Qué se puede encontrar en ProtoLab?",
    "Diseños digitales con licencia, productos físicos y servicios de modelado, asesoría o fabricación personalizada.",
  ],
  [
    "¿Cómo solicito una pieza a medida?",
    "Describe la pieza, adjunta un archivo si lo tienes y selecciona un fabricante disponible. Revisa su oferta en tu cuenta cuando esté lista.",
  ],
  [
    "¿Dónde están los diseños que compré?",
    "En Mi cuenta, abre Mis diseños. Allí puedes revisar los formatos, la licencia y la descarga.",
  ],
  [
    "¿Cómo recibo una pieza física?",
    "Acuerda los detalles de entrega o envío directamente con el vendedor.",
  ],
  [
    "¿Puedo empezar sin un archivo 3D?",
    "Sí. Describe la aplicación y da las medidas o requisitos que ya conozcas. Si necesitas modelado, consulta los servicios de diseño.",
  ],
  [
    "¿Para qué sirve la Calculadora de costos?",
    "Sirve al vendedor para estimar costos con sus propios valores. El precio de una solicitud personalizada lo establece el especialista en su oferta.",
  ],
] as const;

export function HelpPage() {
  return (
    <div className="market-container market-page">
      <PageTitle
        title="Centro de ayuda"
        breadcrumb="Ayuda"
        description="Encuentra respuestas sobre compras, descargas y fabricación."
      />
      <div className="narrow-content stack">
        {faqs.map(([question, answer]) => (
          <details className="surface faq-row" key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
        <Link className="text-action" to="/contacto">
          Ver opciones de contacto <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="market-container market-page">
      <PageTitle
        title="Contacto"
        breadcrumb="Contacto"
        description="Elige cómo quieres conversar sobre tu proyecto."
      />
      <div className="step-grid">
        <article>
          <span className="step-icon">
            <MapPin size={22} />
          </span>
          <h3>ProtoLab Studio</h3>
          <p>
            Consulta los servicios y el portafolio de la cuenta comercial de ProtoLab en El
            Progreso.
          </p>
          <Link className="text-action" to="/fabricante/$id" params={{ id: "protolab" }}>
            Consultar perfil <ArrowRight size={16} />
          </Link>
        </article>
        <article>
          <span className="step-icon">
            <Factory size={22} />
          </span>
          <h3>Solicita fabricación</h3>
          <p>Describe tu proyecto y elige el taller que quieres consultar.</p>
          <Link className="text-action" to="/solicitar-fabricacion">
            Empezar una solicitud <ArrowRight size={16} />
          </Link>
        </article>
        <article>
          <span className="step-icon">
            <HelpCircle size={22} />
          </span>
          <h3>Ayuda con una compra</h3>
          <p>Consulta tu pedido, descarga un diseño o revisa una oferta desde tu cuenta.</p>
          <Link className="text-action" to="/cuenta">
            Ir a mi cuenta <ArrowRight size={16} />
          </Link>
        </article>
      </div>
    </div>
  );
}

export function ProcessPage() {
  const steps = [
    {
      Icon: Box,
      title: "Encuentra",
      copy: "Explora las publicaciones y compara precios, especificaciones y perfiles.",
      route: "/marketplace",
      action: "Abrir marketplace",
    },
    {
      Icon: PencilRuler,
      title: "Compra o solicita",
      copy: "Adquiere un diseño o envía un proyecto a un fabricante para recibir una oferta.",
      route: "/solicitar-fabricacion",
      action: "Solicitar fabricación",
    },
    {
      Icon: Download,
      title: "Recibe",
      copy: "Descarga los diseños en tu biblioteca. Para una pieza física, coordina la entrega con el vendedor.",
      route: "/cuenta",
      action: "Consultar mi cuenta",
    },
  ] as const;
  return (
    <div className="market-container market-page">
      <PageTitle title="Cómo funciona ProtoLab" breadcrumb="Cómo funciona" />
      <div className="step-grid">
        {steps.map(({ Icon, title, copy, route, action }) => (
          <article key={title}>
            <span className="step-icon">
              <Icon size={23} />
            </span>
            <h3>{title}</h3>
            <p>{copy}</p>
            <Link to={route} className="text-action">
              {action} <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export function MaterialsPage() {
  return (
    <div className="market-container market-page">
      <PageTitle
        title="Materiales de fabricación"
        breadcrumb="Materiales"
        description="Revisa opciones y confirma el material con el fabricante según la aplicación."
      />
      <div className="portfolio-grid">
        {MATERIALS.map((item) => (
          <article className="surface prose-market" key={item.code}>
            <FileBox size={24} />
            <h2>{item.code}</h2>
            <p>{item.ideal}</p>
            <p>{item.spec}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function LegalPage({ privacy = false }: { privacy?: boolean }) {
  const title = privacy ? "Privacidad" : "Términos y condiciones";
  return (
    <div className="market-container market-page">
      <PageTitle title={title} breadcrumb={title} />
      <article className="surface prose-market narrow-content">
        {privacy ? (
          <>
            <h2>Datos guardados en este navegador</h2>
            <p>
              Las preferencias, compras y solicitudes se guardan en el almacenamiento local del
              navegador. Los archivos que el vendedor agrega a una publicación se guardan en su
              dispositivo.
            </p>
            <h2>Información de una solicitud</h2>
            <p>
              El selector muestra el nombre, la extensión y el tamaño del archivo. Evita incluir
              contraseñas, documentos personales o datos de pago en tus publicaciones y solicitudes.
            </p>
            <h2>Restablecimiento</h2>
            <p>
              Puedes quitar el historial y los archivos locales desde Configuración en tu cuenta.
            </p>
            <Link className="text-action" to="/cuenta" search={{ seccion: "configuracion" }}>
              Abrir configuración <ArrowRight size={16} />
            </Link>
          </>
        ) : (
          <>
            <h2>Compras y fabricación a medida</h2>
            <p>
              Los diseños, productos físicos y servicios de fabricación se adquieren por separado.
              Cada vendedor define el precio, el plazo y las condiciones de su oferta.
            </p>
            <h2>Licencias de diseños</h2>
            <p>{LICENSE_TERMS}</p>
            <h2>Entrega</h2>
            <p>
              Los diseños adquiridos se descargan desde Mis diseños. La entrega física se coordina
              directamente con el vendedor.
            </p>
          </>
        )}
      </article>
    </div>
  );
}
