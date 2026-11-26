import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  File,
  FolderOpen,
  MapPin,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { sellers, type Seller } from "./catalog";
import { reviewForSeller, sellerFor, type Attachment, type RequestDraft } from "./model";
import { makeId, useMarket } from "./store";
import { Empty, Field, PageTitle, Rating, SellerAvailability, SellerLogo } from "./ui";

export type RequestSearch = {
  fabricante?: string | undefined;
  producto?: string | undefined;
  servicio?: "diseno" | undefined;
};
const allowedExtensions = [".stl", ".step", ".stp", ".obj", ".3mf", ".zip"];
const labels = ["Proyecto", "Especificaciones", "Fabricante", "Confirmación"];
const sizes = new Intl.NumberFormat("es-HN", { maximumFractionDigits: 1 });
function displaySize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  return bytes < 1024 ** 2
    ? sizes.format(bytes / 1024) + " KB"
    : sizes.format(bytes / 1024 ** 2) + " MB";
}

export function RequestPage({ search }: { search: RequestSearch }) {
  const { state, ready, dispatch } = useMarket();
  const product = state.products.find((entry) => !entry.hidden && entry.id === search.producto);
  const design = search.servicio === "diseno" || product?.kind === "service";
  const suggestedSeller = search.fabricante && sellerFor(search.fabricante);
  const available = sellers.filter(
    (seller) =>
      state.availability[seller.id] &&
      (design
        ? seller.technologies.includes("CAD")
        : seller.technologies.some((tech) => tech !== "CAD")),
  );
  const [draft, setDraft] = useState<RequestDraft>(() => ({
    title: product?.name ?? "",
    description: "",
    pieceType: design ? "Diseño y asesoría" : "Prototipo",
    application: "",
    quantity: 1,
    material: product?.material ?? "",
    color: "",
    dimensions: product?.dimensions ?? "",
    finish: "",
    notes: "",
    sellerId:
      suggestedSeller && available.some((seller) => seller.id === suggestedSeller.id)
        ? suggestedSeller.id
        : "",
    productId: product?.id,
  }));
  const top = useRef<HTMLHeadingElement>(null);
  const attachmentInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const selected = available.find((seller) => seller.id === draft.sellerId);
  function update<K extends keyof RequestDraft>(key: K, value: RequestDraft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }
  function attach(file?: File) {
    if (!file) return;
    const extension = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!allowedExtensions.includes(extension) || file.size === 0) {
      if (attachmentInput.current) attachmentInput.current.value = "";
      setError("Selecciona un archivo STL, STEP, OBJ, 3MF o ZIP que contenga datos.");
      return;
    }
    const attachment: Attachment = { name: file.name, bytes: file.size, extension };
    update("attachment", attachment);
    setError("");
  }
  function move(index: number) {
    setError("");
    setStep(index);
    requestAnimationFrame(() => {
      top.current?.focus({ preventScroll: true });
      top.current?.scrollIntoView({ block: "nearest" });
    });
  }
  function next(event: FormEvent) {
    event.preventDefault();
    if (
      step === 0 &&
      (!draft.title.trim() || !draft.description.trim() || !draft.application.trim())
    ) {
      setError("Completa el nombre, la descripción y la aplicación del proyecto.");
      return;
    }
    if (step === 2 && !selected) {
      setError("Selecciona un fabricante disponible.");
      return;
    }
    if (step < 3) {
      move(step + 1);
      return;
    }
    if (!selected) {
      move(2);
      return;
    }
    const id = makeId("PL-F");
    if (
      dispatch({
        type: "request",
        draft: { ...draft, title: draft.title.trim(), description: draft.description.trim() },
        id,
        date: new Date().toISOString(),
      })
    ) {
      setSent(id);
      toast.success("Solicitud registrada");
    } else setError("La solicitud no se guardó. Revisa la disponibilidad e inténtalo de nuevo.");
  }

  if (sent)
    return (
      <div className="market-container market-page">
        <section className="surface success-panel">
          <span className="success-icon">
            <CircleCheck size={33} />
          </span>
          <p className="reference">{sent}</p>
          <h1>Solicitud enviada</h1>
          <p>
            Tu proyecto <strong>{draft.title}</strong> aparece en tu historial. Puedes consultar el
            estado y revisar la oferta cuando esté disponible.
          </p>
          <div className="button-row">
            <Link
              to="/cuenta"
              search={{ seccion: "solicitudes" }}
              className="market-button primary"
            >
              Ver mis solicitudes <ArrowRight size={17} />
            </Link>
            <Link to="/fabricantes" className="market-button secondary">
              Seguir explorando
            </Link>
          </div>
        </section>
      </div>
    );

  return (
    <div className="market-container market-page">
      <PageTitle
        title={design ? "Solicitar diseño y asesoría" : "Solicitar fabricación"}
        breadcrumb={design ? "Solicitar diseño" : "Solicitar fabricación"}
        description="Cuéntanos qué necesitas y envía tu proyecto al especialista que elijas."
      />
      <div className="request-layout">
        <aside className="surface request-steps" aria-label="Etapas de la solicitud">
          <ol>
            {labels.map((label, index) => (
              <li key={label} aria-current={index === step ? "step" : undefined}>
                <span>{index < step ? <Check size={16} /> : index + 1}</span>
                <strong>{label}</strong>
              </li>
            ))}
          </ol>
          <div className="request-tip">
            <FolderOpen size={19} />
            <p>Puedes continuar con una descripción si todavía estás definiendo la pieza.</p>
          </div>
        </aside>

        <form className="surface flow-card" onSubmit={next}>
          <div className="prose-market">
            <p className="step-count">
              Paso {step + 1} de {labels.length}
            </p>
            <h2 ref={top} tabIndex={-1}>
              {
                [
                  "Información del proyecto",
                  "Archivo y especificaciones",
                  "Selecciona un fabricante",
                  "Revisa tu solicitud",
                ][step]
              }
            </h2>
          </div>
          {step === 0 && (
            <div className="form-grid">
              <Field label="Nombre del proyecto">
                <input
                  required
                  value={draft.title}
                  maxLength={100}
                  placeholder="Ej. Soporte para banco de pruebas"
                  onChange={(event) => update("title", event.target.value)}
                />
              </Field>
              <Field label="Cantidad">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  required
                  value={draft.quantity || ""}
                  onChange={(event) => update("quantity", Number(event.target.value))}
                />
              </Field>
              <div className="field-wide">
                <Field label="Descripción">
                  <textarea
                    required
                    rows={4}
                    value={draft.description}
                    maxLength={2500}
                    placeholder="Describe lo que quieres fabricar y los detalles relevantes."
                    onChange={(event) => update("description", event.target.value)}
                  />
                </Field>
              </div>
              <Field label="Tipo de pieza">
                <select
                  value={draft.pieceType}
                  onChange={(event) => update("pieceType", event.target.value)}
                >
                  {[
                    "Prototipo",
                    "Pieza funcional",
                    "Repuesto",
                    "Maqueta",
                    "Accesorio",
                    "Diseño y asesoría",
                    "Otra pieza",
                  ].map((label) => (
                    <option key={label}>{label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Aplicación">
                <input
                  required
                  maxLength={160}
                  value={draft.application}
                  placeholder="Ej. Verificar el encaje de un sensor"
                  onChange={(event) => update("application", event.target.value)}
                />
              </Field>
            </div>
          )}
          {step === 1 && (
            <div className="form-grid">
              <div className="field-wide">
                <input
                  className="sr-only"
                  ref={attachmentInput}
                  id="request-file"
                  type="file"
                  accept={allowedExtensions.join(",")}
                  onChange={(event) => attach(event.target.files?.[0])}
                />
                <label className="file-drop" htmlFor="request-file">
                  <Paperclip size={22} />
                  <strong>Seleccionar archivo</strong>
                  <small>STL, STEP, OBJ, 3MF o ZIP · Opcional</small>
                </label>
                {draft.attachment && (
                  <div className="file-chip">
                    <File size={19} />
                    <div>
                      <strong>{draft.attachment.name}</strong>
                      <small>
                        {draft.attachment.extension.toUpperCase().slice(1)} ·{" "}
                        {displaySize(draft.attachment.bytes)}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="round-icon"
                      aria-label="Quitar archivo"
                      onClick={() => {
                        update("attachment", undefined);
                        if (attachmentInput.current) attachmentInput.current.value = "";
                      }}
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}
              </div>
              <Field label="Material deseado">
                <input
                  maxLength={70}
                  value={draft.material}
                  placeholder="Ej. PETG o por definir"
                  onChange={(event) => update("material", event.target.value)}
                />
              </Field>
              <Field label="Color">
                <input
                  maxLength={65}
                  value={draft.color}
                  placeholder="Ej. Negro mate"
                  onChange={(event) => update("color", event.target.value)}
                />
              </Field>
              <Field label="Dimensiones">
                <input
                  maxLength={95}
                  value={draft.dimensions}
                  placeholder="Ej. 80 × 50 × 30 mm"
                  onChange={(event) => update("dimensions", event.target.value)}
                />
              </Field>
              <Field label="Acabado">
                <input
                  maxLength={90}
                  value={draft.finish}
                  placeholder="Ej. Natural"
                  onChange={(event) => update("finish", event.target.value)}
                />
              </Field>
              <div className="field-wide">
                <Field label="Observaciones">
                  <textarea
                    rows={3}
                    maxLength={1600}
                    value={draft.notes}
                    placeholder="Requisitos de montaje, aspecto u otras referencias"
                    onChange={(event) => update("notes", event.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}
          {step === 2 && (
            <fieldset className="maker-picker">
              <legend>Perfiles disponibles</legend>
              {available.map((seller) => (
                <ManufacturerOption
                  key={seller.id}
                  seller={seller}
                  selected={draft.sellerId === seller.id}
                  onChange={() => update("sellerId", seller.id)}
                />
              ))}
              {!available.length && (
                <Empty title="No hay perfiles disponibles para este servicio" />
              )}
            </fieldset>
          )}
          {step === 3 && (
            <div className="request-summary">
              <h3>{draft.title}</h3>
              <p>{draft.description}</p>
              <dl className="fact-list">
                <div>
                  <dt>Fabricante</dt>
                  <dd>
                    {selected?.name} · {selected?.city}
                  </dd>
                </div>
                <div>
                  <dt>Tipo y aplicación</dt>
                  <dd>
                    {draft.pieceType} · {draft.application}
                  </dd>
                </div>
                <div>
                  <dt>Cantidad</dt>
                  <dd>{draft.quantity}</dd>
                </div>
                <div>
                  <dt>Material y color</dt>
                  <dd>
                    {[draft.material, draft.color].filter(Boolean).join(" · ") || "Por definir"}
                  </dd>
                </div>
                <div>
                  <dt>Dimensiones y acabado</dt>
                  <dd>
                    {[draft.dimensions, draft.finish].filter(Boolean).join(" · ") || "Por definir"}
                  </dd>
                </div>
                {draft.attachment && (
                  <div>
                    <dt>Archivo</dt>
                    <dd>
                      {draft.attachment.name} · {displaySize(draft.attachment.bytes)}
                    </dd>
                  </div>
                )}
                {draft.notes && (
                  <div>
                    <dt>Observaciones</dt>
                    <dd>{draft.notes}</dd>
                  </div>
                )}
              </dl>
              <p className="notice">
                El fabricante revisa el proyecto y establece el precio y el plazo en su oferta.
              </p>
            </div>
          )}
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <div className="flow-actions">
            {step > 0 ? (
              <button
                type="button"
                className="market-button secondary"
                onClick={() => move(step - 1)}
              >
                <ArrowLeft size={17} /> Atrás
              </button>
            ) : (
              <span />
            )}
            <button
              key={step}
              className="market-button primary"
              type="submit"
              disabled={!ready || (step === 2 && !selected) || (step === 3 && !selected)}
            >
              {step === 3 ? (
                <>
                  Enviar solicitud de fabricación <Send size={17} />
                </>
              ) : (
                <>
                  Continuar <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManufacturerOption({
  seller,
  selected,
  onChange,
}: {
  seller: Seller;
  selected: boolean;
  onChange: () => void;
}) {
  const { state } = useMarket();
  return (
    <label className={"maker-option" + (selected ? " chosen" : "")}>
      <input type="radio" name="fabricante" checked={selected} onChange={onChange} />
      <SellerLogo seller={seller} />
      <div>
        <strong>{seller.name}</strong>
        <small>
          <MapPin size={13} />
          {seller.city}
        </small>
        <small>{seller.specialties.join(" · ")}</small>
      </div>
      <div className="maker-option-end">
        <SellerAvailability available />
        <Rating {...reviewForSeller(state, seller.id)} />
      </div>
    </label>
  );
}
