// Clasificación editorial: el equipo revisa el trabajo de desarrollo, no solo la apariencia.
// Los precios se proponen por diseño y se aprueban; no se inventan tarifas universales.
export const COMPLEXITIES = {
  basic: {
    label: "Básica",
    description: "Pieza sencilla, geometría directa y pocas operaciones de modelado.",
  },
  intermediate: {
    label: "Intermedia",
    description: "Varios detalles funcionales, encajes o componentes relacionados.",
  },
  advanced: {
    label: "Avanzada",
    description: "Ensambles, mecanismos o desarrollo y documentación extensos.",
  },
} as const;
export type Complexity = keyof typeof COMPLEXITIES;
export const DESIGN_LICENSE = "Uso personal · ProtoLab v1";
export const LICENSE_TERMS =
  "La compra permite descargar el archivo e imprimir piezas para uso propio. No incluye redistribuir, revender ni publicar el archivo, ni vender las piezas impresas. Para fabricación comercial, solicita autorización específica. Comprar una pieza fabricada no incluye el archivo digital.";
export const PURCHASE_STATUSES = {
  pending: "Pendiente de pago",
  paid: "Pago verificado",
  revoked: "Acceso revocado",
} as const;
export const designPrice = (price: number) =>
  new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 0,
  }).format(price);
