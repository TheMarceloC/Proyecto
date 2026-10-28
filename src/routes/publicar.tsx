import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCloud, ImagePlus, CheckCircle2, ArrowUpRight } from "lucide-react";
import { api, uploadFile, errorText, DESIGN_CATEGORIES } from "@/lib/community";
import { COMPLEXITIES, DESIGN_LICENSE, LICENSE_TERMS } from "@/lib/design-commerce";
import { CATALOG_DEMO_MODE } from "@/lib/demo-designs";
import { DemoNotice } from "@/components/community/DemoDesign";
import { MemberGate } from "@/components/community/Account";
import { Button, Field, GlassCard, inputClass } from "@/components/site/ui";
import { PageHeader } from "@/components/site/sections";
export const Route = createFileRoute("/publicar")({
  head: () => ({ meta: [{ title: "Publica tu diseño — ProtoLab" }] }),
  component: PublishPage,
});
function PublishPage() {
  return (
    <>
      <PageHeader
        eyebrow="Creado por ti"
        title="Tu diseño tiene valor."
        text="Propón una creación para vender. Revisamos el archivo, la complejidad, el precio y el acuerdo comercial antes de publicarla."
      />
      <section className="mx-auto max-w-6xl px-6 py-10">
        {CATALOG_DEMO_MODE ? (
          <>
            <DemoNotice />
            <PublishForm />
          </>
        ) : (
          <MemberGate>
            <PublishForm />
          </MemberGate>
        )}
      </section>
    </>
  );
}
function PublishForm() {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [stage, setStage] = useState("");
  if (sent)
    return (
      <GlassCard className="mx-auto max-w-xl p-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-accent" />
        <h2 className="mt-5 text-2xl font-bold">
          {CATALOG_DEMO_MODE ? "Así se verá tu propuesta." : "Tu diseño ya está en revisión."}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {CATALOG_DEMO_MODE
            ? "Vista de demostración: no se han subido archivos ni enviado una propuesta. En la versión operativa el equipo revisará el diseño, su precio y las condiciones comerciales."
            : "El equipo revisará el archivo, su descripción y los derechos de uso. Verás el resultado en tus proyectos. Su publicación no da acceso gratuito a otros diseños. El precio y las condiciones de venta se confirman con el equipo."}
        </p>
        <Link
          to={CATALOG_DEMO_MODE ? "/disenos" : "/panel"}
          className="mt-6 inline-flex items-center gap-2 text-accent font-semibold"
        >
          {CATALOG_DEMO_MODE ? "Volver al catálogo" : "Ver mis publicaciones"}
          <ArrowUpRight className="size-4" />
        </Link>
      </GlassCard>
    );
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
      <GlassCard className="p-6 sm:p-8">
        <form
          className="space-y-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            if (CATALOG_DEMO_MODE) {
              setSent(true);
              return;
            }
            if (!file || !image) {
              setError("Selecciona un archivo 3D y una imagen de portada.");
              return;
            }
            setBusy(true);
            setError("");
            try {
              setStage("Guardando archivo 3D…");
              const file_path = await uploadFile(file, "design");
              setStage("Guardando portada…");
              const image_path = await uploadFile(image, "preview");
              setStage("Enviando a revisión…");
              await api("designs", {
                title: data.get("title"),
                description: data.get("description"),
                category: data.get("category"),
                material: data.get("material"),
                license: DESIGN_LICENSE,
                complexity: data.get("complexity"),
                complexity_notes: data.get("complexity_notes"),
                proposed_price: Number(data.get("proposed_price")),
                commercial_consent: data.get("commercial_consent") === "on",
                sales_agreement: data.get("sales_agreement"),
                file_path,
                image_path,
                rights: data.get("rights") === "on",
              });
              setSent(true);
            } catch (error) {
              setError(errorText(error));
            } finally {
              setBusy(false);
              setStage("");
            }
          }}
        >
          <Field label="Nombre del diseño">
            <input
              aria-label="Nombre del diseño"
              name="title"
              required
              maxLength={100}
              className={inputClass}
              placeholder="Un nombre claro para tu creación"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Archivo 3D" hint="STL, OBJ, 3MF, STEP o STP · hasta 50 MB">
              <label className="grid cursor-pointer place-items-center rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-6 text-center">
                <UploadCloud className="size-7 text-accent" />
                <span className="mt-3 text-sm">{file?.name || "Seleccionar modelo"}</span>
                <input
                  aria-label="Archivo 3D"
                  type="file"
                  accept=".stl,.obj,.3mf,.step,.stp"
                  required={!CATALOG_DEMO_MODE}
                  className="mt-3 w-full text-xs text-muted-foreground"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </label>
            </Field>
            <Field label="Portada" hint="JPG, PNG o WEBP · hasta 5 MB">
              <label className="grid cursor-pointer place-items-center rounded-2xl border border-dashed border-border bg-white/5 p-6 text-center">
                <ImagePlus className="size-7 text-accent" />
                <span className="mt-3 text-sm">{image?.name || "Seleccionar imagen"}</span>
                <input
                  aria-label="Portada"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required={!CATALOG_DEMO_MODE}
                  className="mt-3 w-full text-xs text-muted-foreground"
                  onChange={(event) => setImage(event.target.files?.[0] || null)}
                />
              </label>
            </Field>
          </div>
          <Field
            label="Descripción e instrucciones"
            hint="Incluye uso, medidas, orientación, soportes y parámetros que hayas comprobado. Mínimo 40 caracteres."
          >
            <textarea
              aria-label="Descripción e instrucciones"
              name="description"
              required
              minLength={40}
              maxLength={4000}
              rows={6}
              className={inputClass}
              placeholder="Qué resuelve tu diseño y cómo recomiendas fabricarlo…"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoría">
              <select aria-label="Categoría" name="category" className={inputClass}>
                {DESIGN_CATEGORIES.filter((c) => c !== "Todos").map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Material sugerido">
              <select aria-label="Material sugerido" name="material" className={inputClass}>
                {["PLA", "PETG", "ABS", "TPU"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Complejidad propuesta">
              <select aria-label="Complejidad propuesta" name="complexity" className={inputClass}>
                {Object.entries(COMPLEXITIES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Precio propuesto del archivo (L)"
              hint="Importe entero por diseño. El equipo lo revisará contigo."
            >
              <input
                aria-label="Precio propuesto del archivo (L)"
                name="proposed_price"
                type="number"
                required
                min="1"
                max="1000000"
                step="1"
                className={inputClass}
              />
            </Field>
          </div>
          <Field
            label="Trabajo de desarrollo"
            hint="Describe modelado, componentes, ensambles, ajustes y documentación. Mínimo 20 caracteres."
          >
            <textarea
              aria-label="Trabajo de desarrollo"
              name="complexity_notes"
              required
              minLength={20}
              maxLength={2000}
              rows={3}
              className={inputClass}
            />
          </Field>
          <div className="rounded-xl border border-border p-4 text-sm">
            <p className="font-bold">Licencia para el comprador: {DESIGN_LICENSE}</p>
            <p className="mt-2 text-muted-foreground">{LICENSE_TERMS}</p>
          </div>
          <Field
            label="Condiciones comerciales propuestas a ProtoLab"
            hint="Indica tu autorización para vender el archivo y fabricar piezas, y la compensación o condiciones que propones. No se publica hasta acordarlas con el equipo."
          >
            <textarea
              aria-label="Condiciones comerciales propuestas a ProtoLab"
              name="sales_agreement"
              required
              minLength={20}
              maxLength={2000}
              rows={4}
              className={inputClass}
            />
          </Field>
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input name="rights" type="checkbox" required className="mt-1 accent-teal-400" />
            Confirmo que soy autor o tengo los derechos necesarios para ofrecer este archivo y las
            imágenes para su comercialización.
          </label>
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input
              name="commercial_consent"
              type="checkbox"
              required
              className="mt-1 accent-teal-400"
            />
            Autorizo la evaluación de mi propuesta comercial. La venta de archivos y la fabricación
            requieren que ProtoLab y yo confirmemos las condiciones indicadas; este envío no acuerda
            una comisión ni un pago al creador.
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}
          <Button className="w-full py-4" disabled={busy}>
            {busy
              ? stage
              : CATALOG_DEMO_MODE
                ? "Previsualizar envío · demo"
                : "Enviar diseño a revisión"}
          </Button>
        </form>
      </GlassCard>
      <aside className="space-y-4">
        <GlassCard className="p-6">
          <p className="label-caps text-accent">Crea para vender</p>
          <h2 className="mt-3 text-xl font-bold">
            Cada diseño,
            <br />
            su propio valor.
          </h2>
          <ol className="mt-5 space-y-4 text-sm text-muted-foreground">
            <li>01 · Sube tu archivo y una portada propia.</li>
            <li>02 · Propón complejidad, precio y condiciones de venta.</li>
            <li>
              03 · El equipo revisa el archivo y acuerda las condiciones contigo antes de
              publicarlo.
            </li>
            <li>
              04 · Cada comprador accede al archivo que pagó. Publicar no habilita otras descargas.
            </li>
          </ol>
        </GlassCard>
        <p className="px-2 text-xs leading-relaxed text-muted-foreground">
          No publiques archivos ajenos sin autorización. Tu archivo no será descargable por
          visitantes sin acceso; las imágenes y la descripción sí serán públicas al aprobarse.
        </p>
      </aside>
    </div>
  );
}
