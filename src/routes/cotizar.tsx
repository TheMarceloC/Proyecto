import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, uploadFile, errorText, type Design } from "@/lib/community";
import { demoDesign } from "@/lib/demo-designs";
import { AccountForm, useMember } from "@/components/community/Account";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileBox,
  FileUp,
  Image as ImageIcon,
  Lightbulb,
  Loader2,
  Package,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Field,
  GlassCard,
  OptionCard,
  PillOption,
  ProgressBar,
  SectionHeading,
  StatusBadge,
  inputClass,
  btnStyles,
} from "@/components/site/ui";
import { PieceVisual } from "@/components/site/PieceVisual";
import { MaterialEstimate } from "@/components/site/MaterialEstimate";
import { PrintCostControls } from "@/components/site/PrintCostControls";
import { DEFAULT_PRINT_SETTINGS } from "@/lib/print-pricing";
import { QUICK_SIZES, quickEstimate, type QuickSize } from "@/lib/quick-estimate";
import {
  MATERIALS as MATERIAL_LIST,
  REQUIREMENTS,
  START_OPTIONS,
  USE_CASES,
  recommendMaterial,
  type StartOptionId,
} from "@/lib/protolab";

type SearchParams = { inicio?: StartOptionId; diseno?: string };

const START_IDS = START_OPTIONS.map((o) => o.id) as string[];

export const Route = createFileRoute("/cotizar")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    ...(typeof search["inicio"] === "string" && START_IDS.includes(search["inicio"])
      ? { inicio: search["inicio"] as StartOptionId }
      : {}),
    ...(typeof search["diseno"] === "string" &&
    (/^[0-9a-f-]{36}$/.test(search["diseno"]) || demoDesign(search["diseno"]))
      ? { diseno: search["diseno"] }
      : {}),
  }),
  head: () => ({
    meta: [
      { title: "Cotizar mi pieza — ProtoLab" },
      {
        name: "description",
        content:
          "Cuéntanos qué tienes, para qué es la pieza y recibe una estimación preliminar de precio y tiempo. No necesitas saber de impresión 3D.",
      },
      { property: "og:title", content: "Cotizar mi pieza — ProtoLab" },
      {
        property: "og:description",
        content: "Estima tu pieza sin cuenta. Guarda y envía a revisión cuando quieras continuar.",
      },
    ],
  }),
  component: CotizarPage,
});

const STEPS = ["Proyecto", "Tu idea", "Tu pieza", "Estimación", "Guardar y enviar"];
const STEP_HINTS = [
  "Cuéntanos qué tienes y para qué es la pieza.",
  "Describe tu idea. Puedes añadir una foto o boceto si lo tienes.",
  "Dinos cuántas piezas necesitas. De lo técnico nos encargamos nosotros.",
  "Consulta tu estimación sin cuenta ni datos de contacto.",
  "Completa tus datos e inicia sesión solo para enviar a revisión.",
];
const startIcons = [FileBox, Pencil, Package, Lightbulb];
const COLORS = ["Negro", "Blanco", "Gris", "Otro", "No importa"];

type UploadState = { name: string; size: string; status: "cargando" | "listo"; raw: File } | null;

function CotizarPage() {
  const { inicio, diseno } = Route.useSearch();
  const member = useMember();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const linkedDesign = useQuery({
    queryKey: ["design", diseno],
    queryFn: () => api<Design>("designs/" + diseno),
    initialData: demoDesign(diseno),
    enabled: Boolean(diseno) && !demoDesign(diseno),
    retry: false,
  });
  const [step, setStep] = useState(0);
  const [start, setStart] = useState<StartOptionId>(inicio ?? (diseno ? "archivo" : "idea"));
  const [useCase, setUseCase] = useState("");
  const [requirement, setRequirement] = useState(REQUIREMENTS[REQUIREMENTS.length - 1]!);
  const [file, setFile] = useState<UploadState>(null);
  const [refFile, setRefFile] = useState<UploadState>(null);
  const [dragging, setDragging] = useState(false);
  const [dims, setDims] = useState({ x: "", y: "", z: "", unit: "mm", unsure: false });
  const [material, setMaterial] = useState<string>("auto");
  const [color, setColor] = useState("No importa");
  const [quantity, setQuantity] = useState(1);
  const [gramsInput, setGramsInput] = useState("");
  const [quickSize, setQuickSize] = useState<QuickSize>("");
  const [printSettings, setPrintSettings] = useState({ ...DEFAULT_PRINT_SETTINGS, hours: "" });
  const [priority, setPriority] = useState("Normal");
  const [detail, setDetail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [delivery, setDelivery] = useState("Retiro local");
  const [client, setClient] = useState({ name: "", email: "", phone: "", city: "" });
  const [code, setCode] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const refRef = useRef<HTMLInputElement>(null);

  const hasFileFlow = start === "archivo";
  const recommendation = recommendMaterial(requirement);
  const effectiveMaterial = material === "auto" ? recommendation.code : material;
  const needsDesign = !hasFileFlow && !linkedDesign.data;
  const quick = quickEstimate(effectiveMaterial, quantity, quickSize, gramsInput, printSettings);
  const grams = quick?.grams ?? Number(gramsInput);
  const printing = quick?.printing;
  const estimate = printing?.material;
  const estimateSettings = quick?.settings ?? printSettings;

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  function upload(list: FileList | null, kind: "cad" | "ref") {
    const f = list?.[0];
    if (!f) return;
    const size = `${(f.size / 1024 / 1024).toFixed(1)} MB`;
    const setter = kind === "cad" ? setFile : setRefFile;
    if (f.size > 50 * 1024 * 1024) {
      toast.error("El archivo debe pesar como máximo 50 MB.");
      return;
    }
    setter({ name: f.name, size, status: "listo", raw: f });
  }

  async function submit() {
    if (demoDesign(diseno)) {
      setSubmitError(
        "Este diseño pertenece a la demostración. Puedes explorar la estimación, pero no se enviará un pedido real.",
      );
      return;
    }
    if (member.data?.configured === false || member.isError) {
      setSubmitError(
        "No podemos enviar la solicitud ahora. Tu estimación sigue disponible; intenta de nuevo más tarde.",
      );
      return;
    }
    if (!member.data?.user) {
      setSubmitError("Inicia sesión para guardar tu cotización.");
      return;
    }
    if (!(hasFileFlow ? file : refFile) && !linkedDesign.data && detail.trim().length < 20) {
      setSubmitError(
        "Cuéntanos qué necesitas en el paso Tu idea (al menos 20 caracteres). No necesitas adjuntar archivos ni conocer datos técnicos.",
      );
      return;
    }
    if (
      !client.name.trim() ||
      !client.phone.trim() ||
      !client.city.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)
    ) {
      setSubmitError(
        "Completa nombre, correo válido, teléfono y ciudad para guardar y enviar a revisión.",
      );
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const selected = hasFileFlow ? file : refFile;
      const file_path = selected ? await uploadFile(selected.raw, "quote") : null;
      const result = await api<{ code: string }>("quotes", {
        project:
          projectName ||
          linkedDesign.data?.title ||
          detail.slice(0, 100) ||
          useCase ||
          "Pieza por definir",
        material: effectiveMaterial,
        quantity,
        priority,
        client_name: client.name,
        email: client.email,
        phone: client.phone,
        city: client.city,
        detail,
        file_path,
        design_id: linkedDesign.data?.id || null,
        specifications: {
          start,
          useCase: useCase || "Por definir",
          requirement,
          dims,
          color,
          delivery,
          materialSelection: material,
          // Referencia del cliente; el precio aprobado sigue siendo exclusivo del equipo.
          materialEstimate: {
            gramsPerPiece: estimate?.grams ?? null,
            assumedWeight: quick?.assumedWeight ?? false,
            referenceSize: quickSize || null,
            needsDesign,
          },
          printing: {
            ...printSettings,
            hours: quick
              ? Number(estimateSettings.hours)
              : printSettings.hours.trim()
                ? Number(printSettings.hours) || null
                : null,
            timeBasis: estimateSettings.timeBasis,
            assumedTime: quick?.assumedTime ?? false,
            printer: printing?.profile.id ?? printSettings.printer,
            effectiveWatts: printing?.watts ?? null,
          },
        },
      });
      setCode(result.code);
      toast.success("Solicitud guardada. Puedes consultar su seguimiento.");
    } catch (error) {
      setSubmitError(errorText(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (code) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-20">
        <GlassCard className="animate-step-in p-10 text-center">
          <CheckCircle2 className="mx-auto size-10 text-accent" />
          <h1 className="mt-5 text-2xl font-bold text-foreground">
            Solicitud recibida correctamente.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Revisaremos tu pieza y confirmaremos el precio final. Guarda tu código de proyecto.
          </p>
          <p className="label-caps mt-6">Código de proyecto</p>
          <p className="text-gradient font-display text-3xl font-bold">{code}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/seguimiento" search={{ codigo: code }} className={btnStyles.primary}>
              Ver seguimiento
            </Link>
            <Link to="/panel" className={btnStyles.ghost}>
              Ir a mis proyectos
            </Link>
          </div>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-24">
      <SectionHeading
        eyebrow="Cotizar"
        title="Cotizar mi pieza"
        text="Estima tu pieza sin cuenta. Puedes comenzar con una idea y dejar los detalles técnicos en nuestras manos."
      />
      {linkedDesign.isError && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-border p-4 text-sm text-muted-foreground"
        >
          No pudimos cargar el diseño elegido. Puedes seguir describiendo tu pieza o volver a
          intentarlo más tarde.
        </p>
      )}

      {linkedDesign.data && (
        <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm">
          Fabricar diseño: <strong>{linkedDesign.data.title}</strong> · por{" "}
          {linkedDesign.data.author_name}
          {demoDesign(diseno) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Referencia de demostración: no incluye un archivo para fabricar y no permite enviar un
              pedido real.
            </p>
          )}
        </div>
      )}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <GlassCard className="rounded-3xl p-5 sm:p-7">
          {/* progreso */}
          <div>
            <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-center gap-2">
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold transition ${
                      i <= step
                        ? "bg-accent text-accent-foreground"
                        : "bg-white/10 text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={
                      i === step ? "font-semibold text-foreground" : "text-muted-foreground"
                    }
                  >
                    {s}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <ProgressBar value={progress} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Paso {step + 1} de {STEPS.length} · {STEP_HINTS[step]}
            </p>
          </div>

          <div key={step} className="animate-step-in mt-7">
            {step === 0 ? (
              <div className="space-y-7">
                <Field label="¿Qué tienes ahora?">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {START_OPTIONS.map((o, i) => {
                      const Icon = startIcons[i] ?? FileBox;
                      const selected = start === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setStart(o.id)}
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                            selected
                              ? "border-accent bg-accent/10"
                              : "border-border bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/15 text-accent">
                            <Icon className="size-4" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-foreground">
                              {o.title}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {o.text}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field
                  label="¿Para qué necesitas la pieza?"
                  hint="Elige lo que se acerque a tu proyecto, o déjalo por definir."
                >
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {USE_CASES.map((u) => (
                      <PillOption key={u} selected={useCase === u} onClick={() => setUseCase(u)}>
                        {u}
                      </PillOption>
                    ))}
                  </div>
                </Field>

                <Field
                  label="¿Qué necesita hacer la pieza?"
                  hint="Si no sabes qué elegir, marca «No estoy seguro» y te ayudamos."
                >
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {REQUIREMENTS.map((r) => (
                      <PillOption
                        key={r}
                        selected={requirement === r}
                        onClick={() => setRequirement(r)}
                      >
                        {r}
                      </PillOption>
                    ))}
                  </div>
                </Field>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-6">
                {hasFileFlow ? (
                  <>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        upload(e.dataTransfer.files, "cad");
                      }}
                      onClick={() => fileRef.current?.click()}
                      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                        dragging ? "border-accent bg-accent/10" : "border-border bg-white/[0.03]"
                      }`}
                    >
                      <FileUp className="mx-auto size-6 text-accent" />
                      <p className="mt-3 text-sm font-medium text-foreground">
                        Arrastra tu archivo aquí o haz clic para seleccionarlo
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        .STL · .OBJ · .STEP · .STP
                      </p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".stl,.obj,.step,.stp"
                        className="hidden"
                        onChange={(e) => upload(e.target.files, "cad")}
                      />
                    </div>

                    {file ? (
                      <UploadRow upload={file} onRemove={() => setFile(null)} badge="3D" />
                    ) : null}

                    <Field
                      label="Medidas aproximadas (opcional)"
                      hint="Si las conoces, escribe largo, ancho y alto. También puedes dejarlas en blanco."
                    >
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {(["x", "y", "z"] as const).map((axis) => (
                          <input
                            key={axis}
                            className={inputClass}
                            aria-label={
                              axis === "x"
                                ? "Largo aproximado"
                                : axis === "y"
                                  ? "Ancho aproximado"
                                  : "Alto aproximado"
                            }
                            placeholder={axis === "x" ? "Largo" : axis === "y" ? "Ancho" : "Alto"}
                            inputMode="decimal"
                            disabled={dims.unsure}
                            value={dims[axis]}
                            onChange={(e) => setDims({ ...dims, [axis]: e.target.value })}
                          />
                        ))}
                        <div className="grid grid-cols-2 gap-2">
                          {["mm", "cm"].map((u) => (
                            <PillOption
                              key={u}
                              selected={dims.unit === u}
                              onClick={() => setDims({ ...dims, unit: u })}
                            >
                              {u}
                            </PillOption>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDims({ ...dims, unsure: !dims.unsure })}
                        className={`mt-3 text-xs font-semibold transition ${dims.unsure ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {dims.unsure ? "✓ " : ""}No estoy seguro de las dimensiones
                      </button>
                    </Field>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-accent/30 bg-accent/[0.07] p-5">
                      <p className="text-sm font-semibold text-foreground">
                        Sin archivo 3D no hay problema.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cuéntanos qué quieres crear y para qué lo usarás. Nosotros te ayudamos con
                        el diseño, las medidas y el material. La foto o el boceto son opcionales.
                      </p>
                    </div>

                    <div
                      onClick={() => refRef.current?.click()}
                      className="cursor-pointer rounded-2xl border-2 border-dashed border-border bg-white/[0.03] p-8 text-center transition hover:border-accent/50"
                    >
                      <ImageIcon className="mx-auto size-6 text-accent" />
                      <p className="mt-3 text-sm font-medium text-foreground">
                        Añadir una foto o boceto (opcional)
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        JPG · PNG · PDF · archivos CAD
                      </p>
                      <input
                        ref={refRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf,.stl,.obj,.step,.stp,.dwg,.dxf"
                        className="hidden"
                        onChange={(e) => upload(e.target.files, "ref")}
                      />
                    </div>

                    {refFile ? (
                      <UploadRow upload={refFile} onRemove={() => setRefFile(null)} badge="REF" />
                    ) : null}
                  </>
                )}
                <Field
                  label="Cuéntanos qué te gustaría crear"
                  hint="Por ejemplo: un soporte para poner mi celular sobre el escritorio. No necesitas usar palabras técnicas."
                >
                  <textarea
                    rows={5}
                    className={inputClass}
                    aria-label="Descripción de tu idea"
                    placeholder="Me gustaría una pieza que… La usaría para…"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                  />
                </Field>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-7">
                <Field label="Nombre del proyecto" hint="Opcional, para identificarlo después.">
                  <input
                    className={inputClass}
                    placeholder="Soporte para sensor"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </Field>

                <Field label="Material">
                  <button
                    type="button"
                    onClick={() => setMaterial("auto")}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                      material === "auto"
                        ? "border-accent bg-accent/10"
                        : "border-border bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/20 text-accent">
                      <Sparkles className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">
                        Que ProtoLab elija el material
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Tú nos dices para qué usarás la pieza. Nosotros elegimos una opción adecuada
                        y la confirmamos contigo.
                      </span>
                    </span>
                  </button>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-accent">
                      Quiero elegir un material (opcional)
                    </summary>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {MATERIAL_LIST.map((m) => (
                        <PillOption
                          key={m.code}
                          selected={material === m.code}
                          onClick={() => setMaterial(m.code)}
                        >
                          {m.code}
                        </PillOption>
                      ))}
                    </div>
                  </details>
                </Field>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Cantidad de piezas">
                    <div className="flex items-center rounded-xl border border-input bg-white/5">
                      <button
                        type="button"
                        aria-label="Menos"
                        className="px-4 py-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      >
                        −
                      </button>
                      <span className="flex-1 text-center font-semibold text-foreground">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Más"
                        className="px-4 py-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setQuantity((q) => Math.min(1000, q + 1))}
                      >
                        +
                      </button>
                    </div>
                  </Field>
                  <Field label="Prioridad">
                    <div className="grid grid-cols-2 gap-2">
                      {["Normal", "Urgente"].map((p) => (
                        <PillOption
                          key={p}
                          selected={priority === p}
                          onClick={() => setPriority(p)}
                        >
                          {p}
                        </PillOption>
                      ))}
                    </div>
                  </Field>
                </div>

                <Field
                  label="Tamaño de referencia (opcional)"
                  hint="Elige una referencia para ver un presupuesto rápido sin calcular peso ni horas. El tamaño real se revisa con el equipo."
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    {QUICK_SIZES.map((size) => (
                      <OptionCard
                        key={size.id}
                        title={size.label}
                        text={size.description}
                        selected={quickSize === size.id}
                        onClick={() => setQuickSize(size.id)}
                      />
                    ))}
                  </div>
                  {quickSize && (
                    <button
                      type="button"
                      className="mt-3 text-xs text-accent"
                      onClick={() => setQuickSize("")}
                    >
                      Prefiero que el equipo revise mi idea
                    </button>
                  )}
                </Field>
                <Field label="Color" hint="Si no importa, lo elegimos según disponibilidad.">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {COLORS.map((c) => (
                      <PillOption key={c} selected={color === c} onClick={() => setColor(c)}>
                        {c}
                      </PillOption>
                    ))}
                  </div>
                </Field>
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
                  <p className="font-semibold">¿No sabes el peso, las medidas o el material?</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Está bien. Puedes continuar y nosotros lo definimos al revisar tu idea.
                  </p>
                </div>
                <details className="rounded-2xl border border-border p-5">
                  <summary className="cursor-pointer text-sm font-semibold text-accent">
                    Ya conozco datos de impresión (opcional)
                  </summary>
                  <div className="mt-5 space-y-5">
                    <Field
                      label="Peso por pieza en gramos (opcional)"
                      hint="Solo si ya conoces el consumo de material. Si no, déjalo vacío."
                    >
                      <input
                        aria-label="Peso opcional por pieza en gramos"
                        type="number"
                        min="0.1"
                        max="50000"
                        step="0.1"
                        className={inputClass}
                        value={gramsInput}
                        placeholder="No lo sé"
                        onChange={(e) => setGramsInput(e.target.value)}
                      />
                    </Field>
                    <PrintCostControls
                      value={printSettings}
                      onChange={setPrintSettings}
                      material={effectiveMaterial}
                    />
                  </div>
                </details>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Para guardar y enviar a revisión, completa tus datos de contacto e inicia sesión.
                  Tu estimación no cambia al crear la cuenta.
                </p>
                <div className="grid gap-6 lg:grid-cols-2">
                  <Field label="Forma de entrega">
                    <div className="grid gap-3">
                      {["Retiro local", "Envío"].map((d) => (
                        <OptionCard
                          key={d}
                          title={d}
                          text={
                            d === "Envío"
                              ? "Coordinamos el envío a tu ciudad."
                              : "Recoge tu pieza en el punto acordado."
                          }
                          selected={delivery === d}
                          onClick={() => setDelivery(d)}
                        />
                      ))}
                    </div>
                  </Field>
                  <div className="grid gap-4">
                    <Field label="Nombre">
                      <input
                        aria-label="Nombre de contacto"
                        autoComplete="name"
                        maxLength={100}
                        className={inputClass}
                        value={client.name}
                        onChange={(e) => setClient({ ...client, name: e.target.value })}
                      />
                    </Field>
                    <Field label="Correo">
                      <input
                        aria-label="Correo de contacto"
                        autoComplete="email"
                        maxLength={254}
                        type="email"
                        className={inputClass}
                        value={client.email}
                        onChange={(e) => setClient({ ...client, email: e.target.value })}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Teléfono">
                        <input
                          aria-label="Teléfono de contacto"
                          autoComplete="tel"
                          type="tel"
                          maxLength={30}
                          className={inputClass}
                          value={client.phone}
                          onChange={(e) => setClient({ ...client, phone: e.target.value })}
                        />
                      </Field>
                      <Field label="Ciudad">
                        <input
                          aria-label="Ciudad de entrega"
                          autoComplete="address-level2"
                          maxLength={100}
                          className={inputClass}
                          value={client.city}
                          onChange={(e) => setClient({ ...client, city: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
                {member.isPending && (
                  <p role="status" className="text-sm text-muted-foreground">
                    Comprobando disponibilidad para enviar…
                  </p>
                )}
                {member.data?.configured === false && (
                  <p
                    role="status"
                    className="rounded-xl border border-border p-4 text-sm text-muted-foreground"
                  >
                    El envío de solicitudes y las cuentas no están disponibles ahora. Puedes volver
                    a tu estimación y continuar más tarde.
                  </p>
                )}
                {member.isError && (
                  <div role="status" className="text-sm text-muted-foreground">
                    <p>
                      No pudimos conectar con el servicio de solicitudes. Tu estimación sigue
                      disponible.
                    </p>
                    <Button variant="ghost" className="mt-3" onClick={() => member.refetch()}>
                      Reintentar conexión
                    </Button>
                  </div>
                )}
                {!member.data?.user && member.data?.configured === true && <AccountForm />}
                {submitError && (
                  <p role="alert" className="text-sm text-red-300">
                    {submitError}
                  </p>
                )}
                <Button
                  className="w-full"
                  disabled={
                    submitting ||
                    member.isPending ||
                    member.isError ||
                    member.data?.configured !== true ||
                    !member.data.user
                  }
                  onClick={submit}
                >
                  {submitting
                    ? "Guardando solicitud…"
                    : "Guardar y enviar a revisión con el equipo"}
                </Button>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-6">
                <div className="space-y-2 text-sm">
                  <p className="label-caps mb-3">Resumen de la solicitud</p>
                  {[
                    [
                      "Proyecto",
                      projectName || detail.slice(0, 40) || useCase || "Pieza por definir",
                    ],
                    ["Punto de partida", START_OPTIONS.find((o) => o.id === start)?.title ?? ""],
                    ["Uso previsto", useCase || "Por definir"],
                    ["La pieza debe", requirement],
                    [
                      "Archivo",
                      hasFileFlow
                        ? (file?.name ?? "Sin archivo")
                        : (refFile?.name ?? "Referencias por asesoría"),
                    ],
                    [
                      "Dimensiones",
                      hasFileFlow
                        ? dims.unsure || !dims.x
                          ? "Por confirmar con asesoría"
                          : `${dims.x} × ${dims.y} × ${dims.z} ${dims.unit}`
                        : "Por definir en asesoría",
                    ],
                    [
                      "Material",
                      material === "auto" ? "ProtoLab me recomienda" : effectiveMaterial,
                    ],
                    ["Color", color],
                    ["Cantidad", `${quantity} ${quantity === 1 ? "pieza" : "piezas"}`],
                    ["Prioridad", priority],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between gap-6 border-b border-border/60 py-2"
                    >
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-right text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
                <GlassCard className="h-max p-5">
                  <MaterialEstimate
                    material={effectiveMaterial}
                    grams={grams}
                    quantity={quantity}
                    needsDesign={needsDesign}
                    priceAvailable={Boolean(printing)}
                    settings={estimateSettings}
                    assumedWeight={quick?.assumedWeight ?? false}
                    assumedTime={quick?.assumedTime ?? false}
                    referenceMaterial={material === "auto"}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Revisaremos tu solicitud y confirmaremos el precio antes de fabricar.
                  </p>
                  <div className="mt-4 border-t border-border/60 pt-3 text-xs">
                    <p className="text-muted-foreground">Tiempo estimado</p>
                    <p className="mt-1 text-foreground">Por confirmar con el equipo</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Depende del tamaño, material, complejidad, cantidad y capacidad disponible.
                    </p>
                  </div>
                  <p className="mt-5 text-sm text-accent">
                    Puedes consultar esta estimación sin cuenta. Continúa solo si quieres enviarla
                    al equipo.
                  </p>
                </GlassCard>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="size-4" /> Atrás
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
                {step === 2
                  ? "Ver estimación sin cuenta"
                  : step === 3
                    ? "Continuar para guardar y enviar"
                    : "Continuar"}{" "}
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                Revisa tus datos antes de enviar.
              </span>
            )}
          </div>
        </GlassCard>

        <div className="min-w-0">
          <div className="lg:sticky lg:top-24">
            <PieceVisual
              compact={step < 4}
              step={step}
              material={effectiveMaterial}
              label={
                step === 4
                  ? "El equipo revisará tu proyecto antes de fabricar."
                  : "De tu idea a una pieza. Te acompañamos en cada paso."
              }
            />
            {step !== 3 && (
              <div className="mt-4">
                <MaterialEstimate
                  material={effectiveMaterial}
                  grams={grams}
                  quantity={quantity}
                  needsDesign={needsDesign}
                  priceAvailable={Boolean(printing)}
                  settings={estimateSettings}
                  assumedWeight={quick?.assumedWeight ?? false}
                  assumedTime={quick?.assumedTime ?? false}
                  referenceMaterial={material === "auto"}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function UploadRow({
  upload,
  onRemove,
  badge,
}: {
  upload: NonNullable<UploadState>;
  onRemove: () => void;
  badge: string;
}) {
  return (
    <div className="animate-step-in flex items-center gap-3 rounded-xl border border-border bg-white/5 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/20 text-[10px] font-bold text-accent">
        {badge}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{upload.name}</p>
        <p className="text-[11px] text-muted-foreground">{upload.size}</p>
      </div>
      {upload.status === "cargando" ? (
        <Loader2 className="size-4 animate-spin text-accent" />
      ) : (
        <StatusBadge label="Seleccionado" />
      )}
      <button
        type="button"
        aria-label="Quitar archivo"
        onClick={onRemove}
        className="text-muted-foreground transition hover:text-foreground"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
