import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Clock3,
  Download,
  FileBox,
  MapPin,
  Maximize2,
  PencilRuler,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LICENSE_TERMS } from "@/lib/design-commerce";
import { categories, kinds, sellers, type Kind, type Product, type Seller } from "./catalog";
import { ratingFor, reviewForSeller, sellerFor } from "./model";
import { useMarket } from "./store";
import {
  Breadcrumb,
  Empty,
  FavoriteButton,
  Field,
  MediaImage,
  Options,
  PageTitle,
  ProductCard,
  Rating,
  Reviews,
  SearchBox,
  SellerAvailability,
  SellerCard,
  SellerLogo,
  money,
  sellerCover,
  useMedia,
} from "./ui";

const distinct = (values: string[]) =>
  [...new Set(values)].filter(Boolean).sort((a, b) => a.localeCompare(b, "es"));
const cities = distinct(sellers.map((seller) => seller.city));
const normalize = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const matches = (query: string, values: string[]) =>
  normalize(query)
    .trim()
    .split(/\s+/)
    .every((term) => normalize(values.join(" ")).includes(term));
const batches = 12;
const sortings = [
  "Más populares",
  "Mejor calificados",
  "Menor precio",
  "Mayor precio",
  "Más recientes",
] as const;
const types = [
  ["", "Todo"],
  ["digital", "Diseños digitales"],
  ["physical", "Productos físicos"],
  ["service", "Servicios"],
] as const;
export type CatalogSearch = {
  tipo?: Kind | undefined;
  q?: string | undefined;
  categoria?: string | undefined;
};

export function CatalogPage({ search }: { search: CatalogSearch }) {
  const { state } = useMarket();
  const [query, setQuery] = useState(search.q ?? "");
  const [kind, setKind] = useState<Kind | "">(search.tipo ?? "");
  const [category, setCategory] = useState(search.categoria ?? "");
  const [material, setMaterial] = useState("");
  const [sellerName, setSeller] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState("");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [sorting, setSorting] = useState<string>(sortings[0]);
  const [limit, setLimit] = useState(batches);
  const [filtersOpen, openFilters] = useState(false);
  useEffect(() => {
    setQuery(search.q ?? "");
    setKind(search.tipo ?? "");
    setCategory(search.categoria ?? "");
    setLimit(batches);
  }, [search.q, search.tipo, search.categoria]);

  const listing = useMemo(
    () =>
      state.products
        .filter((product) => !product.hidden)
        .map((product) => {
          const rating = ratingFor(state.reviews, [product.id]);
          const seller = sellerFor(product.sellerId)!;
          const sales = state.orders.reduce(
            (sum, order) =>
              sum +
              order.lines
                .filter((line) => line.id === product.id)
                .reduce((units, line) => units + line.quantity, 0),
            0,
          );
          return { product, rating, seller, sales };
        }),
    [state.products, state.reviews, state.orders],
  );

  const results = listing
    .filter(
      ({ product, rating: grade, seller }) =>
        (!kind || product.kind === kind) &&
        (!category || category === product.category) &&
        (!material || material === product.material) &&
        (!sellerName || sellerName === seller.name) &&
        (!city || city === seller.city) &&
        (!rating || grade.average >= Number.parseFloat(rating)) &&
        (!minimum || product.price >= Number(minimum)) &&
        (!maximum || product.price <= Number(maximum)) &&
        matches(query, [
          product.name,
          product.description,
          product.category,
          product.material,
          seller.name,
          seller.city,
        ]),
    )
    .sort((a, b) => {
      switch (sorting) {
        case "Mejor calificados":
          return b.rating.average - a.rating.average || b.rating.count - a.rating.count;
        case "Menor precio":
          return a.product.price - b.product.price;
        case "Mayor precio":
          return b.product.price - a.product.price;
        case "Más recientes":
          return b.product.createdAt.localeCompare(a.product.createdAt);
        default:
          return b.sales - a.sales || b.rating.count - a.rating.count;
      }
    });
  const update = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setLimit(batches);
  };
  const filterCount = [category, material, sellerName, city, rating, minimum, maximum].filter(
    Boolean,
  ).length;

  function reset() {
    setQuery("");
    setKind("");
    setCategory("");
    setMaterial("");
    setSeller("");
    setCity("");
    setRating("");
    setMinimum("");
    setMaximum("");
    setSorting(sortings[0]);
    setLimit(batches);
  }

  return (
    <div className="market-container market-page">
      <PageTitle
        title="Marketplace"
        breadcrumb="Marketplace"
        description="Diseños, piezas y servicios para tu próximo proyecto."
      />
      <div className="catalog-top">
        <SearchBox
          initial={query}
          onSearch={update(setQuery)}
          placeholder="Busca por producto, material o vendedor"
        />
        <button
          type="button"
          className="market-button secondary filter-toggle"
          aria-expanded={filtersOpen}
          onClick={() => openFilters(!filtersOpen)}
        >
          <SlidersHorizontal size={17} /> Filtros{filterCount ? " (" + filterCount + ")" : ""}
        </button>
      </div>
      <div className="segmented catalog-tabs" aria-label="Tipo de publicación">
        {types.map(([value, label]) => (
          <button
            type="button"
            key={label}
            aria-pressed={kind === value}
            onClick={() => {
              setKind(value);
              setLimit(batches);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="catalog-layout">
        <aside
          className={"catalog-filters surface" + (filtersOpen ? " is-open" : "")}
          aria-label="Filtros de marketplace"
        >
          <div className="spread">
            <h2>
              <SlidersHorizontal size={18} /> Filtros
            </h2>
            <button className="text-action" onClick={reset}>
              Limpiar
            </button>
          </div>
          <Options
            label="Categoría"
            value={category}
            choices={[...categories]}
            onChange={update(setCategory)}
            placeholder="Todas las categorías"
          />
          <div className="market-field">
            <span>Precio en lempiras</span>
            <div className="range-fields">
              <input
                type="number"
                aria-label="Precio mínimo"
                placeholder="Mín."
                min="0"
                value={minimum}
                onChange={(event) => update(setMinimum)(event.target.value)}
              />
              <input
                type="number"
                aria-label="Precio máximo"
                placeholder="Máx."
                min="0"
                value={maximum}
                onChange={(event) => update(setMaximum)(event.target.value)}
              />
            </div>
          </div>
          {minimum && maximum && Number(minimum) > Number(maximum) && (
            <p className="field-error">El mínimo supera el máximo.</p>
          )}
          <Options
            label="Material"
            value={material}
            choices={distinct(listing.map(({ product }) => product.material))}
            onChange={update(setMaterial)}
          />
          <Options
            label="Calificación"
            value={rating}
            choices={["4.5 y más", "4.0 y más", "3.0 y más"]}
            onChange={update(setRating)}
            placeholder="Todas"
          />
          <Options
            label="Vendedor"
            value={sellerName}
            choices={distinct(sellers.map((seller) => seller.name))}
            onChange={update(setSeller)}
          />
          <Options
            label="Ubicación"
            value={city}
            choices={cities}
            onChange={update(setCity)}
            placeholder="Todas las ciudades"
          />
          <button
            type="button"
            className="market-button primary filter-toggle"
            onClick={() => openFilters(false)}
          >
            Ver {results.length} resultados
          </button>
        </aside>
        <section className="catalog-results" aria-label="Publicaciones">
          <div className="catalog-results-heading">
            <span role="status">
              <strong>{results.length}</strong>{" "}
              {results.length === 1 ? "publicación" : "publicaciones"}
            </span>
            <label className="sort-field">
              <span>Ordenar por</span>
              <select value={sorting} onChange={(event) => update(setSorting)(event.target.value)}>
                {sortings.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
          {results.length ? (
            <>
              <div className="product-grid catalog-grid">
                {results.slice(0, limit).map(({ product }) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>
              {limit < results.length && (
                <div className="load-more">
                  <button
                    type="button"
                    className="market-button secondary"
                    onClick={() => setLimit(limit + batches)}
                  >
                    Cargar más publicaciones
                  </button>
                </div>
              )}
            </>
          ) : (
            <Empty title="No encontramos publicaciones">
              <p>Prueba con otro término o ajusta los filtros.</p>
              <button className="market-button secondary" onClick={reset}>
                Limpiar filtros
              </button>
            </Empty>
          )}
        </section>
      </div>
    </div>
  );
}

export function ProductDetail({ id }: { id: string }) {
  const { state, ready } = useMarket();
  const product = state.products.find((entry) => entry.id === id && !entry.hidden);
  if (!product && !ready && id.startsWith("pl-"))
    return (
      <div className="market-container market-page">
        <p>Cargando publicación…</p>
      </div>
    );
  if (!product)
    return (
      <div className="market-container market-page">
        <Empty title="Publicación no disponible">
          <Link to="/marketplace" className="market-button primary">
            Volver al marketplace
          </Link>
        </Empty>
      </div>
    );
  return <ProductContent key={id} product={product} />;
}

function ProductContent({ product }: { product: Product }) {
  const { state, account, ready, dispatch, cart } = useMarket();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState("descripcion");
  const seller = sellerFor(product.sellerId)!;
  const available = !!state.availability[seller.id];
  const rating = ratingFor(state.reviews, [product.id]);
  const current = product.images[Math.min(index, product.images.length - 1)];
  const video = useMedia(product.video?.src);
  const purchased =
    product.kind === "digital" &&
    state.orders.some(
      (order) => order.buyerId === account.id && order.lines.some((line) => line.id === product.id),
    );
  const related = state.products
    .filter((item) => item.id !== product.id && !item.hidden)
    .sort(
      (a, b) =>
        Number(b.category === product.category) - Number(a.category === product.category) ||
        Number(b.kind === product.kind) - Number(a.kind === product.kind),
    )
    .slice(0, 4);
  function add(next = false) {
    if (!next || !cart.some((line) => line.productId === product.id)) {
      if (!dispatch({ type: "cart", id: product.id, quantity: 1, additive: true })) return;
      toast.success("Producto agregado al carrito");
    }
    if (next) void navigate({ to: "/checkout", search: { vendedor: seller.id } });
  }
  return (
    <div className="market-container market-page">
      <Breadcrumb section={{ href: "/marketplace", label: "Marketplace" }}>
        {product.name}
      </Breadcrumb>
      <div className="product-detail">
        <section aria-label="Galería de producto">
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="detail-main-image"
                aria-label={"Ampliar " + (current?.name ?? "imagen")}
              >
                <MediaImage
                  key={current?.src}
                  media={current}
                  alt={product.name + " · " + (current?.name ?? "Imagen")}
                  priority
                />
                <span className="round-icon">
                  <Maximize2 size={17} />
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="lightbox">
              <DialogTitle>{product.name}</DialogTitle>
              <DialogDescription>{current?.name}</DialogDescription>
              <MediaImage media={current} alt={product.name} priority />
              {product.images.length > 1 && (
                <div className="button-row lightbox-controls">
                  <button
                    className="market-button secondary"
                    type="button"
                    onClick={() =>
                      setIndex((index + product.images.length - 1) % product.images.length)
                    }
                  >
                    Vista anterior
                  </button>
                  <button
                    className="market-button secondary"
                    type="button"
                    onClick={() => setIndex((index + 1) % product.images.length)}
                  >
                    Vista siguiente
                  </button>
                </div>
              )}
            </DialogContent>
          </Dialog>
          {product.images.length > 1 && (
            <div className="thumbnails">
              {product.images.map((image, position) => (
                <button
                  type="button"
                  key={image.src}
                  aria-label={image.name}
                  aria-pressed={position === index}
                  onClick={() => setIndex(position)}
                >
                  <MediaImage media={image} alt="" />
                </button>
              ))}
            </div>
          )}
          {video && (
            <video
              className="product-video"
              src={video}
              controls
              preload="metadata"
              aria-label={"Video de " + product.name}
            />
          )}
        </section>
        <section className="product-info">
          <div className="tags">
            <span className={"ticket kind-" + product.kind}>{kinds[product.kind]}</span>
            {product.badge && <span className="small-tag">{product.badge}</span>}
          </div>
          <h1>{product.name}</h1>
          <div className="button-row compact">
            <Rating {...rating} />
            <span className="muted">{product.category}</span>
          </div>
          <strong className="detail-price">{money(product.price)}</strong>
          <p>{product.description}</p>
          <div className="detail-facts">
            <span>
              <Boxes size={17} /> {product.material || "Material por confirmar"}
            </span>
            {product.days && (
              <span>
                <Clock3 size={17} /> {product.days}
              </span>
            )}
            {product.kind === "digital" && (
              <span>
                <FileBox size={17} /> {product.formats.join(" · ")}
              </span>
            )}
            <span>
              {available || product.kind === "digital" ? "Disponible" : "Consultar disponibilidad"}
            </span>
          </div>
          <div className="detail-actions">
            {product.kind === "service" ? (
              <Link
                className="market-button primary"
                to="/solicitar-fabricacion"
                search={{ fabricante: seller.id, producto: product.id }}
                disabled={!available}
              >
                Solicitar servicio <ArrowRight size={17} />
              </Link>
            ) : purchased ? (
              <Link
                to="/cuenta"
                search={{ seccion: "biblioteca" }}
                className="market-button primary"
              >
                <Download size={17} /> Ver en mi biblioteca
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  className="market-button primary"
                  onClick={() => add(true)}
                  disabled={!ready}
                >
                  {product.kind === "digital" ? "Comprar diseño" : "Comprar producto"}{" "}
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  className="market-button secondary"
                  onClick={() => add()}
                  disabled={!ready}
                >
                  <ShoppingBag size={17} /> Agregar al carrito
                </button>
              </>
            )}
            <FavoriteButton product={product} />
          </div>
          {product.kind !== "service" && (
            <Link
              className="text-action"
              to="/solicitar-fabricacion"
              search={{ fabricante: available ? seller.id : undefined, producto: product.id }}
            >
              Solicitar fabricación <ArrowRight size={16} />
            </Link>
          )}
          {product.kind === "physical" && (
            <p className="shipping-note">
              La entrega y el envío se coordinan directamente con el vendedor.
            </p>
          )}
          <Link to="/fabricante/$id" params={{ id: seller.id }} className="vendor-inline surface">
            <SellerLogo seller={seller} />
            <div>
              <strong>{seller.name}</strong>
              <small>{seller.city}</small>
            </div>
            <span>
              Consultar vendedor <ArrowRight size={16} />
            </span>
          </Link>
        </section>
      </div>

      <Tabs className="market-tabs detail-tabs" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="descripcion">Descripción</TabsTrigger>
          <TabsTrigger value="especificaciones">Especificaciones</TabsTrigger>
          {product.kind === "digital" && (
            <>
              <TabsTrigger value="archivos">Archivos incluidos</TabsTrigger>
              <TabsTrigger value="licencia">Licencia</TabsTrigger>
            </>
          )}
          <TabsTrigger value="resenas">Reseñas ({rating.count})</TabsTrigger>
          <TabsTrigger value="vendedor">Vendedor</TabsTrigger>
        </TabsList>
        <TabsContent value="descripcion" className="surface prose-market">
          <h2>Sobre esta publicación</h2>
          <p>{product.description}</p>
        </TabsContent>
        <TabsContent value="especificaciones" className="surface prose-market">
          <h2>Especificaciones</h2>
          <dl className="fact-list">
            <div>
              <dt>Material</dt>
              <dd>{product.material || "Por confirmar"}</dd>
            </div>
            <div>
              <dt>Dimensiones</dt>
              <dd>{product.dimensions || "Por confirmar"}</dd>
            </div>
            <div>
              <dt>Detalles</dt>
              <dd>{product.specs || "Consulta al vendedor"}</dd>
            </div>
            {product.days && (
              <div>
                <dt>Plazo estimado</dt>
                <dd>{product.days}</dd>
              </div>
            )}
          </dl>
        </TabsContent>
        <TabsContent value="archivos" className="surface prose-market">
          <h2>Archivos incluidos</h2>
          <p>
            {product.formats.join(", ")} · {product.asset?.name}. Disponible en Mis diseños al
            completar la compra.
          </p>
        </TabsContent>
        <TabsContent value="licencia" className="surface prose-market">
          <h2>{product.license}</h2>
          <p>
            {product.license === "Uso personal · ProtoLab v1"
              ? LICENSE_TERMS
              : "La licencia indicada por el vendedor se aplica a esta publicación."}
          </p>
        </TabsContent>
        <TabsContent value="resenas">
          <Reviews key={product.id} entries={rating.entries} />
        </TabsContent>
        <TabsContent value="vendedor" className="surface prose-market">
          <h2>{seller.name}</h2>
          <p>{seller.description}</p>
          <Link to="/fabricante/$id" params={{ id: seller.id }} className="text-action">
            Ver perfil <ArrowRight size={16} />
          </Link>
        </TabsContent>
      </Tabs>
      {related.length > 0 && (
        <section className="related-products">
          <div className="group-heading">
            <h2>También te puede interesar</h2>
          </div>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function DirectoryPage() {
  const { state } = useMarket();
  const [city, setCity] = useState("");
  const [technology, setTechnology] = useState("");
  const [material, setMaterial] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [availability, setAvailability] = useState("");
  const [rating, setRating] = useState("");
  function reset() {
    setCity("");
    setTechnology("");
    setMaterial("");
    setSpecialty("");
    setAvailability("");
    setRating("");
  }
  const result = sellers.filter(
    (seller) =>
      (!city || seller.city === city) &&
      (!technology || seller.technologies.includes(technology)) &&
      (!material || seller.materials.includes(material)) &&
      (!specialty || seller.specialties.includes(specialty)) &&
      (!availability || state.availability[seller.id] === (availability === "Disponible")) &&
      (!rating || reviewForSeller(state, seller.id).average >= Number.parseFloat(rating)),
  );
  return (
    <div className="market-container market-page">
      <PageTitle
        title="Encuentra un fabricante"
        breadcrumb="Fabricantes"
        description="Talleres y especialistas que trabajan con sus propios equipos en Honduras."
      />
      <section className="directory-controls surface" aria-label="Filtros de fabricantes">
        <Options label="Ubicación" value={city} choices={cities} onChange={setCity} />
        <Options
          label="Tecnología"
          value={technology}
          choices={distinct(sellers.flatMap((seller) => seller.technologies))}
          onChange={setTechnology}
        />
        <Options
          label="Material"
          value={material}
          choices={distinct(sellers.flatMap((seller) => seller.materials))}
          onChange={setMaterial}
        />
        <Options
          label="Especialidad"
          value={specialty}
          choices={distinct(sellers.flatMap((seller) => seller.specialties))}
          onChange={setSpecialty}
        />
        <Options
          label="Disponibilidad"
          value={availability}
          choices={["Disponible", "No disponible"]}
          onChange={setAvailability}
        />
        <Options
          label="Calificación"
          value={rating}
          choices={["4.5 y más", "4.0 y más"]}
          onChange={setRating}
        />
      </section>
      <div className="catalog-results-heading">
        <span role="status">
          <strong>{result.length}</strong> {result.length === 1 ? "colaborador" : "colaboradores"}
        </span>
        <button type="button" className="text-action" onClick={reset}>
          <X size={15} /> Limpiar filtros
        </button>
      </div>
      {result.length ? (
        <div className="seller-grid">
          {result.map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      ) : (
        <Empty title="No hay coincidencias">
          <p>Prueba con otra tecnología o ubicación.</p>
        </Empty>
      )}
    </div>
  );
}

export function SellerDetail({ seller }: { seller: Seller }) {
  const { state } = useMarket();
  const products = state.products.filter(
    (product) => product.sellerId === seller.id && !product.hidden,
  );
  const rating = reviewForSeller(state, seller.id);
  const available = !!state.availability[seller.id];
  const services = products.filter((product) => product.kind === "service");
  return (
    <div className="market-container market-page">
      <Breadcrumb section={{ href: "/fabricantes", label: "Fabricantes" }}>
        {seller.name}
      </Breadcrumb>
      <header className="surface seller-detail-hero">
        <img
          className="seller-cover"
          src={sellerCover(seller)}
          width="1280"
          height="853"
          alt={"Espacio de trabajo de " + seller.name}
        />
        <div className="seller-detail-main">
          <SellerLogo seller={seller} />
          <div>
            <div className="button-row compact">
              <SellerAvailability available={available} />
              <Rating {...rating} />
            </div>
            <h1>{seller.name}</h1>
            <p>
              <MapPin size={16} /> {seller.city}, Honduras
            </p>
          </div>
          {available ? (
            <Link
              to="/solicitar-fabricacion"
              search={{
                fabricante: seller.id,
                servicio: seller.materials.length ? undefined : "diseno",
              }}
              className="market-button primary"
            >
              {seller.materials.length ? "Solicitar fabricación" : "Solicitar diseño"}{" "}
              <ArrowRight size={17} />
            </Link>
          ) : (
            <button type="button" className="market-button secondary" disabled>
              Solicitar fabricación
            </button>
          )}
        </div>
        <div className="tags seller-detail-tags">
          {seller.specialties.map((item) => (
            <span className="small-tag" key={item}>
              {item}
            </span>
          ))}
        </div>
      </header>

      <Tabs className="market-tabs detail-tabs" defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Información general</TabsTrigger>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="portafolio">Portafolio</TabsTrigger>
          <TabsTrigger value="resenas">Reseñas ({rating.count})</TabsTrigger>
        </TabsList>
        <TabsContent value="perfil" className="surface prose-market">
          <h2>Acerca de {seller.name}</h2>
          <p>{seller.description}</p>
          <dl className="fact-list">
            <div>
              <dt>Tecnologías</dt>
              <dd>{seller.technologies.join(" · ")}</dd>
            </div>
            {!!seller.materials.length && (
              <div>
                <dt>Materiales</dt>
                <dd>{seller.materials.join(" · ")}</dd>
              </div>
            )}
            <div>
              <dt>Especialidades</dt>
              <dd>{seller.specialties.join(" · ")}</dd>
            </div>
          </dl>
        </TabsContent>
        <TabsContent value="servicios">
          {services.length ? (
            <div className="product-grid">
              {services.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="surface prose-market">
              <h2>Servicios por proyecto</h2>
              <p>{seller.specialties.join(" · ")}</p>
              {available && (
                <Link
                  className="text-action"
                  to="/solicitar-fabricacion"
                  search={{
                    fabricante: seller.id,
                    servicio: seller.materials.length ? undefined : "diseno",
                  }}
                >
                  Consulta tu proyecto <ArrowRight size={16} />
                </Link>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="productos">
          <div className="product-grid">
            {products
              .filter((product) => product.kind !== "service")
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
          {!products.some((product) => product.kind !== "service") && (
            <Empty title="Todavía no hay productos" />
          )}
        </TabsContent>
        <TabsContent value="portafolio">
          <div className="portfolio-grid">
            {products.slice(0, 6).map((product) => (
              <figure className="surface" key={product.id}>
                <MediaImage media={product.images.at(-1)} alt={product.name} />
                <figcaption>{product.name}</figcaption>
              </figure>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="resenas">
          <Reviews entries={rating.entries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function DesignServices() {
  const { state } = useMarket();
  return (
    <div className="market-container market-page">
      <Breadcrumb>Servicios de diseño</Breadcrumb>
      <section className="service-banner">
        <div>
          <PencilRuler size={27} />
          <h1>Diseño y asesoría</h1>
          <p>
            Encuentra apoyo para modelar una pieza, revisar su fabricación o definir la próxima
            versión de tu prototipo.
          </p>
          <Link
            to="/solicitar-fabricacion"
            search={{ servicio: "diseno" }}
            className="market-button primary"
          >
            Consultar mi proyecto <ArrowRight size={17} />
          </Link>
        </div>
        <img
          src="/marketplace/workshops/estudio-cad.webp"
          alt="Estación de diseño CAD y prototipos"
        />
      </section>
      <section className="related-products">
        <div className="group-heading">
          <h2>Servicios de especialistas</h2>
        </div>
        <div className="product-grid">
          {state.products
            .filter((product) => product.kind === "service" && !product.hidden)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>
    </div>
  );
}
