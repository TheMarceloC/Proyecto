import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Check,
  CircleDollarSign,
  ClipboardList,
  Download,
  FileBox,
  Heart,
  LayoutDashboard,
  Package,
  PenLine,
  Plus,
  Settings,
  Star,
  Store,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { commissionRate, type Media } from "./catalog";
import { mediaUrl } from "./media";
import {
  reviewForSeller,
  sellerFor,
  type ManufacturingRequest,
  type Offer,
  type Order,
} from "./model";
import { dateLabel, useMarket } from "./store";
import {
  Empty,
  Field,
  MediaImage,
  PageTitle,
  ProductCard,
  Reviews,
  SellerAvailability,
  SellerLogo,
  money,
} from "./ui";

const clientTabs = [
  { id: "perfil", title: "Resumen", Icon: LayoutDashboard },
  { id: "compras", title: "Mis compras", Icon: Package },
  { id: "biblioteca", title: "Mis diseños", Icon: FileBox },
  { id: "solicitudes", title: "Solicitudes", Icon: ClipboardList },
  { id: "ofertas", title: "Ofertas", Icon: WalletCards },
  { id: "favoritos", title: "Favoritos", Icon: Heart },
];
const merchantTabs = [
  { id: "perfil", title: "Mi perfil", Icon: Store },
  { id: "publicaciones", title: "Mis publicaciones", Icon: Package },
  { id: "solicitudes", title: "Solicitudes", Icon: ClipboardList },
  { id: "ofertas", title: "Ofertas", Icon: ClipboardList },
  { id: "ventas", title: "Ventas", Icon: CircleDollarSign },
  { id: "calificaciones", title: "Calificaciones", Icon: Star },
  { id: "saldo", title: "Saldo y liquidaciones", Icon: WalletCards },
];

export function AccountPage({ section }: { section?: string | undefined }) {
  const { state, account, ready, dispatch, favorites } = useMarket();
  const seller = sellerFor(account.sellerId);
  const nav = [
    ...(seller ? merchantTabs : clientTabs),
    { id: "configuracion", title: "Configuración", Icon: Settings },
  ];
  const tab =
    [...nav, ...clientTabs].find((item) => item.id === section) ??
    (seller ? merchantTabs[0]! : clientTabs[0]!);
  const orders = state.orders
    .filter((order) => order.buyerId === account.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const sales = state.orders
    .filter((order) => order.sellerId === seller?.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const products = state.products.filter((product) => product.sellerId === seller?.id);
  const requests = state.requests.filter((request) =>
    seller ? request.sellerId === seller.id : request.buyerId === account.id,
  );
  const offers = requests.filter((request) =>
    state.offers.some((offer) => offer.requestId === request.id),
  );
  const libraryCount = new Set(
    orders.flatMap((order) =>
      order.lines.filter((line) => line.kind === "digital").map((line) => line.id),
    ),
  ).size;
  if (account.id === "admin" && tab.id !== "configuracion")
    return (
      <div className="market-container market-page">
        <PageTitle title="Administración" breadcrumb="Mi cuenta" />
        <Link to="/admin" className="market-button primary">
          Abrir panel administrativo <ArrowRight size={16} />
        </Link>
      </div>
    );

  return (
    <div className="market-container market-page">
      <PageTitle
        title={account.name}
        breadcrumb="Mi cuenta"
        description={seller ? account.role + " · " + seller.city : account.role}
      >
        {seller && (
          <Link to="/fabricante/$id" params={{ id: seller.id }} className="text-action">
            Ver perfil público <ArrowRight size={16} />
          </Link>
        )}
      </PageTitle>
      <div className="account-layout">
        <nav className="surface account-nav" aria-label="Secciones de la cuenta">
          {nav.map(({ id, title, Icon }) => (
            <Link
              key={id}
              to="/cuenta"
              search={{ seccion: id }}
              aria-current={tab.id === id ? "page" : undefined}
            >
              <Icon size={18} />
              {title}
            </Link>
          ))}
        </nav>
        <div className="account-content" key={account.id + ":" + tab.id}>
          <div className="group-heading account-heading">
            <h2>{tab.title}</h2>
            {tab.id === "publicaciones" && (
              <Link to="/publicar" className="market-button primary">
                <Plus size={16} /> Nueva publicación
              </Link>
            )}
          </div>
          {tab.id === "perfil" &&
            (seller ? (
              <>
                <div className="surface account-profile">
                  <SellerLogo seller={seller} />
                  <div>
                    <h3>{seller.name}</h3>
                    <p>{seller.description}</p>
                    <div className="tags">
                      {seller.specialties.map((item) => (
                        <span key={item} className="small-tag">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="surface setting-row">
                  <div>
                    <h3>Disponibilidad</h3>
                    <SellerAvailability available={!!state.availability[seller.id]} />
                  </div>
                  <Switch
                    aria-label="Disponibilidad para solicitudes"
                    disabled={!ready}
                    checked={!!state.availability[seller.id]}
                    onCheckedChange={() => {
                      if (dispatch({ type: "availability", id: seller.id }))
                        toast.success("Disponibilidad actualizada");
                    }}
                  />
                </div>
                <div className="metric-grid merchant-metrics">
                  <AccountMetric
                    label="Publicaciones activas"
                    amount={products.filter((product) => !product.hidden).length}
                    target="publicaciones"
                  />
                  <AccountMetric label="Ventas registradas" amount={sales.length} target="ventas" />
                  <AccountMetric
                    label="Saldo pendiente"
                    amount={money(
                      sales
                        .filter((order) => !order.processed)
                        .reduce((sum, order) => sum + order.total - order.commission, 0),
                    )}
                    target="saldo"
                  />
                </div>
                {products.some((product) => product.featured && !product.hidden) && (
                  <section className="related-products account-featured">
                    <div className="group-heading">
                      <h3>Publicaciones destacadas</h3>
                    </div>
                    <div className="product-grid account-products">
                      {products
                        .filter((product) => product.featured && !product.hidden)
                        .map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="metric-grid merchant-metrics">
                <AccountMetric
                  label="Compras confirmadas"
                  amount={orders.length}
                  target="compras"
                />
                <AccountMetric
                  label="Diseños adquiridos"
                  amount={libraryCount}
                  target="biblioteca"
                />
                <AccountMetric
                  label="Solicitudes de fabricación"
                  amount={requests.length}
                  target="solicitudes"
                />
                <AccountMetric
                  label="Ofertas por revisar"
                  amount={requests.filter((request) => request.status === "Oferta recibida").length}
                  target="ofertas"
                />
              </div>
            ))}
          {tab.id === "compras" && <Purchases orders={orders} />}
          {tab.id === "biblioteca" && <Library orders={orders} />}
          {tab.id === "favoritos" &&
            (favorites.length ? (
              <div className="product-grid account-products">
                {state.products
                  .filter((product) => favorites.includes(product.id) && !product.hidden)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            ) : (
              <Empty title="Aún no has guardado publicaciones">
                <Link to="/marketplace" className="market-button primary">
                  Explorar marketplace
                </Link>
              </Empty>
            ))}
          {tab.id === "solicitudes" && (
            <Requests entries={requests} asSeller={!!seller} withOffers={false} />
          )}
          {tab.id === "ofertas" && <Requests entries={offers} asSeller={!!seller} withOffers />}
          {tab.id === "publicaciones" && (
            <div className="surface list-surface">
              {products.length ? (
                products.map((product) => (
                  <div className="managed-product" key={product.id}>
                    <span className="line-media">
                      <MediaImage media={product.images[0]} alt="" />
                    </span>
                    <div>
                      <strong>{product.name}</strong>
                      <small>
                        {product.category} · {money(product.price)}
                        {product.hidden ? " · Pausada" : " · Visible"}
                      </small>
                    </div>
                    <Link
                      className="market-button secondary"
                      to="/publicar"
                      search={{ editar: product.id }}
                    >
                      <PenLine size={16} /> Editar
                    </Link>
                  </div>
                ))
              ) : (
                <Empty title="Todavía no tienes publicaciones" />
              )}
            </div>
          )}
          {tab.id === "ventas" && <SalesTable orders={sales} />}
          {tab.id === "calificaciones" && seller && (
            <Reviews entries={reviewForSeller(state, seller.id).entries} />
          )}
          {tab.id === "saldo" && <Settlements orders={sales} />}
          {tab.id === "configuracion" && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}

function AccountMetric({
  label,
  amount,
  target,
}: {
  label: string;
  amount: string | number;
  target: string;
}) {
  return (
    <Link to="/cuenta" search={{ seccion: target }} className="surface metric">
      <span>{label}</span>
      <strong>{amount}</strong>
      <ArrowRight size={17} />
    </Link>
  );
}

function Purchases({ orders }: { orders: Order[] }) {
  const { state } = useMarket();
  if (!orders.length)
    return (
      <Empty title="Aún no tienes compras">
        <Link className="market-button primary" to="/marketplace">
          Explorar marketplace
        </Link>
      </Empty>
    );
  return (
    <div className="stack">
      {orders.map((order) => (
        <article className="surface commerce-card" key={order.id}>
          <div className="spread history-heading">
            <div>
              <h3>{order.id}</h3>
              <p>
                {dateLabel(order.date)} · {sellerFor(order.sellerId)?.name}
              </p>
            </div>
            <span className="availability available">
              <Check size={14} /> Pago confirmado
            </span>
          </div>
          {order.lines.map((line) => (
            <div className="checkout-line" key={line.id}>
              <span className="line-media">
                <MediaImage media={line.images[0]} alt="" />
              </span>
              <div>
                <strong>{line.name}</strong>
                <p>
                  × {line.quantity} · {money(line.price * line.quantity)}
                </p>
              </div>
              {state.products.some((entry) => entry.id === line.id) && (
                <ReviewDialog productId={line.id} name={line.name} />
              )}
            </div>
          ))}
          <div className="commerce-card-end">
            <span>
              Total <strong>{money(order.total)}</strong>
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function ReviewDialog({ productId, name }: { productId: string; name: string }) {
  const { state, account, dispatch } = useMarket();
  const saved = state.reviews.find(
    (review) => review.productId === productId && review.accountId === account.id,
  );
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(saved?.rating ?? 5);
  const [text, setText] = useState(saved?.text ?? "");
  function submit(event: FormEvent) {
    event.preventDefault();
    if (
      dispatch({
        type: "review",
        productId,
        rating: stars,
        text: text.trim(),
        date: new Date().toISOString(),
      })
    ) {
      toast.success(saved ? "Reseña actualizada" : "Reseña publicada");
      setOpen(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) {
          setStars(saved?.rating ?? 5);
          setText(saved?.text ?? "");
        }
      }}
    >
      <DialogTrigger asChild>
        <button className="market-button secondary compact-button" type="button">
          <Star size={15} />
          {saved ? "Editar reseña" : "Calificar"}
        </button>
      </DialogTrigger>
      <DialogContent className="market-modal">
        <DialogTitle>Califica tu compra</DialogTitle>
        <DialogDescription>{name}</DialogDescription>
        <form className="stack" onSubmit={submit}>
          <Field label="Calificación">
            <select value={stars} onChange={(event) => setStars(Number(event.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option value={value} key={value}>
                  {value} de 5 estrellas
                </option>
              ))}
            </select>
          </Field>
          <Field label="Comentario">
            <textarea
              required
              maxLength={1200}
              rows={4}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </Field>
          <button type="submit" disabled={!text.trim()} className="market-button primary">
            Guardar reseña
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Library({ orders }: { orders: Order[] }) {
  const seen = new Set<string>();
  const entries = orders.flatMap((order) =>
    order.lines
      .filter((line) => {
        if (line.kind !== "digital" || seen.has(line.id)) return false;
        seen.add(line.id);
        return true;
      })
      .map((line) => ({ order, line })),
  );
  if (!entries.length)
    return (
      <Empty title="Tu biblioteca está vacía">
        <Link to="/marketplace" search={{ tipo: "digital" }} className="market-button primary">
          Explorar diseños digitales
        </Link>
      </Empty>
    );
  return (
    <div className="library-grid">
      {entries.map(({ order, line }) => (
        <article className="surface library-card" key={line.id}>
          <MediaImage media={line.images[0]} alt={line.name} />
          <div>
            <h3>{line.name}</h3>
            <p>
              {sellerFor(order.sellerId)?.name} · {dateLabel(order.date)}
            </p>
            <p>{line.license}</p>
            <div className="tags">
              {line.formats.map((format) => (
                <span key={format} className="small-tag">
                  {format}
                </span>
              ))}
            </div>
            {line.asset && <DownloadButton asset={line.asset} />}
          </div>
        </article>
      ))}
    </div>
  );
}

function DownloadButton({ asset }: { asset: Media }) {
  if (!asset.src.startsWith("local:"))
    return (
      <a className="market-button primary" href={asset.src} download={asset.name}>
        <Download size={17} /> Descargar archivo
      </a>
    );
  async function download() {
    try {
      const url = await mediaUrl(asset.src);
      if (!url) throw new Error("Archivo ausente");
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = asset.name;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {
      toast.error("Este archivo no está disponible en el navegador.");
    }
  }
  return (
    <button className="market-button primary" type="button" onClick={() => void download()}>
      <Download size={17} /> Descargar archivo
    </button>
  );
}

function Requests({
  entries,
  asSeller,
  withOffers,
}: {
  entries: ManufacturingRequest[];
  asSeller: boolean;
  withOffers: boolean;
}) {
  const { state, dispatch } = useMarket();
  if (!entries.length)
    return (
      <Empty title={withOffers ? "Todavía no hay ofertas" : "Todavía no hay solicitudes"}>
        {!asSeller && (
          <Link to="/solicitar-fabricacion" className="market-button primary">
            Solicitar fabricación
          </Link>
        )}
      </Empty>
    );
  return (
    <div className="stack">
      {entries.map((request) => {
        const offer = state.offers.find((entry) => entry.requestId === request.id);
        return (
          <article key={request.id} className="surface request-history">
            <div className="spread history-heading">
              <div>
                <small className="reference">
                  {request.id} · {dateLabel(request.date)}
                </small>
                <h3>{request.title}</h3>
              </div>
              <span
                className={
                  "status-tag" +
                  (["Pago confirmado", "Finalizado", "Oferta aceptada"].includes(request.status)
                    ? " status-positive"
                    : "")
                }
              >
                {request.status}
              </span>
            </div>
            <p>{request.description}</p>
            <p className="muted">
              {request.quantity} {request.quantity === 1 ? "unidad" : "unidades"} ·{" "}
              {request.material || "Material por definir"}
              {request.attachment ? " · " + request.attachment.name : ""}
            </p>
            {!!offer && withOffers && (
              <div className="offer-detail">
                <div className="spread">
                  <div>
                    <small>Oferta de</small>
                    <strong>{sellerFor(request.sellerId)?.name}</strong>
                  </div>
                  <strong>{money(offer.price)}</strong>
                </div>
                <p>
                  {offer.material} · {offer.quantity} unidades · {offer.days} días hábiles
                </p>
                <p>{offer.notes}</p>
              </div>
            )}
            <div className="button-row">
              {!asSeller && offer && !withOffers && (
                <Link
                  to="/cuenta"
                  search={{ seccion: "ofertas" }}
                  className="market-button secondary"
                >
                  Ver ofertas
                </Link>
              )}
              {!asSeller && withOffers && request.status === "Oferta recibida" && (
                <>
                  <button
                    className="market-button primary"
                    type="button"
                    onClick={() => {
                      if (
                        dispatch({
                          type: "offer-status",
                          id: request.id,
                          status: "Oferta aceptada",
                          date: new Date().toISOString(),
                        })
                      )
                        toast.success("Oferta aceptada");
                    }}
                  >
                    Aceptar oferta
                  </button>
                  <button
                    className="market-button secondary"
                    type="button"
                    onClick={() => {
                      if (
                        dispatch({
                          type: "offer-status",
                          id: request.id,
                          status: "Oferta rechazada",
                          date: new Date().toISOString(),
                        })
                      )
                        toast.success("Oferta rechazada");
                    }}
                  >
                    Rechazar oferta
                  </button>
                </>
              )}
              {!asSeller && withOffers && request.status === "Oferta aceptada" && (
                <Link
                  to="/checkout"
                  search={{ solicitud: request.id }}
                  className="market-button primary"
                >
                  Confirmar pago <ArrowRight size={16} />
                </Link>
              )}
              {asSeller &&
                ["Solicitud enviada", "Oferta recibida", "Oferta rechazada"].includes(
                  request.status,
                ) && <OfferDialog request={request} offer={offer} />}
              {asSeller && request.status === "Pago confirmado" && (
                <button
                  type="button"
                  className="market-button primary"
                  onClick={() => {
                    if (
                      dispatch({ type: "finish", id: request.id, date: new Date().toISOString() })
                    )
                      toast.success("Solicitud finalizada");
                  }}
                >
                  Marcar finalizada
                </button>
              )}
              {!asSeller && (
                <Link
                  className="text-action"
                  to="/fabricante/$id"
                  params={{ id: request.sellerId }}
                >
                  Consultar fabricante <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function OfferDialog({
  request,
  offer,
}: {
  request: ManufacturingRequest;
  offer?: Offer | undefined;
}) {
  const { dispatch } = useMarket();
  const [open, setOpen] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const terms: Offer = {
      requestId: request.id,
      price: Number(values.get("price")),
      days: Number(values.get("days")),
      material: String(values.get("material")).trim(),
      notes: String(values.get("notes")).trim(),
      quantity: request.quantity,
    };
    if (!terms.material) return;
    if (dispatch({ type: "offer", offer: terms, date: new Date().toISOString() })) {
      toast.success("Oferta enviada");
      setOpen(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="market-button primary" type="button">
          {offer ? "Actualizar oferta" : "Preparar oferta"}
        </button>
      </DialogTrigger>
      <DialogContent className="market-modal">
        <DialogTitle>{offer ? "Actualizar oferta" : "Oferta de fabricación"}</DialogTitle>
        <DialogDescription>
          {request.title} · {request.quantity} unidades
        </DialogDescription>
        <form className="stack" onSubmit={submit}>
          <Field label="Precio total (L)">
            <input
              required
              type="number"
              name="price"
              min="0.01"
              max="10000000"
              step="0.01"
              defaultValue={offer?.price}
            />
          </Field>
          <Field label="Plazo estimado (días hábiles)">
            <input
              required
              type="number"
              name="days"
              min="1"
              max="365"
              defaultValue={offer?.days}
            />
          </Field>
          <Field label="Material">
            <input
              required
              name="material"
              maxLength={70}
              defaultValue={offer?.material || request.material}
            />
          </Field>
          <Field label="Observaciones">
            <textarea name="notes" maxLength={1000} rows={3} defaultValue={offer?.notes} />
          </Field>
          <button className="market-button primary" type="submit">
            Enviar oferta
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SalesTable({ orders, admin = false }: { orders: Order[]; admin?: boolean }) {
  if (!orders.length) return <Empty title="Todavía no hay ventas registradas" />;
  return (
    <div className="surface table-scroll">
      <table className="market-table">
        <thead>
          <tr>
            <th scope="col">Pedido</th>
            <th scope="col">Detalle</th>
            <th scope="col">Fecha</th>
            {admin && <th scope="col">Vendedor</th>}
            <th scope="col">Monto</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <th scope="row">{order.id}</th>
              <td>{order.lines.map((line) => line.name).join(", ")}</td>
              <td>{dateLabel(order.date)}</td>
              {admin && <td>{sellerFor(order.sellerId)?.name}</td>}
              <td className="money-cell">{money(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Settlements({ orders, admin = false }: { orders: Order[]; admin?: boolean }) {
  const { dispatch } = useMarket();
  const list = orders.filter((order) => order.sellerId !== "protolab");
  const pending = list.filter((order) => !order.processed);
  return (
    <div className="stack">
      <div className="surface setting-row">
        <div>
          <h3>{admin ? "Saldo pendiente de colaboradores" : "Saldo por liquidar"}</h3>
          <p>
            {pending.length}{" "}
            {pending.length === 1 ? "operación pendiente" : "operaciones pendientes"}
          </p>
        </div>
        <strong className="summary-amount">
          {money(pending.reduce((sum, order) => sum + order.total - order.commission, 0))}
        </strong>
      </div>
      {list.length ? (
        <div className="surface table-scroll">
          <table className="market-table">
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Fecha</th>
                {admin && <th scope="col">Vendedor</th>}
                <th scope="col">Venta</th>
                <th scope="col">Comisión</th>
                <th scope="col">Saldo</th>
                <th scope="col">Estado</th>
                {admin && <th scope="col">Acción</th>}
              </tr>
            </thead>
            <tbody>
              {list.map((order) => (
                <tr key={order.id}>
                  <th scope="row">{order.id}</th>
                  <td>{dateLabel(order.date)}</td>
                  {admin && <td>{sellerFor(order.sellerId)?.name}</td>}
                  <td className="money-cell">{money(order.total)}</td>
                  <td className="money-cell">{money(order.commission)}</td>
                  <td className="money-cell">{money(order.total - order.commission)}</td>
                  <td>
                    <span className={"status-tag" + (order.processed ? " status-positive" : "")}>
                      {order.processed ? "Procesada" : "Pendiente"}
                    </span>
                  </td>
                  {admin && (
                    <td>
                      {!order.processed && (
                        <button
                          type="button"
                          className="market-button secondary compact-button"
                          onClick={() => {
                            if (
                              dispatch({
                                type: "settle",
                                id: order.id,
                                date: new Date().toISOString(),
                              })
                            )
                              toast.success("Liquidación procesada");
                          }}
                        >
                          Marcar procesada
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="Sin liquidaciones de colaboradores" />
      )}
      {list.length > 0 && (
        <p className="muted">
          Tasa de referencia en este registro: {(commissionRate * 100).toFixed(0)}%.
        </p>
      )}
    </div>
  );
}

export function SettingsPanel() {
  const { reset, ready } = useMarket();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function confirm() {
    setBusy(true);
    try {
      await reset();
      setOpen(false);
      toast.success("Datos restablecidos");
      void navigate({ to: "/" });
    } catch {
      toast.error(
        "No se pudieron restablecer los datos. Cierra las otras pestañas de ProtoLab e inténtalo de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack">
      <div className="surface setting-row">
        <div>
          <h3>Notificaciones</h3>
          <p>Administra las preferencias de correo electrónico y WhatsApp.</p>
        </div>
        <Link to="/notificaciones" className="market-button secondary">
          <Bell size={16} /> Preferencias
        </Link>
      </div>
      <div className="surface setting-row">
        <div>
          <h3>Datos de este navegador</h3>
          <p>Vuelve al estado inicial de las cuentas, publicaciones y operaciones.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(value) => {
            if (!busy) setOpen(value);
          }}
        >
          <DialogTrigger asChild>
            <button className="market-button secondary" type="button" disabled={!ready}>
              Restablecer datos locales
            </button>
          </DialogTrigger>
          <DialogContent className="market-modal">
            <DialogTitle>¿Restablecer los datos locales?</DialogTitle>
            <DialogDescription>
              Se borrarán los cambios y archivos guardados en ProtoLab en este navegador. Se
              restaurarán las cuentas, compras y publicaciones iniciales.
            </DialogDescription>
            <div className="button-row">
              <button
                className="market-button secondary"
                disabled={busy}
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="market-button danger"
                disabled={busy}
                type="button"
                onClick={() => void confirm()}
              >
                {busy ? "Restableciendo…" : "Restablecer"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
