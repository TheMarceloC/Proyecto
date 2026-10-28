import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, ShoppingBag, Boxes, Compass, Check } from "lucide-react";
import { ActionLink, Chip, GlassCard } from "@/components/site/ui";
import {
  AdviceSection,
  CtaSection,
  ExamplesPreviewSection,
  HomeStepsSection,
  MaterialsSection,
  QuickStartSection,
} from "@/components/site/sections";
import { PieceVisual } from "@/components/site/PieceVisual";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProtoLab — Tu idea. Tu pieza. Fabricada." },
      {
        name: "description",
        content:
          "Compra diseños 3D o cotiza piezas personalizadas para ingeniería, talleres y negocios.",
      },
    ],
  }),
  component: Home,
});
function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-20 size-[580px] rounded-full bg-brand/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div>
            <Chip>El punto de encuentro entre ideas y piezas</Chip>
            <h1 className="mt-7 text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Tu idea.
              <br />
              Tu pieza.
              <br />
              <span className="text-gradient">Fabricada.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Compra un diseño para tu impresora o encarga una pieza a tu medida. Acompañamos a
              técnicos, ingenieros y talleres desde la idea hasta la fabricación.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionLink to="/disenos" className="px-6 py-4 text-base">
                Explorar diseños
                <Compass className="size-5" />
              </ActionLink>
              <ActionLink to="/cotizar" variant="ghost" className="px-6 py-4 text-base">
                Fabricar mi pieza
                <ArrowUpRight className="size-5" />
              </ActionLink>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted-foreground">
              {["Desde una pieza", "Con o sin archivo 3D", "Revisión antes de fabricar"].map(
                (s) => (
                  <span key={s} className="flex items-center gap-2">
                    <Check className="size-3.5 text-accent" />
                    {s}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:ml-4">
            <div className="absolute -inset-5 -rotate-3 rounded-[3rem] border border-brand/20 bg-brand/5" />
            <div className="relative rounded-[2rem] border border-border bg-background/50 p-4 sm:p-7">
              <div className="mb-4 flex items-center justify-between">
                <p className="label-caps">IDEAS QUE TOMAN FORMA</p>
                <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] text-accent">
                  Impresión 3D FDM
                </span>
              </div>
              <PieceVisual
                step={4}
                material="PLA"
                label="Del diseño digital a tu siguiente proyecto."
              />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                {["01 / Diseña", "02 / Elige", "03 / Fabrica"].map((t) => (
                  <span key={t} className="rounded-lg border border-border px-1 py-3">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-12 md:grid-cols-2">
        {[
          {
            Icon: Boxes,
            title: "¿No tienes impresora?",
            text: "Elige un diseño o envía el tuyo. Revisamos la pieza y te cotizamos la fabricación.",
            link: "/cotizar",
            cta: "Quiero mi pieza fabricada",
          },
          {
            Icon: ShoppingBag,
            title: "¿Ya tienes una?",
            text: "Compra el archivo que necesitas. Cada diseño tiene un precio según su complejidad y trabajo de desarrollo.",
            link: "/disenos",
            cta: "Encontrar un diseño para comprar",
          },
        ].map((card) => (
          <Link key={card.title} to={card.link}>
            <GlassCard className="group h-full p-7 transition hover:border-accent/30">
              <card.Icon className="size-7 text-accent" />
              <h2 className="mt-4 text-2xl font-bold">{card.title}</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {card.text}
              </p>
              <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-accent">
                {card.cta}
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </GlassCard>
          </Link>
        ))}
      </section>
      <ExamplesPreviewSection />
      <QuickStartSection />
      <HomeStepsSection />
      <MaterialsSection />
      <AdviceSection />
      <CtaSection />
    </>
  );
}
