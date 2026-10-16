// Central configuration + demo data for the ProtoLab MVP.
// Change BRAND to rename the project everywhere.
export const BRAND = {
  name: "ProtoLab",
  tagline: "Fabricación digital y prototipado bajo demanda.",
  email: "hola@protolab.hn",
  whatsapp: "+504 9111 0000",
  country: "Honduras",
  codePrefix: "PL",
};

export const NAV_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/servicios", label: "Servicios" },
  { to: "/ejemplos", label: "Ejemplos" },
  { to: "/como-funciona", label: "Cómo funciona" },
  { to: "/seguimiento", label: "Seguimiento" },
] as const;

export const FOOTER_LINKS = [
  { to: "/servicios", label: "Servicios" },
  { to: "/ejemplos", label: "Ejemplos" },
  { to: "/materiales", label: "Materiales" },
  { to: "/asesoria", label: "Asesoría" },
  { to: "/cotizar", label: "Cotizar" },
  { to: "/seguimiento", label: "Seguimiento" },
  { to: "/faq", label: "Preguntas frecuentes" },
  { to: "/contacto", label: "Contacto" },
];

/** Home: proceso resumido en 3 pasos. */
export const HOME_STEPS = [
  { n: "01", title: "Envía", text: "Sube tu archivo o cuéntanos qué necesitas." },
  { n: "02", title: "Cotiza", text: "Recibes una estimación preliminar y orientación técnica." },
  { n: "03", title: "Fabricamos", text: "Aprobado el proyecto, fabricamos y das seguimiento." },
];

/** Punto de partida del usuario (home y paso 1 del cotizador). */
export const START_OPTIONS = [
  { id: "archivo", title: "Tengo un archivo 3D", text: "STL, OBJ, STEP o STP." },
  { id: "boceto", title: "Tengo un dibujo o boceto", text: "Una foto o dibujo con medidas." },
  { id: "pieza", title: "Tengo una pieza física", text: "La medimos y la reproducimos." },
  { id: "idea", title: "Solo tengo una idea", text: "Te ayudamos a definirla." },
] as const;

export type StartOptionId = (typeof START_OPTIONS)[number]["id"];

export const USE_CASES = [
  "Proyecto universitario",
  "Prototipo",
  "Repuesto",
  "Pieza funcional",
  "Producto para vender",
  "Prueba de concepto",
  "Otro",
];

export const REQUIREMENTS = [
  "Solo debe verse bien",
  "Debe soportar peso",
  "Debe resistir golpes",
  "Debe resistir calor",
  "Debe ser flexible",
  "No estoy seguro",
];

export const MARKETPLACE_CATEGORIES = [
  { title: "Impresión 3D", text: "Piezas, prototipos y componentes.", soon: false },
  { title: "Modelado 3D", text: "De la idea al archivo fabricable.", soon: false },
  { title: "Prototipado", text: "Versiones físicas para validar.", soon: false },
  { title: "Piezas personalizadas", text: "Fabricación bajo pedido.", soon: false },
  { title: "CNC", text: "En evaluación.", soon: true },
  { title: "Corte láser", text: "En evaluación.", soon: true },
  { title: "Resina", text: "En evaluación.", soon: true },
  { title: "PCB", text: "En evaluación.", soon: true },
];

/** Recomendación simple de material según lo que la pieza debe hacer. */
export function recommendMaterial(requirement: string): { code: string; why: string } {
  switch (requirement) {
    case "Debe soportar peso":
      return { code: "PETG", why: "Buen equilibrio entre resistencia y tenacidad." };
    case "Debe resistir golpes":
      return { code: "PETG", why: "Absorbe impacto mejor que el PLA." };
    case "Debe resistir calor":
      return { code: "ABS", why: "Mayor tolerancia térmica." };
    case "Debe ser flexible":
      return { code: "TPU", why: "Material flexible, absorbe deformación." };
    case "Solo debe verse bien":
      return { code: "PLA", why: "Buen detalle y acabado para piezas visuales." };
    default:
      return { code: "PETG", why: "Opción versátil mientras revisamos tu pieza." };
  }
}


export const PROCESS_STEPS = [
  {
    n: "01",
    title: "Sube tu diseño",
    text: "Envía un archivo 3D o describe la pieza que necesitas.",
  },
  {
    n: "02",
    title: "Recibe tu cotización",
    text: "Obtén información sobre costo y tiempo estimado.",
  },
  {
    n: "03",
    title: "Recibe asesoría",
    text: "Te recomendamos materiales y parámetros de fabricación.",
  },
  {
    n: "04",
    title: "Fabricamos tu pieza",
    text: "El proyecto entra al proceso de fabricación.",
  },
  {
    n: "05",
    title: "Recibe y evalúa",
    text: "Obtén tu pieza y califica el servicio.",
  },
];

export const SERVICES = [
  {
    title: "Impresión 3D",
    text: "Fabricación de piezas, prototipos, mecanismos, soportes, carcasas y componentes personalizados.",
  },
  {
    title: "Diseño y modelado 3D",
    text: "Ayuda para convertir una idea, boceto o necesidad en un modelo digital fabricable.",
  },
  {
    title: "Prototipado",
    text: "Versiones físicas para validar dimensiones, funcionamiento y diseño antes de producir una versión final.",
  },
  {
    title: "Asesoría técnica",
    text: "Orientación sobre materiales, resistencia, tolerancias, orientación de impresión y alternativas de fabricación.",
  },
  {
    title: "Fabricación personalizada",
    text: "Producción bajo pedido para proyectos académicos, profesionales y emprendimientos.",
  },
  {
    title: "Próximamente",
    text: "CNC, corte láser, resina, grabado y fabricación de PCB dentro de la misma plataforma.",
    soon: true,
  },
];

export const AUDIENCES = [
  {
    title: "Estudiantes",
    text: "Construye tus proyectos universitarios sin tener que comprar maquinaria.",
  },
  {
    title: "Ingenieros y profesionales",
    text: "Obtén prototipos y piezas funcionales para pruebas, mantenimiento o desarrollo.",
  },
  {
    title: "Emprendedores",
    text: "Convierte una idea de producto en un prototipo físico antes de invertir en producción.",
  },
  {
    title: "Pequeñas empresas",
    text: "Solicita componentes personalizados y soluciones de fabricación bajo demanda.",
  },
];

export const MATERIALS = [
  {
    code: "PLA",
    ideal: "Prototipos y piezas visuales.",
    spec: "Fácil de imprimir · buen detalle",
    strength: 55,
  },
  {
    code: "PETG",
    ideal: "Piezas funcionales y resistentes.",
    spec: "Resistente · buena tenacidad",
    strength: 80,
  },
  {
    code: "ABS",
    ideal: "Aplicaciones con mayores exigencias térmicas.",
    spec: "Térmico hasta ~90 °C",
    strength: 75,
  },
  {
    code: "TPU",
    ideal: "Piezas flexibles.",
    spec: "Flexible · absorbe impacto",
    strength: 45,
  },
];


export const FAQS = [
  {
    q: "¿Qué archivos puedo enviar?",
    a: "Aceptamos .STL, .OBJ, .STEP y .STP. Si tienes otro formato, escríbenos y lo revisamos.",
  },
  {
    q: "¿Qué pasa si no tengo un diseño 3D?",
    a: "No hay problema. Puedes enviarnos una idea, un boceto o una foto de la pieza y te ayudamos a modelarla.",
  },
  {
    q: "¿Cuánto tarda una impresión?",
    a: "La mayoría de piezas pequeñas están listas en 2 a 3 días. Piezas grandes o pedidos múltiples pueden tomar más.",
  },
  {
    q: "¿Qué material debo elegir?",
    a: "Si la pieza es visual, PLA. Si debe resistir esfuerzo, PETG. Si no estás seguro, elige “No estoy seguro” y te orientamos.",
  },
  {
    q: "¿Cómo se calcula el precio?",
    a: "Consideramos material, volumen de la pieza, tiempo de máquina, cantidad y prioridad. El precio mostrado en el cotizador es preliminar.",
  },
  {
    q: "¿Puedo pedir una sola pieza?",
    a: "Sí. Trabajamos desde una unidad; no hay cantidad mínima.",
  },
  {
    q: "¿Realizan proyectos para estudiantes?",
    a: "Sí, es nuestro público principal. Adaptamos parámetros para reducir costo en proyectos académicos.",
  },
  {
    q: "¿Pueden ayudarme a mejorar mi diseño?",
    a: "Sí. Revisamos espesores, tolerancias y orientación de impresión y te proponemos ajustes antes de fabricar.",
  },
];

export const ORDER_STATUSES = [
  "Solicitud recibida",
  "Diseño en revisión",
  "Cotización enviada",
  "Pedido aprobado",
  "En fabricación",
  "Control de calidad",
  "Listo para entrega",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  code: string;
  project: string;
  material: string;
  technology: string;
  quantity: number;
  priority: string;
  statusIndex: number;
  createdAt: string;
  estimatedDelivery: string;
  price: number;
  client?: string;
};

export const DEMO_ORDERS: Order[] = [
  {
    code: "PL-2026-00124",
    project: "Carcasa para sensor",
    material: "PETG",
    technology: "Impresión 3D FDM",
    quantity: 2,
    priority: "Normal",
    statusIndex: 4,
    createdAt: "02/09/2026",
    estimatedDelivery: "4 de septiembre",
    price: 480,
    client: "Carlos A.",
  },
  {
    code: "PL-2026-00118",
    project: "Soporte para motor",
    material: "PLA",
    technology: "Impresión 3D FDM",
    quantity: 1,
    priority: "Normal",
    statusIndex: 6,
    createdAt: "28/08/2026",
    estimatedDelivery: "30 de agosto",
    price: 260,
    client: "María L.",
  },
  {
    code: "PL-2026-00131",
    project: "Engranaje de prueba",
    material: "PETG",
    technology: "Impresión 3D FDM",
    quantity: 4,
    priority: "Urgente",
    statusIndex: 2,
    createdAt: "01/09/2026",
    estimatedDelivery: "5 de septiembre",
    price: 640,
    client: "Taller Mecatrónica UNAH",
  },
];

const STORAGE_KEY = "protolab:orders";

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Order) {
  if (typeof window === "undefined") return;
  const all = [order, ...loadOrders()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function allOrders(): Order[] {
  return [...loadOrders(), ...DEMO_ORDERS];
}

export function findOrder(code: string): Order | undefined {
  const needle = code.trim().toUpperCase();
  return allOrders().find((o) => o.code.toUpperCase() === needle);
}

export function generateCode(): string {
  const n = 124 + Math.floor(Math.random() * 800);
  return `${BRAND.codePrefix}-2026-${String(n).padStart(5, "0")}`;
}

/** Preliminary price estimate — demo formula only. */
export function estimatePrice(input: {
  material: string;
  quantity: number;
  priority: string;
  mechanical: string;
}) {
  const base: Record<string, number> = {
    PLA: 180,
    PETG: 240,
    ABS: 260,
    TPU: 310,
    "No estoy seguro": 240,
  };
  const unit = base[input.material] ?? 240;
  let total = unit * Math.max(1, input.quantity);
  if (input.priority === "Urgente") total *= 1.35;
  if (input.mechanical === "Sí") total *= 1.1;
  return Math.round(total / 10) * 10;
}

export function estimatedDays(priority: string) {
  return priority === "Urgente" ? "1–2 días" : "2–3 días";
}
