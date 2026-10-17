import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCloud, ImagePlus, CheckCircle2, ArrowUpRight } from "lucide-react";
import { api, uploadFile, errorText, DESIGN_CATEGORIES, LICENSES } from "@/lib/community";
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
        title="Comparte una idea. Abre posibilidades."
        text="Tu archivo puede ser la pieza que alguien más necesita. Publica una creación original para desbloquear todas las descargas."
      />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <MemberGate>
          <PublishForm />
        </MemberGate>
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
        <h2 className="mt-5 text-2xl font-bold">Tu diseño ya está en revisión.</h2>
        <p className="mt-3 text-muted-foreground">
          El equipo revisará el archivo, su descripción y los derechos de uso. Verás el resultado en
          tus proyectos. La aprobación desbloqueará tus descargas.
        </p>
        <Link to="/panel" className="mt-6 inline-flex items-center gap-2 text-accent font-semibold">
          Ver mis publicaciones
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
                license: data.get("license"),
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
                  required
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
                  required
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
          <Field
            label="Licencia de tu diseño"
            hint="Todas estas opciones permiten compartir y fabricar, incluida la fabricación comercial."
          >
            <select aria-label="Licencia" name="license" className={inputClass}>
              {LICENSES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Field>
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input name="rights" type="checkbox" required className="mt-1 accent-teal-400" />
            Confirmo que soy autor o tengo los derechos necesarios para publicar, compartir y
            permitir la fabricación de este diseño bajo la licencia elegida.
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}
          <Button className="w-full py-4" disabled={busy}>
            {busy ? stage : "Enviar diseño a revisión"}
          </Button>
        </form>
      </GlassCard>
      <aside className="space-y-4">
        <GlassCard className="p-6">
          <p className="label-caps text-accent">Dar para crear</p>
          <h2 className="mt-3 text-xl font-bold">
            Una aportación,
            <br />
            toda la colección.
          </h2>
          <ol className="mt-5 space-y-4 text-sm text-muted-foreground">
            <li>01 · Sube tu archivo y una portada propia.</li>
            <li>02 · Revisamos contenido y derechos de uso.</li>
            <li>03 · Al aprobarse, el diseño se hace público y se habilitan tus descargas.</li>
          </ol>
        </GlassCard>
        <p className="px-2 text-xs leading-relaxed text-muted-foreground">
          No publiques archivos ajenos sin autorización. Tu archivo no será descargable por
          visitantes sin acceso; las imágenes y la descripción sí serán públicas al aprobarse.
        </p>
        <a
          href="https://creativecommons.org/share-your-work/cclicenses/"
          target="_blank"
          rel="noreferrer"
          className="block px-2 text-xs text-accent"
        >
          Consultar las licencias Creative Commons ↗
        </a>
      </aside>
    </div>
  );
}
