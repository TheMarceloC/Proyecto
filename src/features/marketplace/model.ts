import {
  accounts,
  commissionRate,
  products,
  sellers,
  type AccountId,
  type Product,
} from "./catalog.ts";

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  accountId?: AccountId;
};
export type CartLine = { productId: string; quantity: number };
export type OrderLine = Pick<
  Product,
  "id" | "name" | "price" | "kind" | "images" | "asset" | "formats" | "license" | "category"
> & { quantity: number };
export type Order = {
  id: string;
  date: string;
  buyerId: string;
  sellerId: string;
  method: string;
  lines: OrderLine[];
  total: number;
  commission: number;
  processed: boolean;
  requestId?: string;
};
export type RequestStatus =
  | "Solicitud enviada"
  | "Oferta recibida"
  | "Oferta aceptada"
  | "Pago confirmado"
  | "Finalizado"
  | "Oferta rechazada";
export type Attachment = { name: string; bytes: number; extension: string };
export type RequestDraft = {
  title: string;
  description: string;
  pieceType: string;
  application: string;
  quantity: number;
  material: string;
  color: string;
  dimensions: string;
  finish: string;
  notes: string;
  attachment?: Attachment | undefined;
  sellerId: string;
  productId?: string | undefined;
};
export type ManufacturingRequest = RequestDraft & {
  id: string;
  date: string;
  buyerId: string;
  status: RequestStatus;
};
export type Offer = {
  requestId: string;
  price: number;
  material: string;
  quantity: number;
  days: number;
  notes: string;
};
export type Notification = {
  id: string;
  accountId: AccountId;
  title: string;
  detail: string;
  date: string;
  href: string;
  read: boolean;
};
export type Preferences = { email: boolean; whatsapp: boolean };

export type MarketState = {
  activeAccount: AccountId;
  products: Product[];
  availability: Record<string, boolean>;
  favorites: Partial<Record<AccountId, string[]>>;
  carts: Partial<Record<AccountId, CartLine[]>>;
  requests: ManufacturingRequest[];
  offers: Offer[];
  orders: Order[];
  reviews: Review[];
  notifications: Notification[];
  preferences: Partial<Record<AccountId, Preferences>>;
};

const comments = [
  ["Las medidas y las vistas me ayudaron a revisar el montaje antes de avanzar.", 5],
  ["La presentación es clara. Consulté un detalle y pude resolverlo con el vendedor.", 4],
  ["El resultado coincidió con lo que necesitaba para mi proyecto.", 5],
  ["Para mi montaje habría preferido una explicación adicional de las medidas.", 3],
  ["Buena comunicación durante la revisión. Volvería a trabajar con este perfil.", 5],
  ["Pude revisar el diseño y decidir los cambios de la siguiente versión.", 4],
  ["El detalle de los acabados facilitó la selección del material.", 5],
  ["Todo quedó claro desde la ficha y el pedido fue sencillo.", 5],
  ["Me resultó práctico para comprobar el tamaño con las otras piezas.", 4],
  ["Se nota atención al detalle en la forma de presentar el trabajo.", 5],
  ["La información de la ficha me permitió elegir con confianza.", 5],
  ["La respuesta del vendedor me aclaró una duda que tenía del proyecto.", 5],
] as const;
const reviewers = [
  "Adriana P.",
  "Mario G.",
  "Valeria C.",
  "Luis M.",
  "Elena R.",
  "Jorge V.",
  "Sara L.",
  "Pablo F.",
  "Irene D.",
  "Hugo A.",
];

function orderLine(product: Product, quantity: number): OrderLine {
  const { id, name, price, kind, images, asset, formats, license, category } = product;
  return {
    id,
    name,
    price,
    kind,
    images: images.slice(0, 1),
    asset,
    formats,
    license,
    category,
    quantity,
  };
}
export const roundMoney = (amount: number) =>
  Math.round(amount * 100 + Number.EPSILON * Math.abs(amount * 100)) / 100;

function makeOrder(
  input: Omit<Order, "total" | "commission" | "processed">,
  processed = false,
): Order {
  const total = roundMoney(input.lines.reduce((sum, line) => sum + line.quantity * line.price, 0));
  return {
    ...input,
    total,
    commission: input.sellerId === "protolab" ? 0 : roundMoney(total * commissionRate),
    processed: input.sellerId === "protolab" || processed,
  };
}

export const months = [
  { key: "2026-06", month: "Jun", users: 24, vendors: 3, volume: 6 },
  { key: "2026-07", month: "Jul", users: 39, vendors: 5, volume: 9 },
  { key: "2026-08", month: "Ago", users: 57, vendors: 6, volume: 13 },
  { key: "2026-09", month: "Sep", users: 74, vendors: 8, volume: 15 },
  { key: "2026-10", month: "Oct", users: 103, vendors: 9, volume: 21 },
  { key: "2026-11", month: "Nov", users: 132, vendors: sellers.length, volume: 24 },
];
const baseOrders = months.flatMap(({ key, volume }, month, rows) => {
  const members = sellers.slice(0, rows[month]!.vendors).map((seller) => seller.id);
  const inventory = products.filter((product) => members.includes(product.sellerId));
  return Array.from({ length: volume }, (_, index) => {
    const product = inventory[(index * 7 + Math.floor(index / 4) + month * 4) % inventory.length]!;
    const quantity = product.kind === "physical" && index % 4 === 0 ? 2 : 1;
    return makeOrder(
      {
        id: "PL-C" + (month + 1) + String(index + 10),
        date: key + "-" + String(1 + index).padStart(2, "0") + "T12:00:00.000Z",
        buyerId: "historico-" + (((month * 11 + index) % 52) + 1),
        sellerId: product.sellerId,
        method: "Tarjeta",
        lines: [orderLine(product, quantity)],
      },
      month < 5 || index % 3 !== 0,
    );
  });
});
const purchases = [products[1]!, products[2]!].map((product, index) =>
  makeOrder({
    id: "PL-C320" + index,
    date: "2026-11-18T12:00:00.000Z",
    buyerId: "daniel",
    sellerId: product.sellerId,
    method: "Tarjeta",
    lines: [orderLine(product, 1)],
  }),
);
const samples: [string, string, string, RequestStatus, number, number, string, string][] = [
  [
    "PL-F2408",
    "Cubierta de terminales para banco",
    "forma",
    "Oferta recibida",
    680,
    3,
    "PETG",
    "2026-11-23",
  ],
  [
    "PL-F2407",
    "Guía de montaje para perfil",
    "protolab",
    "Solicitud enviada",
    0,
    1,
    "PETG",
    "2026-11-22",
  ],
  [
    "PL-F2406",
    "Probeta para pruebas de encaje",
    "vector",
    "Oferta aceptada",
    470,
    2,
    "ABS",
    "2026-11-21",
  ],
  ["PL-F2405", "Maqueta de cubierta", "fusion", "Pago confirmado", 860, 1, "PLA", "2026-11-18"],
  [
    "PL-F2404",
    "Base pequeña para microsensor",
    "layer",
    "Finalizado",
    350,
    2,
    "PETG",
    "2026-11-12",
  ],
];
const sampleRequests: ManufacturingRequest[] = samples.map(
  ([id, title, sellerId, status, , quantity, material, date]) => ({
    id,
    buyerId: "daniel",
    title,
    sellerId,
    status,
    quantity,
    material,
    date: date + "T12:00:00.000Z",
    description:
      "Pieza para validar el montaje en una primera iteración. Mantener el acceso a los puntos de unión.",
    pieceType: "Prototipo",
    application: "Montaje de verificación",
    color: "Gris",
    dimensions: "Por confirmar",
    finish: "Natural",
    notes: "",
  }),
);
const sampleOffers: Offer[] = samples
  .filter((row) => row[4])
  .map(([requestId, , , , price, quantity, material]) => ({
    requestId,
    price,
    quantity,
    material,
    days: 4,
    notes:
      "Incluye fabricación y revisión visual. Coordinamos la entrega después de confirmar el pedido.",
  }));

function makeOfferOrder(
  request: ManufacturingRequest,
  offer: Offer,
  id: string,
  date: string,
  method: string,
) {
  const order = makeOrder({
    id,
    date,
    buyerId: request.buyerId,
    sellerId: request.sellerId,
    method,
    lines: [
      {
        id: request.id,
        name: request.title,
        kind: "service",
        price: offer.price,
        images: [],
        formats: [],
        license: "",
        category: "Prototipos",
        quantity: 1,
      },
    ],
    requestId: request.id,
  });
  return order;
}
const historicManufacturing = sampleRequests
  .filter((request) => ["Finalizado", "Pago confirmado"].includes(request.status))
  .map((request, index) =>
    makeOfferOrder(
      request,
      sampleOffers.find((offer) => offer.requestId === request.id)!,
      "PL-C321" + index,
      request.date,
      "Tarjeta",
    ),
  );
const seedReviews = products.flatMap((product, index) => {
  const count = 5 + ((index * 3) % 8);
  return Array.from({ length: count }, (_, position): Review => {
    const [text, rating] = comments[(index * 4 + position * 5) % comments.length]!;
    return {
      id: product.id + "-r" + position,
      productId: product.id,
      rating,
      text,
      author: reviewers[(index + position * 3) % reviewers.length]!,
      date: new Date(Date.UTC(2026, 10, 20 - position)).toISOString(),
    };
  });
});

const seedNotifications: Notification[] = [
  {
    id: "n1",
    accountId: "daniel",
    title: "Recibiste una oferta de Forma3D",
    detail: "Cubierta de terminales para banco · PL-F2408",
    href: "/cuenta?seccion=ofertas",
    date: "2026-11-23T12:00:00Z",
    read: false,
  },
  {
    id: "n2",
    accountId: "daniel",
    title: "Tu diseño está disponible",
    detail: "Carcasa para nodo IoT · Nova CAD Studio",
    href: "/cuenta?seccion=biblioteca",
    date: "2026-11-18T12:00:00Z",
    read: false,
  },
  {
    id: "n3",
    accountId: "forma",
    title: "Oferta pendiente de respuesta",
    detail: "Cubierta de terminales para banco · PL-F2408",
    href: "/cuenta?seccion=ofertas",
    date: "2026-11-23T12:00:00Z",
    read: false,
  },
  {
    id: "n4",
    accountId: "nova",
    title: "Nueva venta de un diseño",
    detail: "Carcasa para nodo IoT · PL-C3200",
    href: "/cuenta?seccion=ventas",
    date: "2026-11-18T12:00:00Z",
    read: false,
  },
  {
    id: "n5",
    accountId: "protolab",
    title: "Nueva solicitud de fabricación",
    detail: "Guía de montaje para perfil · PL-F2407",
    href: "/cuenta?seccion=solicitudes",
    date: "2026-11-22T12:00:00Z",
    read: false,
  },
  {
    id: "n6",
    accountId: "admin",
    title: "Liquidaciones listas para revisión",
    detail: "Consulta el saldo pendiente de los colaboradores.",
    href: "/admin?seccion=liquidaciones",
    date: "2026-11-24T12:00:00Z",
    read: false,
  },
];
export function initialMarket(): MarketState {
  return {
    activeAccount: "daniel",
    products,
    availability: Object.fromEntries(sellers.map((seller) => [seller.id, seller.available])),
    favorites: { daniel: ["organizador-modular", "maqueta-pabellon"] },
    carts: {},
    requests: sampleRequests,
    offers: sampleOffers,
    orders: [...baseOrders, ...purchases, ...historicManufacturing],
    reviews: seedReviews,
    notifications: seedNotifications,
    preferences: {},
  };
}
export function ratingFor(reviews: Review[], productIds: string[]) {
  const entries = reviews.filter((review) => productIds.includes(review.productId));
  const average = entries.length
    ? entries.reduce((sum, review) => sum + review.rating, 0) / entries.length
    : 0;
  return { entries, average, count: entries.length };
}
export const sellerFor = (id: string) => sellers.find((seller) => seller.id === id);
export const sellerAccount = (id: string) =>
  accounts.find((account) => account.sellerId === id)?.id;
export function reviewForSeller(state: MarketState, id: string) {
  return ratingFor(
    state.reviews,
    state.products.filter((product) => product.sellerId === id).map((product) => product.id),
  );
}

export type MarketAction =
  | { type: "account"; id: AccountId }
  | { type: "favorite"; id: string }
  | { type: "cart"; id: string; quantity: number; additive?: boolean }
  | { type: "checkout"; sellerId: string; id: string; date: string; method: string }
  | { type: "request"; draft: RequestDraft; id: string; date: string }
  | { type: "offer"; offer: Offer; date: string }
  | {
      type: "offer-status";
      id: string;
      status: "Oferta aceptada" | "Oferta rechazada";
      date: string;
    }
  | { type: "offer-checkout"; id: string; orderId: string; date: string; method: string }
  | { type: "finish"; id: string; date: string }
  | { type: "availability"; id: string }
  | { type: "publish"; product: Product }
  | { type: "moderate"; id: string }
  | { type: "review"; productId: string; rating: number; text: string; date: string }
  | { type: "read"; id?: string }
  | { type: "preferences"; field: keyof Preferences; enabled: boolean }
  | { type: "settle"; id: string; date: string };

function notify(
  state: MarketState,
  accountId: AccountId | undefined,
  id: string,
  title: string,
  detail: string,
  date: string,
  href: string,
): MarketState {
  if (!accountId) return state;
  return {
    ...state,
    notifications: [
      { id, accountId, title, detail, date, href, read: false },
      ...state.notifications,
    ],
  };
}
function updateStatus(state: MarketState, id: string, status: RequestStatus) {
  return {
    ...state,
    requests: state.requests.map((request) =>
      request.id === id ? { ...request, status } : request,
    ),
  };
}
function recordOrder(state: MarketState, order: Order, buyer: AccountId) {
  let next = { ...state, orders: [order, ...state.orders] };
  next = notify(
    next,
    buyer,
    order.id + "-purchase",
    "Compra confirmada",
    order.id + " · " + sellerFor(order.sellerId)?.name,
    order.date,
    "/cuenta?seccion=compras",
  );
  if (order.lines.some((line) => line.kind === "digital"))
    next = notify(
      next,
      buyer,
      order.id + "-library",
      "Diseño disponible en tu biblioteca",
      order.lines
        .filter((line) => line.kind === "digital")
        .map((line) => line.name)
        .join(", "),
      order.date,
      "/cuenta?seccion=biblioteca",
    );
  return notify(
    next,
    sellerAccount(order.sellerId),
    order.id + "-sale",
    "Nueva venta",
    order.id + " · " + (order.lines[0]?.name ?? "Pedido"),
    order.date,
    "/cuenta?seccion=ventas",
  );
}

export function applyMarketAction(state: MarketState, action: MarketAction): MarketState {
  const accountId = state.activeAccount;
  const actor = accounts.find((account) => account.id === accountId)!;
  const cart = state.carts[accountId] ?? [];
  switch (action.type) {
    case "account":
      return { ...state, activeAccount: action.id };
    case "favorite": {
      const favorites = state.favorites[accountId] ?? [];
      return {
        ...state,
        favorites: {
          ...state.favorites,
          [accountId]: favorites.includes(action.id)
            ? favorites.filter((id) => id !== action.id)
            : [...favorites, action.id],
        },
      };
    }
    case "cart": {
      const product = state.products.find((entry) => entry.id === action.id);
      if (!product || (product.hidden && action.quantity > 0) || product.kind === "service")
        return state;
      if (
        product.kind === "digital" &&
        action.quantity > 0 &&
        state.orders.some(
          (order) =>
            order.buyerId === accountId && order.lines.some((line) => line.id === product.id),
        )
      )
        return state;
      const current = cart.find((line) => line.productId === action.id)?.quantity ?? 0;
      const requested = action.quantity + (action.additive ? current : 0);
      if (!Number.isFinite(requested)) return state;
      const quantity = Math.max(
        0,
        Math.min(product.kind === "digital" ? 1 : 99, Math.floor(requested)),
      );
      const lines =
        current && quantity
          ? cart.map((line) => (line.productId === action.id ? { ...line, quantity } : line))
          : quantity
            ? [...cart, { productId: action.id, quantity }]
            : cart.filter((line) => line.productId !== action.id);
      return { ...state, carts: { ...state.carts, [accountId]: lines } };
    }
    case "checkout": {
      const lines = cart.flatMap((item) => {
        const product = state.products.find(
          (entry) =>
            entry.id === item.productId && entry.sellerId === action.sellerId && !entry.hidden,
        );
        return product ? [orderLine(product, item.quantity)] : [];
      });
      if (!lines.length || state.orders.some((order) => order.id === action.id)) return state;
      const { id, date, method, sellerId } = action;
      const order = makeOrder({ id, date, method, sellerId, buyerId: accountId, lines });
      const next = {
        ...state,
        carts: {
          ...state.carts,
          [accountId]: cart.filter((item) => !lines.some((line) => line.id === item.productId)),
        },
      };
      return recordOrder(next, order, accountId);
    }
    case "request": {
      const { draft, id, date } = action;
      if (
        !state.availability[draft.sellerId] ||
        !draft.title.trim() ||
        !draft.description.trim() ||
        !Number.isInteger(draft.quantity) ||
        draft.quantity < 1 ||
        state.requests.some((request) => request.id === id)
      )
        return state;
      const request: ManufacturingRequest = {
        ...draft,
        id,
        date,
        buyerId: accountId,
        status: "Solicitud enviada",
      };
      const next = notify(
        { ...state, requests: [request, ...state.requests] },
        accountId,
        id + "-sent",
        "Solicitud de fabricación enviada",
        draft.title,
        date,
        "/cuenta?seccion=solicitudes",
      );
      return notify(
        next,
        sellerAccount(draft.sellerId),
        id + "-received",
        "Nueva solicitud de fabricación",
        draft.title,
        date,
        "/cuenta?seccion=solicitudes",
      );
    }
    case "offer": {
      const { offer, date } = action;
      const request = state.requests.find(
        (entry) => entry.id === offer.requestId && entry.sellerId === actor.sellerId,
      );
      if (
        !request ||
        !["Solicitud enviada", "Oferta recibida", "Oferta rechazada"].includes(request.status) ||
        !Number.isFinite(offer.price) ||
        offer.price <= 0 ||
        !Number.isInteger(offer.days) ||
        offer.days < 1 ||
        offer.quantity !== request.quantity
      )
        return state;
      const next = updateStatus(
        {
          ...state,
          offers: [offer, ...state.offers.filter((item) => item.requestId !== request.id)],
        },
        request.id,
        "Oferta recibida",
      );
      return notify(
        next,
        request.buyerId as AccountId,
        request.id + "-offer-" + date,
        "Recibiste una oferta de fabricación",
        request.title,
        date,
        "/cuenta?seccion=ofertas",
      );
    }
    case "offer-status": {
      const request = state.requests.find(
        (entry) =>
          entry.id === action.id &&
          entry.buyerId === accountId &&
          entry.status === "Oferta recibida",
      );
      if (!request) return state;
      return notify(
        updateStatus(state, request.id, action.status),
        sellerAccount(request.sellerId),
        request.id + "-" + action.status,
        action.status,
        request.title,
        action.date,
        "/cuenta?seccion=ofertas",
      );
    }
    case "offer-checkout": {
      const request = state.requests.find(
        (entry) =>
          entry.id === action.id &&
          entry.buyerId === accountId &&
          entry.status === "Oferta aceptada",
      );
      const offer = state.offers.find((entry) => entry.requestId === action.id);
      if (!request || !offer || state.orders.some((order) => order.requestId === request.id))
        return state;
      return recordOrder(
        updateStatus(state, request.id, "Pago confirmado"),
        makeOfferOrder(request, offer, action.orderId, action.date, action.method),
        accountId,
      );
    }
    case "finish": {
      const request = state.requests.find(
        (entry) =>
          entry.id === action.id &&
          entry.sellerId === actor.sellerId &&
          entry.status === "Pago confirmado",
      );
      if (!request) return state;
      return notify(
        updateStatus(state, request.id, "Finalizado"),
        request.buyerId as AccountId,
        request.id + "-finished",
        "Solicitud finalizada",
        action.date.slice(0, 10) + " · " + request.title,
        action.date,
        "/cuenta?seccion=solicitudes",
      );
    }
    case "availability":
      return actor.sellerId === action.id
        ? {
            ...state,
            availability: { ...state.availability, [action.id]: !state.availability[action.id] },
          }
        : state;
    case "publish": {
      const previous = state.products.find((product) => product.id === action.product.id);
      if (
        !actor.sellerId ||
        actor.sellerId !== action.product.sellerId ||
        (previous && previous.sellerId !== actor.sellerId)
      )
        return state;
      return {
        ...state,
        products: previous
          ? state.products.map((product) =>
              product.id === action.product.id ? action.product : product,
            )
          : [action.product, ...state.products],
      };
    }
    case "moderate":
      return accountId === "admin"
        ? {
            ...state,
            products: state.products.map((product) =>
              product.id === action.id ? { ...product, hidden: !product.hidden } : product,
            ),
          }
        : state;
    case "review": {
      const product = state.products.find((entry) => entry.id === action.productId);
      if (
        !product ||
        !state.orders.some(
          (order) =>
            order.buyerId === accountId && order.lines.some((line) => line.id === product.id),
        ) ||
        !Number.isInteger(action.rating) ||
        action.rating < 1 ||
        action.rating > 5 ||
        !action.text.trim()
      )
        return state;
      const id = accountId + "-review-" + product.id;
      const previous = state.reviews.some((review) => review.id === id);
      const review: Review = {
        id,
        productId: product.id,
        accountId,
        author: actor.name,
        text: action.text,
        rating: action.rating,
        date: action.date,
      };
      const next = {
        ...state,
        reviews: [review, ...state.reviews.filter((entry) => entry.id !== id)],
      };
      return previous
        ? next
        : notify(
            next,
            sellerAccount(product.sellerId),
            id,
            "Nueva calificación",
            product.name,
            action.date,
            "/cuenta?seccion=calificaciones",
          );
    }
    case "read":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.accountId === accountId && (!action.id || action.id === notification.id)
            ? { ...notification, read: true }
            : notification,
        ),
      };
    case "preferences":
      return {
        ...state,
        preferences: {
          ...state.preferences,
          [accountId]: {
            ...(state.preferences[accountId] ?? { email: true, whatsapp: false }),
            [action.field]: action.enabled,
          },
        },
      };
    case "settle": {
      const order = state.orders.find((entry) => entry.id === action.id && !entry.processed);
      if (accountId !== "admin" || !order) return state;
      const next = {
        ...state,
        orders: state.orders.map((entry) =>
          entry.id === action.id ? { ...entry, processed: true } : entry,
        ),
      };
      return notify(
        next,
        sellerAccount(order.sellerId),
        order.id + "-settlement",
        "Liquidación procesada",
        order.id,
        action.date,
        "/cuenta?seccion=saldo",
      );
    }
  }
}
