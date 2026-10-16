import { Link } from "@tanstack/react-router";
import {
  Boxes,
  PenTool,
  Layers,
  Lightbulb,
  Factory,
  Sparkles,
  GraduationCap,
  Wrench,
  Rocket,
  Building2,
  ArrowRight,
  FileBox,
  Pencil,
  Package,
  Send,
  Calculator,
} from "lucide-react";
import soporte from "@/assets/proj-soporte-sensor.jpg";
import carcasa from "@/assets/proj-carcasa.jpg";
import engranaje from "@/assets/proj-engranaje.jpg";
import {
  AUDIENCES,
  HOME_STEPS,
  MARKETPLACE_CATEGORIES,
  MATERIALS,
  PROCESS_STEPS,
  SERVICES,
  START_OPTIONS,
} from "@/lib/protolab";
import { ActionLink, GlassCard, ProgressBar, SectionHeading } from "./ui";

const serviceIcons = [Boxes, PenTool, Layers, Lightbulb, Factory, Sparkles];
const audienceIcons = [GraduationCap, Wrench, Rocket, Building2];
const startIcons = [FileBox, Pencil, Package, Lightbulb];
const homeStepIcons = [Send, Calculator, Factory];

/** Home — sección 2: arranque rápido de la cotización. */
export function QuickStartSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <GlassCard className="p-7 lg:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-caps text-accent">Cotización rápida</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              ¿Qué necesitas fabricar?
            </h2>
          </div>
          <ActionLink to="/cotizar">Empezar cotización</ActionLink>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {START_OPTIONS.map((o, i) => {
            const Icon = startIcons[i] ?? FileBox;
            return (
              <Link
                key={o.id}
                to="/cotizar"
                search={{ inicio: o.id }}
                className="rounded-xl border border-border bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/10"
              >
                <Icon className="size-5 text-accent" />
                <p className="mt-3 text-sm font-semibold text-foreground">{o.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{o.text}</p>
              </Link>
            );
          })}
        </div>
      </GlassCard>
    </section>
  );
}

/** Home — sección 3: cómo funciona en 3 pasos. */
export function HomeStepsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <SectionHeading eyebrow="Muy fácil" title="Cómo funciona" />
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {HOME_STEPS.map((s, i) => {
          const Icon = homeStepIcons[i] ?? Send;
          return (
            <GlassCard key={s.n} className="p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-brand/15 text-accent">
                  <Icon className="size-5" />
                </span>
                <span className="label-caps">{s.n}</span>
              </div>
              <p className="mt-4 text-lg font-semibold text-foreground">{s.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </GlassCard>
          );
        })}
      </div>
      <div className="mt-6">
        <ActionLink to="/como-funciona" variant="ghost">
          Ver el proceso completo <ArrowRight className="size-4" />
        </ActionLink>
      </div>
    </section>
  );
}

/** Home — sección 5: 4 ejemplos visuales. */
const HOME_EXAMPLES = [
  { img: carcasa, title: "Carcasa electrónica" },
  { img: soporte, title: "Soporte para sensor" },
  { img: engranaje, title: "Engranaje" },
  { img: carcasa, title: "Prototipo de producto" },
];

export function ExamplesPreviewSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <SectionHeading
        eyebrow="Ejemplos"
        title="¿Qué puedes fabricar?"
        text="Desde una sola pieza hasta un prototipo funcional."
      />
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_EXAMPLES.map((e) => (
          <GlassCard key={e.title} className="overflow-hidden transition hover:-translate-y-0.5">
            <img
              src={e.img}
              alt={e.title}
              loading="lazy"
              width={768}
              height={576}
              className="h-40 w-full object-cover"
            />
            <p className="p-4 text-sm font-semibold text-foreground">{e.title}</p>
          </GlassCard>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <ActionLink to="/ejemplos" variant="ghost">
          Ver más ejemplos
        </ActionLink>
        <ActionLink to="/cotizar">Cotizar mi pieza</ActionLink>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Ejemplos de aplicaciones. No representan clientes reales.
      </p>
    </section>
  );
}

/** Home — sección 6: capacidades actuales y futuras. */
export function MarketplaceSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <SectionHeading
        eyebrow="Capacidades"
        title="Encuentra la forma correcta de fabricar tu proyecto"
        text="Hoy fabricamos con impresión 3D y diseño 3D. Otras tecnologías están en evaluación."
      />
      <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MARKETPLACE_CATEGORIES.map((c) => (
          <GlassCard
            key={c.title}
            className={`p-5 ${c.soon ? "border-dashed opacity-70" : "hover:border-accent/30"} transition`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{c.title}</p>
              {c.soon ? <span className="label-caps text-accent">Próximamente</span> : null}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{c.text}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

export function ProcessSection({ eyebrow = "Proceso" }: { eyebrow?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeading
        eyebrow={eyebrow}
        title="Cómo funciona"
        text="Cinco pasos, un solo lugar. De la idea al prototipo."
      />
      <div className="relative mt-12">
        <div className="absolute top-4 right-0 left-0 hidden h-px bg-border md:block" />
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
          {PROCESS_STEPS.map((s) => (
            <div key={s.n} className="relative">
              <span className="relative z-10 grid size-8 place-items-center rounded-full border border-accent/50 bg-panel text-xs font-bold text-accent">
                {s.n}
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeading
        eyebrow="Servicios"
        title="Fabricamos lo que necesitas, cuando lo necesitas"
        text="Impresión 3D hoy; más tecnologías de manufactura digital en camino."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s, i) => {
          const Icon = serviceIcons[i] ?? Boxes;
          return (
            <GlassCard
              key={s.title}
              className={`p-6 transition hover:-translate-y-0.5 hover:border-accent/30 ${s.soon ? "border-dashed" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-brand/15 text-accent">
                  <Icon className="size-5" />
                </span>
                {s.soon ? <span className="label-caps text-accent">Próximamente</span> : null}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

export function AudienceSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeading eyebrow="Para quién es" title="Una pieza también puede ser un proyecto" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map((a, i) => {
          const Icon = audienceIcons[i] ?? GraduationCap;
          return (
            <GlassCard key={a.title} className="p-6 transition hover:border-accent/30">
              <Icon className="size-5 text-accent" />
              <h3 className="mt-4 text-base font-semibold text-foreground">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.text}</p>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

export function MaterialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeading
        eyebrow="Materiales"
        title="¿No sabes qué material elegir? Nosotros te orientamos"
        text="El mejor material depende de tu proyecto. Esta guía rápida te ayuda a ubicarte."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MATERIALS.map((m) => (
          <GlassCard key={m.code} className="p-6 transition hover:border-accent/30">
            <span className="font-display text-xl font-bold text-foreground">{m.code}</span>
            <p className="mt-3 text-xs text-muted-foreground">Ideal para:</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{m.ideal}</p>
            <div className="mt-5">
              <ProgressBar value={m.strength} />
              <p className="mt-2 text-[11px] text-muted-foreground">{m.spec}</p>
            </div>
          </GlassCard>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ActionLink to="/asesoria" variant="ghost">
          No sé cuál elegir <ArrowRight className="size-4" />
        </ActionLink>
        <ActionLink to="/cotizar">Cotizar mi pieza</ActionLink>
      </div>
    </section>
  );
}

export function AdviceSection() {
  const options = [
    { title: "Tengo una idea", text: "Cuéntanos qué necesitas y lo traducimos a un modelo." },
    { title: "Tengo un boceto o una foto", text: "Con un dibujo y medidas podemos empezar." },
    { title: "Tengo una pieza física", text: "La medimos y la reproducimos o mejoramos." },
    { title: "Quiero mejorar un diseño", text: "Revisamos espesores, tolerancias y ajustes." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <GlassCard className="p-8 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Asesoría"
              title="No necesitas saber de impresión 3D"
              text="Cuéntanos qué necesitas y te ayudamos a definir cómo fabricarlo. Envíanos una foto, boceto, pieza de referencia o solo tu idea."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <ActionLink to="/asesoria">Solicitar asesoría</ActionLink>
              <ActionLink to="/cotizar" variant="ghost">
                Cotizar mi pieza
              </ActionLink>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((o) => (
              <div
                key={o.title}
                className="rounded-xl border border-border bg-white/5 p-4 transition hover:bg-white/10"
              >
                <p className="text-sm font-semibold text-foreground">{o.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <GlassCard className="relative overflow-hidden p-10 text-center lg:p-16">
        <div className="pointer-events-none absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand/25 to-accent/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            ¿Tienes una pieza <span className="text-gradient">en mente?</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Descubre cuánto podría costar fabricarla.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ActionLink to="/cotizar">Cotizar mi pieza</ActionLink>
            <ActionLink to="/asesoria" variant="ghost">
              Necesito asesoría
            </ActionLink>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((f) => (
        <GlassCard key={f.q} className="p-6">
          <p className="text-sm font-semibold text-foreground">{f.q}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
        </GlassCard>
      ))}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  text,
  cta,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  cta?: { to: string; label: string };
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 pb-4">
      <SectionHeading eyebrow={eyebrow} title={title} text={text} />
      {cta ? (
        <div className="mt-6">
          <Link
            to={cta.to}
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            {cta.label} <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
