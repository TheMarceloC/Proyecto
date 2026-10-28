// Configuración de servicios y recorrido de fabricación.
// Change BRAND to rename the project everywhere.
export const BRAND = {
  name: "ProtoLab",
  tagline: "Fabricación digital y prototipado bajo demanda.",
  country: "Honduras",
  codePrefix: "PL",
};

export const NAV_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/servicios", label: "Servicios" },
  { to: "/disenos", label: "Diseños" },
  { to: "/como-funciona", label: "Cómo funciona" },
  { to: "/seguimiento", label: "Seguimiento" },
] as const;

export const FOOTER_LINKS = [
  { to: "/servicios", label: "Servicios" },
  { to: "/disenos", label: "Diseños" },
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
  "Mantenimiento o reparación",
  "Prototipo",
  "Repuesto",
  "Pieza funcional",
  "Producto para vender",
  "Prueba de concepto",
  "Proyecto académico",
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
];

/** Recomendación simple de material según lo que la pieza debe hacer. */
export function recommendMaterial(requirement: string): { code: string; why: string } {
  switch (requirement) {
    case "Debe soportar peso":
      return {
        code: "PETG",
        why: "Candidato para revisar según cargas, orientación y geometría de la pieza.",
      };
    case "Debe resistir golpes":
      return {
        code: "PETG",
        why: "Candidato sujeto a revisión de la aplicación y del filamento disponible.",
      };
    case "Debe resistir calor":
      return {
        code: "ABS",
        why: "Revisaremos la temperatura de servicio con la ficha del filamento.",
      };
    case "Debe ser flexible":
      return {
        code: "TPU",
        why: "Revisaremos flexibilidad y dureza según el filamento disponible.",
      };
    case "Solo debe verse bien":
      return { code: "PLA", why: "Buen detalle y acabado para piezas visuales." };
    default:
      return { code: "PETG", why: "Selección inicial que confirmaremos al revisar tu proyecto." };
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
    text: "Producción de piezas y útiles en pequeñas cantidades para talleres, ingeniería y negocios.",
  },
];

export const AUDIENCES = [
  {
    title: "Técnicos y talleres",
    text: "Solicita piezas específicas para mantenimiento y reparación, con revisión de su aplicación.",
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
  },
  {
    code: "PETG",
    ideal: "Piezas funcionales y resistentes.",
    spec: "Resistente · buena tenacidad",
  },
  {
    code: "ABS",
    ideal: "Aplicaciones con mayores exigencias térmicas.",
    spec: "Evaluar temperatura y entorno de uso",
  },
  {
    code: "TPU",
    ideal: "Piezas flexibles.",
    spec: "Flexible · absorbe impacto",
  },
];

export const FAQS = [
  {
    q: "¿Cómo pago un diseño?",
    a: "Registra la solicitud de compra y coordina el pago con el equipo desde Contacto indicando su referencia. No se cobra con tarjeta desde esta página. La descarga se habilita tras la verificación manual del pago.",
  },
  {
    q: "¿Puedo vender mis diseños?",
    a: "Envía el archivo, una portada, su documentación, complejidad, precio y condiciones comerciales propuestas. El equipo revisa y acuerda las condiciones contigo antes de publicar. No se prometen comisiones ni ingresos automáticos.",
  },
  {
    q: "¿Tengo que pagar para ver los diseños?",
    a: "Explorar el catálogo es gratuito y no requiere cuenta. Cada archivo tiene un precio; se descarga después de comprarlo y de que el equipo verifique el pago.",
  },
  {
    q: "¿Cómo se fija el precio de un diseño?",
    a: "El creador propone un precio y el equipo lo revisa según el modelado, los componentes, ensambles y documentación. Cada diseño se compra por separado; publicar no habilita descargas de otros archivos.",
  },
  {
    q: "¿Puedo comprar solo la pieza fabricada?",
    a: "Sí. Abre el diseño y selecciona Cotizar pieza fabricada. La fabricación se cotiza por separado y no incluye automáticamente el archivo digital.",
  },
  {
    q: "¿Qué archivos puedo enviar?",
    a: "Aceptamos .STL, .OBJ, .STEP y .STP. Si tienes otro formato, escríbenos y lo revisamos.",
  },
  {
    q: "¿Qué pasa si no tengo un diseño 3D?",
    a: "Empieza contándonos tu idea con tus propias palabras. Puedes añadir un boceto o una foto, pero no es obligatorio. Nosotros te ayudamos con el diseño, el material y las medidas; no necesitas saber el peso ni el tiempo de impresión.",
  },
  {
    q: "¿Cuánto tarda una impresión?",
    a: "Confirmamos el plazo después de revisar el archivo, la cantidad y la disponibilidad de fabricación.",
  },
  {
    q: "¿Qué material debo elegir?",
    a: "Si la pieza es visual, PLA. Si debe resistir esfuerzo, PETG. Si no estás seguro, elige “No estoy seguro” y te orientamos.",
  },
  {
    q: "¿Cómo se calcula el precio?",
    a: "Verás un precio final estimado para tu pedido según el material, la cantidad y las características de la pieza. Lo confirmamos al revisar tu proyecto. Si necesitas diseño, se cotiza la consultoría por separado; el envío también se acuerda aparte.",
  },
  {
    q: "¿Puedo pedir una sola pieza?",
    a: "Sí. Trabajamos desde una unidad; no hay cantidad mínima.",
  },
  {
    q: "¿A quiénes atiende ProtoLab?",
    a: "Priorizamos técnicos, ingenieros, talleres y negocios que necesitan piezas o prototipos en pequeñas cantidades. También atendemos proyectos académicos y particulares, según la aplicación y la capacidad disponible.",
  },
  {
    q: "¿Necesito una cuenta para estimar el precio?",
    a: "Puedes obtener una estimación orientativa sin cuenta ni datos de contacto. Si no conoces peso u horas, elige un tamaño de referencia. Solo pedimos tus datos e iniciar sesión al guardar y enviar la solicitud a revisión.",
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
