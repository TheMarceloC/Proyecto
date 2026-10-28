import type { Design } from "./community";
import { DESIGN_LICENSE } from "./design-commerce";
import soporte from "@/assets/proj-soporte-sensor.jpg";
import carcasa from "@/assets/proj-carcasa.jpg";
import engranaje from "@/assets/proj-engranaje.jpg";

// Presentación pública autorizada: desactivar al activar catálogo, pagos y migración comercial.
// Estos precios son ejemplos de presentación, no tarifas validadas ni publicaciones aprobadas.
export const CATALOG_DEMO_MODE = true;
export const DEMO_DESIGNS: Design[] = [
  {
    id: "demo-soporte-sensor",
    title: "Soporte para sensor",
    category: "Electrónica",
    material: "PETG",
    image_url: soporte,
    complexity: "basic" as const,
    price: 100,
    description:
      "Un punto de partida para fijar un sensor y organizar su montaje. Revisa dimensiones, ubicación y condiciones de uso antes de fabricar una pieza para tu equipo.",
    complexity_notes:
      "Geometría directa de una pieza, con puntos de fijación. Ejemplo de diseño de complejidad básica.",
  },
  {
    id: "demo-carcasa-electronica",
    title: "Carcasa para electrónica",
    category: "Organización",
    material: "PLA",
    image_url: carcasa,
    complexity: "intermediate" as const,
    price: 250,
    description:
      "Una referencia de alojamiento con tapa y aberturas para un proyecto electrónico. Los espacios para conectores y componentes se adaptarían a las medidas de cada proyecto.",
    complexity_notes:
      "Cuerpo y tapa relacionados, distribución de aberturas y encajes. Ejemplo de complejidad intermedia.",
  },
  {
    id: "demo-conjunto-engranajes",
    title: "Conjunto de engranajes",
    category: "Mecánica",
    material: "PETG",
    image_url: engranaje,
    complexity: "advanced" as const,
    price: 500,
    description:
      "Una referencia de mecanismo con varias piezas relacionadas para explorar movimiento y ensamble. La aplicación, las cargas y los ajustes requieren revisión antes de una fabricación funcional.",
    complexity_notes:
      "Desarrollo de varios componentes y sus relaciones de ensamble. Ejemplo de complejidad avanzada; no es una validación mecánica.",
  },
].map((design) => ({
  ...design,
  owner_id: "demo",
  author_name: "Colección ProtoLab",
  license: DESIGN_LICENSE,
  status: "pending" as const,
  created_at: "2026-10-27T00:00:00Z",
}));

export function demoDesign(id: string | undefined) {
  return CATALOG_DEMO_MODE ? DEMO_DESIGNS.find((design) => design.id === id) : undefined;
}
