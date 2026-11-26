import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CircleCheck,
  CreditCard,
  Download,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { kinds, type Product } from "./catalog";
import { makeId, useMarket } from "./store";
import { roundMoney, sellerFor, type CartLine } from "./model";
import { Empty, MediaImage, PageTitle, ProductCard, SellerLogo, money } from "./ui";

const methods = [
  { name: "Tarjeta", detail: "Pago único", Icon: CreditCard },
  { name: "Transferencia bancaria", detail: "Confirmación de compra", Icon: Building2 },
];
type CartProduct = CartLine & { product: Product };
export type CheckoutSearch = { vendedor?: string | undefined; solicitud?: string | undefined };

function useCartRows() {
  const { cart, state } = useMarket();
  return cart.flatMap((line) => {
    const product = state.products.find((item) => item.id === line.productId);
    return product ? [{ ...line, product }] : [];
  });
}
function subtotal(lines: CartProduct[]) {
  return roundMoney(lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0));
}

export function CartPage() {
  const { dispatch } = useMarket();
  const all = useCartRows();
  const groups = [...new Set(all.map(({ product }) => product.sellerId))];
  const valid = all.filter(({ product }) => !product.hidden);
  return (
    <div className="market-container market-page">
      <PageTitle
        breadcrumb="Carrito"
        title="Tu carrito"
        description={all.length ? "Completa una compra por vendedor." : undefined}
      >
        <Link to="/marketplace" className="text-action">
          <ArrowLeft size={16} /> Continuar comprando
        </Link>
      </PageTitle>
      {all.length === 0 ? (
        <Empty title="Tu carrito está vacío">
          <p>Agrega un diseño o una pieza para continuar.</p>
          <Link className="market-button primary" to="/marketplace">
            Explorar marketplace <ArrowRight size={17} />
          </Link>
        </Empty>
      ) : (
        <div className="commerce-layout">
          <div className="stack">
            {groups.map((id) => {
              const seller = sellerFor(id)!;
              const lines = all.filter(({ product }) => product.sellerId === id);
              const purchasable = lines.filter(({ product }) => !product.hidden);
              return (
                <section className="surface commerce-card" key={id}>
                  <div className="commerce-card-heading">
                    <SellerLogo seller={seller} />
                    <div>
                      <h2>{seller.name}</h2>
                      <p>{seller.city}</p>
                    </div>
                  </div>
                  <div>
                    {lines.map(({ product, quantity }) => (
                      <article className="cart-row" key={product.id}>
                        <Link
                          to="/producto/$id"
                          params={{ id: product.id }}
                          className="line-media"
                          disabled={!!product.hidden}
                        >
                          <MediaImage media={product.images[0]} alt={product.name} />
                        </Link>
                        <div className="cart-row-info">
                          <Link
                            to="/producto/$id"
                            params={{ id: product.id }}
                            disabled={!!product.hidden}
                          >
                            {product.name}
                          </Link>
                          <p>
                            {kinds[product.kind]} · {money(product.price)}
                            {product.hidden ? " · No disponible" : ""}
                          </p>
                        </div>
                        <div className="cart-row-tools">
                          {product.kind === "physical" && !product.hidden ? (
                            <div className="quantity">
                              <button
                                className="round-icon"
                                aria-label={"Reducir cantidad de " + product.name}
                                type="button"
                                disabled={quantity <= 1}
                                onClick={() =>
                                  dispatch({ type: "cart", id: product.id, quantity: quantity - 1 })
                                }
                              >
                                <Minus size={15} />
                              </button>
                              <output>{quantity}</output>
                              <button
                                className="round-icon"
                                aria-label={"Aumentar cantidad de " + product.name}
                                type="button"
                                disabled={quantity >= 99}
                                onClick={() =>
                                  dispatch({ type: "cart", id: product.id, quantity: quantity + 1 })
                                }
                              >
                                <Plus size={15} />
                              </button>
                            </div>
                          ) : (
                            <span className="muted">× {quantity}</span>
                          )}
                          <strong>{money(product.price * quantity)}</strong>
                          <button
                            className="round-icon"
                            type="button"
                            aria-label={"Retirar " + product.name}
                            onClick={() => {
                              if (dispatch({ type: "cart", id: product.id, quantity: 0 }))
                                toast.success("Producto retirado");
                            }}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  <div className="commerce-card-end">
                    <span>
                      Subtotal <strong>{money(subtotal(purchasable))}</strong>
                    </span>
                    {purchasable.length > 0 && (
                      <Link
                        to="/checkout"
                        search={{ vendedor: id }}
                        className="market-button primary"
                      >
                        Comprar a {seller.name} <ArrowRight size={17} />
                      </Link>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
          <aside className="surface order-summary">
            <h2>Resumen del carrito</h2>
            <dl className="fact-list">
              {groups.map((id) => (
                <div key={id}>
                  <dt>{sellerFor(id)?.name}</dt>
                  <dd>{money(subtotal(valid.filter(({ product }) => product.sellerId === id)))}</dd>
                </div>
              ))}
            </dl>
            <div className="total-row">
              <span>Total</span>
              <strong>{money(subtotal(valid))}</strong>
            </div>
            <p className="notice">
              <ShieldCheck size={19} /> Para piezas físicas, acuerda la entrega con cada vendedor.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

export function CheckoutPage({ search }: { search: CheckoutSearch }) {
  const { state, account, ready, dispatch } = useMarket();
  const navigate = useNavigate();
  const [method, setMethod] = useState(methods[0]!.name);
  const request = state.requests.find(
    (item) =>
      item.id === search.solicitud &&
      item.buyerId === account.id &&
      item.status === "Oferta aceptada",
  );
  const offer = request && state.offers.find((item) => item.requestId === request.id);
  const seller = sellerFor(request?.sellerId ?? search.vendedor ?? "");
  const lines = useCartRows().filter(
    ({ product }) => !search.solicitud && !product.hidden && product.sellerId === seller?.id,
  );
  const total = offer?.price ?? subtotal(lines);
  const back = search.solicitud ? "/cuenta" : "/carrito";
  const canBuy = seller && (offer || lines.length > 0);

  function confirm(event: FormEvent) {
    event.preventDefault();
    if (!seller || !canBuy) return;
    const id = makeId("PL-C");
    const date = new Date().toISOString();
    const success = request
      ? dispatch({ type: "offer-checkout", id: request.id, orderId: id, method, date })
      : dispatch({ type: "checkout", sellerId: seller.id, id, date, method });
    if (success) {
      toast.success("Compra registrada");
      void navigate({ to: "/compra/$id", params: { id }, replace: true });
    }
  }

  return (
    <div className="market-container market-page">
      <PageTitle breadcrumb="Confirmar compra" title="Confirma tu compra">
        <Link
          to={back}
          search={search.solicitud ? { seccion: "ofertas" } : {}}
          className="text-action"
        >
          <ArrowLeft size={16} /> {search.solicitud ? "Volver a ofertas" : "Volver al carrito"}
        </Link>
      </PageTitle>
      {canBuy ? (
        <form onSubmit={confirm} className="commerce-layout">
          <div className="stack">
            <div className="surface commerce-card">
              <div className="commerce-card-heading">
                <SellerLogo seller={seller} />
                <div>
                  <h2>{seller.name}</h2>
                  <p>Vendedor · {seller.city}</p>
                </div>
              </div>
              {offer && request ? (
                <div className="checkout-line">
                  <span className="line-icon">
                    <ShoppingBag size={21} />
                  </span>
                  <div>
                    <strong>{request.title}</strong>
                    <p>
                      {offer.quantity} unidades · {offer.material} · {offer.days} días hábiles
                    </p>
                  </div>
                  <strong>{money(offer.price)}</strong>
                </div>
              ) : (
                lines.map(({ product, quantity }) => (
                  <div className="checkout-line" key={product.id}>
                    <span className="line-media">
                      <MediaImage media={product.images[0]} alt="" />
                    </span>
                    <div>
                      <strong>{product.name}</strong>
                      <p>
                        {kinds[product.kind]} · × {quantity}
                      </p>
                    </div>
                    <strong>{money(product.price * quantity)}</strong>
                  </div>
                ))
              )}
            </div>
            <fieldset className="surface payment-methods">
              <legend className="sr-only">Método de pago</legend>
              <h2>Método de pago</h2>
              {methods.map(({ name, detail, Icon }) => (
                <label className={"payment-option" + (method === name ? " chosen" : "")} key={name}>
                  <input
                    type="radio"
                    name="method"
                    value={name}
                    checked={method === name}
                    onChange={() => setMethod(name)}
                  />
                  <Icon size={23} />
                  <div>
                    <strong>{name}</strong>
                    <small>{detail}</small>
                  </div>
                </label>
              ))}
            </fieldset>
          </div>
          <aside className="surface order-summary">
            <h2>Resumen de compra</h2>
            <dl className="fact-list">
              <div>
                <dt>Subtotal</dt>
                <dd>{money(total)}</dd>
              </div>
              <div>
                <dt>Método elegido</dt>
                <dd>{method}</dd>
              </div>
            </dl>
            <div className="total-row">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <button className="market-button primary" type="submit" disabled={!ready}>
              Confirmar compra <ArrowRight size={17} />
            </button>
            <p className="notice">
              {offer || lines.some((line) => line.product.kind === "physical")
                ? "La entrega se coordina directamente con el vendedor."
                : "Los archivos quedan disponibles en Mis diseños."}
            </p>
          </aside>
        </form>
      ) : (
        <Empty title={ready ? "No hay una compra pendiente" : "Preparando tu compra"}>
          <Link
            to={back}
            search={search.solicitud ? { seccion: "ofertas" } : {}}
            className="market-button secondary"
          >
            Regresar
          </Link>
        </Empty>
      )}
    </div>
  );
}

export function PurchasePage({ id }: { id: string }) {
  const { state, ready, account } = useMarket();
  const order = state.orders.find((entry) => entry.id === id && entry.buyerId === account.id);
  const digital = order?.lines.some((line) => line.kind === "digital");
  return (
    <div className="market-container market-page">
      {order ? (
        <section className="surface success-panel">
          <span className="success-icon">
            <CircleCheck size={34} />
          </span>
          <p className="reference">{order.id}</p>
          <h1>Compra confirmada</h1>
          <p>
            Tu pedido con <strong>{sellerFor(order.sellerId)?.name}</strong> quedó registrado por{" "}
            <strong>{money(order.total)}</strong>.
          </p>
          <div className="button-row">
            {digital ? (
              <Link
                className="market-button primary"
                to="/cuenta"
                search={{ seccion: "biblioteca" }}
              >
                <Download size={17} /> Ir a mis diseños
              </Link>
            ) : (
              <Link className="market-button primary" to="/cuenta" search={{ seccion: "compras" }}>
                Ver mi compra <ArrowRight size={17} />
              </Link>
            )}
            <Link className="market-button secondary" to="/marketplace">
              Continuar comprando
            </Link>
          </div>
        </section>
      ) : (
        <Empty title={ready ? "Compra no encontrada" : "Consultando tu compra"}>
          <Link className="market-button secondary" to="/cuenta" search={{ seccion: "compras" }}>
            Ver mis compras
          </Link>
        </Empty>
      )}
    </div>
  );
}

export function FavoritesPage() {
  const { state, favorites } = useMarket();
  const products = state.products.filter(
    (product) => !product.hidden && favorites.includes(product.id),
  );
  return (
    <div className="market-container market-page">
      <PageTitle
        title="Tus favoritos"
        breadcrumb="Favoritos"
        description="Vuelve a los diseños y productos que guardaste."
      />
      {products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Empty title="Aún no has guardado publicaciones">
          <Link className="market-button primary" to="/marketplace">
            Explorar marketplace <ArrowRight size={17} />
          </Link>
        </Empty>
      )}
    </div>
  );
}
