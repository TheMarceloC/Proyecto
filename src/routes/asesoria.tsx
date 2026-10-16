import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/sections";
import {
  Button,
  Field,
  GlassCard,
  OptionCard,
  inputClass,
} from "@/components/site/ui";
import { ActionLink } from "@/components/site/ui";

export const Route = createFileRoute("/asesoria")({
  head: () => ({
    meta: [
      { title: "Asesoría técnica — ProtoLab" },
      {
        name: "description",
        content:
          "No necesitas ser diseñador: cuéntanos tu idea, boceto o pieza física y te orientamos sobre materiales y fabricación.",
      },
      { property: "og:title", content: "Asesoría técnica — ProtoLab" },
      {
        property: "og:description",
        content: "Recibe orientación sobre materiales, resistencia y viabilidad de tu diseño.",
      },
    ],
  }),
  component: AsesoriaPage,
});

const OPTIONS = [
  { title: "Tengo una idea", text: "Describe qué necesitas y para qué la usarás." },
  { title: "Tengo un boceto", text: "Un dibujo con medidas aproximadas es suficiente." },
  { title: "Tengo una foto", text: "Una foto de la pieza o del espacio donde va." },
  { title: "Tengo una pieza física", text: "La medimos para reproducirla o mejorarla." },
  { title: "Quiero mejorar un diseño", text: "Revisamos espesores, tolerancias y ajustes." },
];


function AsesoriaPage() {
  const [option, setOption] = useState(OPTIONS[0]!.title);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", detail: "" });

  if (sent) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-20">
        <GlassCard className="animate-step-in p-10 text-center">
          <CheckCircle2 className="mx-auto size-10 text-accent" />
          <h1 className="mt-5 text-2xl font-bold text-foreground">Solicitud de asesoría enviada</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Te contactaremos para entender tu pieza y recomendarte materiales y parámetros.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ActionLink to="/cotizar">Cotizar mi pieza</ActionLink>
            <ActionLink to="/materiales" variant="ghost">
              Ver materiales
            </ActionLink>
          </div>
        </GlassCard>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Asesoría técnica"
        title="¿No tienes un archivo 3D?"
        text="No necesitas ser diseñador para utilizar ProtoLab."
      />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-3">
            {OPTIONS.map((o) => (
              <OptionCard
                key={o.title}
                title={o.title}
                text={o.text}
                selected={option === o.title}
                onClick={() => setOption(o.title)}
              />
            ))}
          </div>
          <GlassCard className="p-6">
            <div className="grid gap-4">
              <Field label="Nombre">
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Correo">
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Cuéntanos qué necesitas" hint={`Opción elegida: ${option}`}>
                <textarea
                  rows={5}
                  className={inputClass}
                  placeholder="Necesito una pieza que sostenga un sensor dentro de una caja…"
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                />
              </Field>
              <Field
                label="Adjunta una foto, boceto o archivo"
                hint="JPG, PNG, PDF o archivos CAD. Opcional."
              >
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.stl,.obj,.step,.stp,.dwg,.dxf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) toast.success("Archivo adjuntado", { description: f.name });
                  }}
                  className="w-full rounded-xl border border-input bg-white/5 px-4 py-3 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-accent/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent"
                />
              </Field>

              <Button
                onClick={() => {
                  setSent(true);
                  toast.success("Solicitud de asesoría enviada");
                }}
              >
                Solicitar asesoría
              </Button>
            </div>
          </GlassCard>
        </div>
      </section>
    </>
  );
}
