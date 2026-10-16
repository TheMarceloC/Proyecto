import { createFileRoute } from "@tanstack/react-router";
import heroPart from "@/assets/hero-part.jpg";
import { ActionLink, Chip, Dot, GlassCard, ProgressBar } from "@/components/site/ui";
import {
  AdviceSection,
  CtaSection,
  ExamplesPreviewSection,
  HomeStepsSection,
  MarketplaceSection,
  QuickStartSection,
} from "@/components/site/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProtoLab — Tu idea. Tu pieza. Fabricada." },
      {
        name: "description",
        content:
          "Sube tu diseño o cuéntanos qué necesitas. Recibe una cotización, asesoría técnica y fabrica tu pieza sin tener maquinaria propia.",
      },
      { property: "og:title", content: "ProtoLab — Tu idea. Tu pieza. Fabricada." },
      {
        property: "og:description",
        content:
          "Cotiza tu pieza, recibe orientación técnica y sigue tu fabricación en un solo lugar.",
      },
    ],
  }),
  component: Index,
});

const indicators = ["Cotización rápida", "Asesoría incluida", "Seguimiento de tu pieza"];

function Index() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-14 pb-16">
          <div className="pointer-events-none absolute -top-20 -right-40 size-[560px] rotate-12 rounded-[3rem] bg-gradient-to-br from-brand/25 to-accent/10 blur-3xl" />
          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Chip>Fabricación digital bajo demanda</Chip>
              <h1 className="mt-6 text-5xl leading-[1.02] font-bold text-foreground lg:text-6xl">
                Tu idea. Tu pieza. <span className="text-gradient">Fabricada.</span>
              </h1>
              <p className="mt-5 max-w-md text-lg text-muted-foreground">
                Sube tu diseño o cuéntanos qué necesitas. Recibe una cotización, asesoría técnica y
                fabrica tu pieza sin tener maquinaria propia.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ActionLink to="/cotizar" className="px-7 py-4 text-base">
                  Cotizar mi pieza
                </ActionLink>
                <ActionLink to="/asesoria" variant="ghost">
                  Necesito ayuda con mi diseño
                </ActionLink>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                {indicators.map((i) => (
                  <span key={i} className="flex items-center gap-2">
                    <Dot /> {i}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative h-[400px] sm:h-[440px]">
              <div className="absolute inset-0 grid place-items-center">
                <img
                  src={heroPart}
                  alt="Pieza mecánica impresa en 3D sobre una malla técnica"
                  width={1024}
                  height={1024}
                  className="w-[280px] rounded-3xl outline outline-offset-[-1px] outline-white/10 sm:w-[320px]"
                />
              </div>
              <GlassCard className="absolute top-2 left-0 w-56 -rotate-6 p-4 sm:w-64">
                <p className="label-caps">Ejemplo de cotización</p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">
                  L 480<span className="text-sm font-medium text-muted-foreground">.00</span>
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tiempo estimado</span>
                  <span className="font-semibold text-accent">según la pieza</span>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground/80">
                  Precio preliminar de demostración.
                </p>
              </GlassCard>
              <GlassCard className="absolute right-0 bottom-4 w-52 rotate-6 bg-gradient-to-br from-brand/25 to-accent/15 p-4 sm:w-60">
                <p className="label-caps text-foreground/70">Estado</p>
                <p className="mt-1 font-display font-semibold text-foreground">En fabricación</p>
                <div className="mt-3">
                  <ProgressBar value={68} />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">Pedido de demostración</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      <QuickStartSection />
      <HomeStepsSection />
      <AdviceSection />
      <ExamplesPreviewSection />
      <MarketplaceSection />
      <CtaSection />
    </>
  );
}
