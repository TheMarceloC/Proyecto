import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, File, ImagePlus, PencilRuler, Plus, Store, X } from "lucide-react";
import { toast } from "sonner";
import { DESIGN_LICENSE } from "@/lib/design-commerce";
import {
  accounts,
  categories,
  kinds,
  type AccountId,
  type Kind,
  type Media,
  type Product,
} from "./catalog";
import { saveMedia } from "./media";
import { roundMoney, sellerFor } from "./model";
import { useMarket } from "./store";
import { Empty, Field, MediaImage, PageTitle, SellerLogo, useMedia } from "./ui";

const maxImageSize = 8 * 1024 * 1024;
const maxVideoSize = 65 * 1024 * 1024;
const maxFileSize = 40 * 1024 * 1024;
const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const videoTypes = ["video/mp4", "video/webm"];
const digitalExtensions = [".stl", ".step", ".stp", ".obj", ".3mf", ".zip"];

export function SellPage() {
  const { account, switchAccount, ready } = useMarket();
  const navigate = useNavigate();
  const merchant = !!account.sellerId;
  return (
    <div className="market-container market-page">
      <PageTitle title="Vende en ProtoLab" breadcrumb="Conviértete en vendedor" />
      <section className="service-banner">
        <div>
          <Store size={27} />
          <h2>Convierte tus habilidades y equipos en nuevas oportunidades.</h2>
          <p>Publica diseños y piezas, recibe solicitudes y establece tus propios precios.</p>
          {merchant ? (
            <Link to="/publicar" className="market-button primary">
              Crear una publicación <Plus size={17} />
            </Link>
          ) : (
            <a className="market-button primary" href="#elegir-perfil">
              Comenzar a vender <ArrowRight size={17} />
            </a>
          )}
        </div>
        <img src="/marketplace/workshops/taller-fdm.webp" alt="Taller de impresión 3D" />
      </section>
      <section className="related-products" id="elegir-perfil">
        <div className="group-heading">
          <div>
            <h2>Elige tu cuenta comercial</h2>
            <p>Publica desde el perfil que representa tu trabajo.</p>
          </div>
        </div>
        <div className="portfolio-grid">
          {accounts
            .filter((item) => item.sellerId)
            .map((item) => {
              const seller = sellerFor(item.sellerId)!;
              return (
                <div className="surface seller-choice" key={item.id}>
                  <SellerLogo seller={seller} />
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.role} · {seller.city}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="market-button secondary"
                    disabled={!ready}
                    onClick={() => {
                      switchAccount(item.id as AccountId);
                      void navigate({ to: "/cuenta", search: { seccion: "publicaciones" } });
                    }}
                  >
                    Abrir cuenta <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
}

export function PublicationPage({ id }: { id?: string | undefined }) {
  const { state, account, ready } = useMarket();
  const seller = sellerFor(account.sellerId);
  const product =
    id && state.products.find((entry) => entry.id === id && entry.sellerId === seller?.id);
  if (!ready)
    return (
      <div className="market-container market-page">
        <PageTitle
          title={id ? "Editar publicación" : "Nueva publicación"}
          breadcrumb="Publicaciones"
        />
      </div>
    );
  if (!seller || (id && !product))
    return (
      <div className="market-container market-page">
        <PageTitle title="Publicar en ProtoLab" breadcrumb="Publicaciones" />
        <Empty
          title={seller ? "Publicación no encontrada en esta cuenta" : "Elige una cuenta comercial"}
        >
          <Link
            to={seller ? "/cuenta" : "/vender"}
            search={seller ? { seccion: "publicaciones" } : {}}
            className="market-button primary"
          >
            {seller ? "Mis publicaciones" : "Abrir cuentas comerciales"} <ArrowRight size={16} />
          </Link>
        </Empty>
      </div>
    );
  return (
    <PublicationForm
      key={seller.id + ":" + (product ? product.id : "")}
      sellerId={seller.id}
      product={product || undefined}
    />
  );
}

function validateVideo(file: File) {
  return new Promise<boolean>((resolve) => {
    const url = URL.createObjectURL(file);
    const element = document.createElement("video");
    function finish(valid: boolean) {
      window.clearTimeout(timeout);
      URL.revokeObjectURL(url);
      resolve(valid);
    }
    const timeout = window.setTimeout(() => finish(false), 5000);
    element.onloadedmetadata = () =>
      finish(Number.isFinite(element.duration) && element.duration <= 30.1 && element.duration > 0);
    element.onerror = () => finish(false);
    element.preload = "metadata";
    element.src = url;
  });
}

function PublicationForm({
  sellerId,
  product,
}: {
  sellerId: string;
  product?: Product | undefined;
}) {
  const { dispatch } = useMarket();
  const navigate = useNavigate();
  const [kind, setKind] = useState<Kind>(product?.kind ?? "digital");
  const [kept, setKept] = useState<Media[]>(product?.images ?? []);
  const [photos, setPhotos] = useState<File[]>([]);
  const [storedVideo, setStoredVideo] = useState(product?.video);
  const [video, setVideo] = useState<File>();
  const [asset, setAsset] = useState<File>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkingVideo, setCheckingVideo] = useState(false);
  const check = useRef(0);
  const storedVideoUrl = useMedia(storedVideo?.src);

  function pictures(list: File[]) {
    if (list.length + photos.length + kept.length > 6) {
      setError("Puedes incluir hasta seis imágenes en total.");
      return;
    }
    if (
      list.some(
        (file) => !imageTypes.includes(file.type) || file.size > maxImageSize || file.size === 0,
      )
    ) {
      setError("Usa imágenes JPEG, PNG, AVIF o WebP de hasta 8 MB cada una.");
      return;
    }
    setPhotos((previous) => [...previous, ...list]);
    setError("");
  }

  async function selectVideo(file?: File) {
    const attempt = ++check.current;
    if (!file) return;
    if (!videoTypes.includes(file.type) || file.size > maxVideoSize || file.size === 0) {
      setCheckingVideo(false);
      setError("El video debe ser MP4 o WebM y ocupar hasta 65 MB.");
      return;
    }
    setCheckingVideo(true);
    const valid = await validateVideo(file);
    if (attempt !== check.current) return;
    setCheckingVideo(false);
    if (!valid) {
      setError("Selecciona un video reproducible de hasta 30 segundos.");
      return;
    }
    setVideo(file);
    setStoredVideo(undefined);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || checkingVideo) return;
    const values = new FormData(event.currentTarget);
    const entry = (name: string) => String(values.get(name) ?? "").trim();
    const stillAsset = kind === "digital" ? product?.asset : undefined;
    const category = categories.find((item) => item === entry("category"));
    const price = Number(entry("price"));
    if (
      !category ||
      !entry("name") ||
      !entry("description") ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !entry("material") ||
      (kind === "digital" && (!entry("license") || (!asset && !stillAsset)))
    ) {
      setError(
        "Completa el nombre, categoría, precio, descripción y material. Los diseños también requieren un archivo y licencia.",
      );
      return;
    }
    if (!photos.length && !kept.length) {
      setError("Selecciona al menos una imagen.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const files = [
        ...photos,
        ...(video ? [video] : []),
        ...(asset && kind === "digital" ? [asset] : []),
      ];
      const saved = await saveMedia(files);
      const images = [...kept, ...saved.slice(0, photos.length)];
      const downloads = asset && kind === "digital" ? saved.at(-1) : stillAsset;
      const listing: Product = {
        id: product?.id ?? "pl-" + crypto.randomUUID(),
        sellerId,
        name: entry("name"),
        category,
        kind,
        description: entry("description"),
        price: roundMoney(price),
        material: entry("material"),
        specs: entry("specs"),
        dimensions: entry("dimensions"),
        days: entry("days"),
        license: kind === "digital" ? entry("license") : "",
        images,
        video: video ? saved[photos.length] : storedVideo,
        asset: downloads,
        formats:
          kind !== "digital"
            ? []
            : asset
              ? [(asset.name.split(".").at(-1) ?? "Archivo").toUpperCase()]
              : (product?.formats ?? []),
        createdAt: product?.createdAt ?? new Date().toISOString(),
        featured: product?.featured,
        hidden: product?.hidden,
        badge:
          entry("badge") === "Personalizable"
            ? "Personalizable"
            : entry("badge") === "Fabricado bajo pedido"
              ? "Fabricado bajo pedido"
              : undefined,
      };
      if (!dispatch({ type: "publish", product: listing })) {
        setError("La publicación no pudo guardarse en esta cuenta.");
        return;
      }
      toast.success(product ? "Publicación actualizada" : "Publicación creada");
      void navigate({ to: "/cuenta", search: { seccion: "publicaciones" } });
    } catch {
      setError("No se pudieron guardar los archivos en este navegador.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="market-container market-page">
      <PageTitle
        title={product ? "Editar publicación" : "Nueva publicación"}
        breadcrumb="Publicaciones"
        description={sellerFor(sellerId)?.name}
      >
        <Link to="/cuenta" search={{ seccion: "publicaciones" }} className="text-action">
          Mis publicaciones <ArrowRight size={16} />
        </Link>
      </PageTitle>
      <form className="request-layout publication-form" onSubmit={(event) => void submit(event)}>
        <div className="surface flow-card">
          <h2>Información comercial</h2>
          <div className="form-grid">
            <div className="field-wide">
              <Field label="Nombre">
                <input name="name" required maxLength={100} defaultValue={product?.name} />
              </Field>
            </div>
            <Field label="Tipo de producto">
              <select value={kind} onChange={(event) => setKind(event.target.value as Kind)}>
                {Object.entries(kinds).map(([value, title]) => (
                  <option key={value} value={value}>
                    {title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Categoría">
              <select name="category" defaultValue={product?.category}>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Precio (L)">
              <input
                name="price"
                type="number"
                min="0.01"
                max="1000000"
                step="0.01"
                required
                defaultValue={product?.price}
              />
            </Field>
            <Field label="Material">
              <input name="material" maxLength={70} required defaultValue={product?.material} />
            </Field>
            <div className="field-wide">
              <Field label="Descripción">
                <textarea
                  name="description"
                  required
                  rows={4}
                  maxLength={2000}
                  defaultValue={product?.description}
                />
              </Field>
            </div>
            <div className="field-wide">
              <Field label="Especificaciones">
                <textarea name="specs" maxLength={1200} rows={3} defaultValue={product?.specs} />
              </Field>
            </div>
            <Field label="Dimensiones">
              <input name="dimensions" maxLength={100} defaultValue={product?.dimensions} />
            </Field>
            {kind !== "digital" && (
              <Field label="Tiempo de fabricación">
                <input
                  name="days"
                  placeholder="Ej. 3–5 días hábiles"
                  maxLength={60}
                  defaultValue={product?.days}
                />
              </Field>
            )}
            <Field label="Distintivo">
              <select name="badge" defaultValue={product?.badge ?? ""}>
                <option value="">Ninguno</option>
                <option>Personalizable</option>
                <option>Fabricado bajo pedido</option>
              </select>
            </Field>
            {kind === "digital" && (
              <div className="field-wide">
                <Field label="Licencia">
                  <input
                    name="license"
                    required
                    maxLength={150}
                    defaultValue={product?.license || DESIGN_LICENSE}
                  />
                </Field>
              </div>
            )}
          </div>
        </div>
        <div className="surface flow-card upload-panel">
          <h2>Imágenes y archivos</h2>
          <div>
            <input
              id="publication-images"
              className="sr-only"
              type="file"
              accept={imageTypes.join(",")}
              multiple
              onChange={(event) => {
                pictures(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
            />
            <label className="file-drop" htmlFor="publication-images">
              <ImagePlus size={21} />
              <strong>Agregar imágenes</strong>
              <small>{photos.length + kept.length} de 6 · Hasta 8 MB por imagen</small>
            </label>
            {(kept.length > 0 || photos.length > 0) && (
              <div className="upload-gallery">
                {kept.map((image, index) => (
                  <div key={image.src}>
                    <MediaImage media={image} alt={image.name} />
                    <button
                      type="button"
                      className="round-icon"
                      aria-label={"Quitar imagen guardada " + (index + 1)}
                      onClick={() => setKept(kept.filter((entry) => entry !== image))}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {photos.map((file, index) => (
                  <div key={file.name + ":" + index}>
                    <FilePreview file={file} />
                    <button
                      type="button"
                      className="round-icon"
                      aria-label={"Quitar imagen nueva " + (index + 1)}
                      onClick={() => setPhotos(photos.filter((_, position) => position !== index))}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Field label="Video opcional" hint="MP4 o WebM · Hasta 30 segundos y 65 MB">
            <input
              type="file"
              accept={videoTypes.join(",")}
              onChange={(event) => {
                void selectVideo(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </Field>
          {checkingVideo && <p role="status">Verificando duración…</p>}
          {video && <FilePreview file={video} />}
          {storedVideoUrl && (
            <video
              className="product-video"
              controls
              src={storedVideoUrl}
              aria-label="Video de la publicación"
            />
          )}
          {(video || storedVideo) && (
            <button
              className="text-action"
              type="button"
              onClick={() => {
                check.current++;
                setCheckingVideo(false);
                setVideo(undefined);
                setStoredVideo(undefined);
              }}
            >
              <X size={16} /> Quitar video
            </button>
          )}
          {kind === "digital" && (
            <div>
              <Field label="Archivo digital" hint="STL, STEP, OBJ, 3MF o ZIP · Hasta 40 MB">
                <input
                  type="file"
                  accept={digitalExtensions.join(",")}
                  onChange={(event) => {
                    const selected = event.target.files?.[0];
                    event.target.value = "";
                    if (!selected) return;
                    if (
                      selected.size <= 0 ||
                      selected.size > maxFileSize ||
                      !digitalExtensions.some((extension) =>
                        selected.name.toLowerCase().endsWith(extension),
                      )
                    ) {
                      setError("Selecciona un archivo compatible de hasta 40 MB.");
                      return;
                    }
                    setAsset(selected);
                    setError("");
                  }}
                />
              </Field>
              {(asset || product?.asset) && (
                <p className="upload-file-label">
                  <File size={17} />
                  {asset?.name ?? product?.asset?.name}
                </p>
              )}
            </div>
          )}
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <button type="submit" className="market-button primary" disabled={busy || checkingVideo}>
            {busy ? "Guardando…" : product ? "Guardar cambios" : "Guardar publicación"}{" "}
            <Check size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

function FilePreview({ file }: { file: File }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  if (!src) return null;
  return file.type.startsWith("video/") ? (
    <video src={src} controls className="product-video" aria-label="Vista previa del video" />
  ) : (
    <img src={src} alt={file.name} />
  );
}
