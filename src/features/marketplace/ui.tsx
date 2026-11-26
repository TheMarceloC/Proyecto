import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Box, ChevronRight, Heart, ImageOff, MapPin, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { formatCustomerPrice, formatLempiras } from "@/lib/material-pricing";
import { kinds, type Media, type Product, type Seller } from "./catalog";
import { mediaUrl } from "./media";
import { ratingFor, reviewForSeller, sellerFor, type Review } from "./model";
import { dateLabel, useMarket } from "./store";

export const money = (value: number) =>
  Number.isInteger(value) ? formatCustomerPrice(value) : formatLempiras(value);

export function PageTitle({
  title,
  description,
  breadcrumb,
  children,
}: {
  title: string;
  description?: string | undefined;
  breadcrumb?: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-title">
      {breadcrumb && <Breadcrumb>{breadcrumb}</Breadcrumb>}
      <div className="group-heading">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {children}
      </div>
    </header>
  );
}

export function Breadcrumb({
  section,
  children,
}: {
  section?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <nav aria-label="Ruta de navegación" className="market-breadcrumb">
      <Link to="/">Inicio</Link>
      <ChevronRight size={13} aria-hidden="true" />
      {section && (
        <>
          <Link to={section.href}>{section.label}</Link>
          <ChevronRight size={13} aria-hidden="true" />
        </>
      )}
      <span aria-current="page">{children}</span>
    </nav>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-market">
      <Box size={28} aria-hidden="true" />
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string | undefined;
}) {
  return (
    <label className="market-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Options({
  label,
  value,
  choices,
  onChange,
  placeholder = "Todos",
}: {
  label: string;
  value: string;
  choices: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {choices.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </Field>
  );
}

export function SearchBox({
  initial = "",
  onSearch,
  placeholder = "Buscar productos, diseños y servicios",
}: {
  initial?: string;
  onSearch?: (value: string) => void;
  placeholder?: string;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initial);
  useEffect(() => {
    setQuery(initial);
  }, [initial]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (onSearch) onSearch(query.trim());
    else void navigate({ to: "/marketplace", search: { q: query.trim() || undefined } });
  }
  return (
    <form role="search" className="market-search" onSubmit={submit}>
      <Search size={18} aria-hidden="true" />
      <input
        aria-label="Buscar en el marketplace"
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          onSearch?.(event.target.value);
        }}
      />
      {!onSearch && (
        <button type="submit" className="round-icon" aria-label="Buscar">
          <ArrowRight size={17} />
        </button>
      )}
    </form>
  );
}

export function useMedia(src?: string) {
  const [objectUrl, setObjectUrl] = useState<{ source: string; url: string }>();
  useEffect(() => {
    if (!src?.startsWith("local:")) return;
    let cancelled = false;
    let loaded = "";
    void mediaUrl(src)
      .then((url) => {
        loaded = url;
        if (cancelled) URL.revokeObjectURL(loaded);
        else setObjectUrl({ source: src, url });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (loaded) URL.revokeObjectURL(loaded);
    };
  }, [src]);
  return src?.startsWith("local:") ? (objectUrl?.source === src ? objectUrl.url : undefined) : src;
}

export function MediaImage({
  media,
  alt,
  className,
  priority = false,
}: {
  media?: Media | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const src = useMedia(media?.src);
  return src ? (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  ) : (
    <span
      className={"missing-media " + (className ?? "")}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
    >
      <ImageOff size={21} aria-hidden="true" />
    </span>
  );
}

export function FavoriteButton({ product }: { product: Product }) {
  const { favorites, dispatch, ready } = useMarket();
  const saved = favorites.includes(product.id);
  return (
    <button
      className={"round-icon heart" + (saved ? " saved" : "")}
      type="button"
      disabled={!ready}
      aria-pressed={saved}
      aria-label={(saved ? "Quitar de favoritos: " : "Guardar en favoritos: ") + product.name}
      onClick={() => {
        if (dispatch({ type: "favorite", id: product.id }))
          toast.success(saved ? "Eliminado de favoritos" : "Guardado en favoritos");
      }}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}

export function Rating({
  average,
  count,
  showCount = true,
}: {
  average: number;
  count: number;
  showCount?: boolean;
}) {
  return (
    <span className="market-rating">
      <Star size={15} fill="currentColor" aria-hidden="true" />
      <strong>{count ? average.toFixed(1) : "—"}</strong>
      {showCount && <span className="muted">({count})</span>}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { state } = useMarket();
  const rating = ratingFor(state.reviews, [product.id]);
  return (
    <article className="product-card">
      <div className="product-image">
        <Link to="/producto/$id" params={{ id: product.id }} aria-label={"Ver " + product.name}>
          <MediaImage media={product.images[0]} alt={product.name} />
        </Link>
        <span className={"ticket kind-" + product.kind}>{kinds[product.kind]}</span>
        <FavoriteButton product={product} />
      </div>
      <div className="product-copy">
        <div className="product-label">
          <span>{product.category}</span>
          <Rating {...rating} />
        </div>
        <Link className="product-name" to="/producto/$id" params={{ id: product.id }}>
          {product.name}
        </Link>
        {product.badge && <span className="small-tag">{product.badge}</span>}
        <div className="product-bottom">
          <Link to="/fabricante/$id" params={{ id: product.sellerId }}>
            {sellerFor(product.sellerId)?.name}
          </Link>
          <strong>{money(product.price)}</strong>
        </div>
      </div>
    </article>
  );
}

export function SellerLogo({ seller }: { seller: Seller }) {
  const src =
    seller.id === "protolab" ? "/protolab-symbol.svg" : "/marketplace/logos/" + seller.id + ".webp";
  return (
    <span className="seller-logo" style={{ backgroundColor: seller.color }}>
      <img src={src} alt="" width="48" height="48" />
    </span>
  );
}

export function SellerAvailability({ available }: { available: boolean }) {
  return (
    <span className={"availability" + (available ? " available" : "")}>
      <i aria-hidden="true" />
      {available ? "Disponible" : "No disponible"}
    </span>
  );
}

export function sellerCover(seller: Seller) {
  if (seller.technologies[0] === "CAD") return "/marketplace/workshops/estudio-cad.webp";
  if (seller.technologies.includes("Resina")) return "/marketplace/workshops/taller-resina.webp";
  return "/marketplace/workshops/taller-fdm.webp";
}

export function SellerCard({ seller }: { seller: Seller }) {
  const { state } = useMarket();
  const portfolio = state.products.find(
    (product) => product.sellerId === seller.id && !product.hidden,
  );
  return (
    <article className="seller-card">
      <Link
        to="/fabricante/$id"
        params={{ id: seller.id }}
        className="seller-card-image"
        aria-label={"Ver perfil de " + seller.name}
      >
        <MediaImage
          media={portfolio?.images[0] ?? { name: "Taller", src: sellerCover(seller) }}
          alt={"Trabajo de " + seller.name}
        />
      </Link>
      <div className="seller-card-body">
        <div className="seller-identity">
          <SellerLogo seller={seller} />
          <SellerAvailability available={!!state.availability[seller.id]} />
        </div>
        <Link to="/fabricante/$id" params={{ id: seller.id }} className="seller-name">
          {seller.name}
        </Link>
        <p className="seller-city">
          <MapPin size={15} />
          {seller.city}
          <Rating {...reviewForSeller(state, seller.id)} />
        </p>
        <div className="tags">
          {seller.specialties.slice(0, 2).map((item) => (
            <span className="small-tag" key={item}>
              {item}
            </span>
          ))}
        </div>
        <Link className="seller-link" to="/fabricante/$id" params={{ id: seller.id }}>
          Consultar perfil <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export function Reviews({ entries }: { entries: Review[] }) {
  const { state } = useMarket();
  const [limit, setLimit] = useState(4);
  if (!entries.length)
    return (
      <Empty title="Todavía no hay reseñas">
        <p>Las calificaciones de compradores aparecerán aquí.</p>
      </Empty>
    );
  const average = entries.reduce((sum, review) => sum + review.rating, 0) / entries.length;
  const newest = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="reviews-layout">
      <div className="surface rating-summary">
        <strong>{average.toFixed(1)}</strong>
        <Stars rating={average} />
        <p>{entries.length} reseñas</p>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = entries.filter((review) => review.rating === rating).length;
          return (
            <div className="rating-bar" key={rating}>
              <span>{rating}</span>
              <meter
                min={0}
                max={entries.length}
                value={count}
                aria-label={"Reseñas de " + rating + " estrellas"}
              />
              <span>{count}</span>
            </div>
          );
        })}
      </div>
      <div className="review-feed">
        {newest.slice(0, limit).map((review) => (
          <article key={review.id} className="surface review">
            <div className="spread">
              <strong>{review.author}</strong>
              <small>{dateLabel(review.date)}</small>
            </div>
            <Stars rating={review.rating} />
            <p>{review.text}</p>
            <small>{state.products.find((product) => product.id === review.productId)?.name}</small>
          </article>
        ))}
        {limit < entries.length && (
          <button className="market-button secondary" onClick={() => setLimit(limit + 6)}>
            Ver más reseñas
          </button>
        )}
      </div>
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" role="img" aria-label={rating.toFixed(1) + " de 5 estrellas"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          fill={star <= Math.round(rating) ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
