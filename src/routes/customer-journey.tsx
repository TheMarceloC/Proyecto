import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Map, UserRound, Target, Lightbulb, MessageCircle, Printer, FileBox } from "lucide-react";
import { CUSTOMER_JOURNEYS } from "@/lib/customer-journey";
import { CATALOG_DEMO_MODE } from "@/lib/demo-designs";
import { GlassCard, btnStyles } from "@/components/site/ui";

export const Route = createFileRoute("/customer-journey")({
  head: () => ({
    meta: [
      { title: "Customer Journey Map — ProtoLab" },
      {
        name: "description",
        content:
          "Explora el recorrido del cliente de ProtoLab: desde descubrir un diseño o solicitar una pieza hasta recibirla y volver a crear.",
      },
    ],
  }),
  component: CustomerJourneyPage,
});

function CustomerJourneyPage() {
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const journey = CUSTOMER_JOURNEYS[journeyIndex]!;
  const stage = journey.stages[stageIndex]!;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
          <Map aria-hidden="true" className="size-5" /> La experiencia ProtoLab
        </p>
        <h1 className="mt-5 text-4xl font-bold sm:text-6xl">Customer Journey Map</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          De una necesidad a una solución. Explora qué busca, qué siente y qué necesita el cliente
          en cada momento de su recorrido.
        </p>
      </div>

      <div role="group" aria-label="Tipo de recorrido" className="mt-9 flex flex-wrap gap-3">
        {CUSTOMER_JOURNEYS.map((item, index) => {
          const Icon = index === 0 ? Printer : FileBox;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={journeyIndex === index}
              onClick={() => {
                setJourneyIndex(index);
                setStageIndex(0);
              }}
              className={`inline-flex items-center gap-3 rounded-xl border px-5 py-3 text-base font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${journeyIndex === index ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:bg-white/5"}`}
            >
              <Icon aria-hidden="true" className="size-5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {journey.id === "archivo" && CATALOG_DEMO_MODE && (
        <p
          role="note"
          className="mt-6 rounded-xl border border-brand/30 bg-brand/10 p-4 text-base text-muted-foreground"
        >
          <strong className="text-foreground">Recorrido previsto de compra.</strong> El catálogo
          actual está en modo demostración: no procesa compras ni descargas. Este mapa describe la
          experiencia prevista al activar la venta de archivos.
        </p>
      )}

      <div className="mt-8 grid gap-6 rounded-2xl border border-border bg-brand/10 p-6 md:grid-cols-2 sm:p-8">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-accent">
            <UserRound aria-hidden="true" className="size-4" /> Perfil y contexto
          </h2>
          <p className="mt-3 text-xl font-bold">{journey.persona}</p>
          <p className="mt-3 leading-relaxed text-muted-foreground">{journey.scenario}</p>
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-accent">
            <Target aria-hidden="true" className="size-4" /> Resultado que busca
          </h2>
          <p className="mt-3 text-xl font-bold">{journey.outcome}</p>
          <p className="mt-3 leading-relaxed text-muted-foreground">{journey.note}</p>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-bold sm:text-3xl">Explora cada etapa</h2>
        <p className="text-sm text-muted-foreground">Selecciona un momento del recorrido.</p>
      </div>
      <div
        role="group"
        aria-label="Etapas del recorrido"
        className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-6"
      >
        {journey.stages.map((item, index) => (
          <button
            key={`${journey.id}-${item.name}`}
            type="button"
            aria-pressed={stageIndex === index}
            aria-controls="journey-stage-detail"
            onClick={() => setStageIndex(index)}
            className={`rounded-xl border-t-4 p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${stageIndex === index ? "border-accent bg-accent/10 text-foreground" : "border-border bg-white/5 text-muted-foreground hover:bg-white/10"}`}
          >
            <span className="block text-base font-semibold">{item.name}</span>
            <span className="mt-2 block text-sm">{item.emotion}</span>
          </button>
        ))}
      </div>

      <div id="journey-stage-detail" aria-live="polite" aria-atomic="true" className="mt-6">
        <GlassCard className="overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_1.6fr]">
            <div className="border-b border-border bg-accent/5 p-6 sm:p-8 lg:border-r lg:border-b-0">
              <p className="text-sm font-semibold text-accent">
                {journey.label} · Etapa {stageIndex + 1} de {journey.stages.length}
              </p>
              <h3 className="mt-4 text-3xl font-bold">{stage.name}</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">{stage.goal}</p>
              <blockquote className="mt-7 border-l-2 border-accent pl-4 text-xl leading-relaxed">
                “{stage.thought}”
              </blockquote>
              <p className="mt-4 text-base text-accent">
                Emoción prevista: {stage.emotion.toLowerCase()}
              </p>
              <Link to={stage.to} className={`${btnStyles.primary} mt-8`}>
                {stage.cta}
              </Link>
            </div>
            <dl className="grid gap-7 p-6 sm:grid-cols-2 sm:p-8">
              <div>
                <dt className="font-semibold">Qué hace</dt>
                <dd className="mt-2 leading-relaxed text-muted-foreground">{stage.action}</dd>
              </div>
              <div>
                <dt className="font-semibold">Puntos de contacto</dt>
                <dd className="mt-2 leading-relaxed text-muted-foreground">{stage.touchpoint}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 font-semibold">
                  <MessageCircle aria-hidden="true" className="size-5 text-accent" /> Duda o
                  fricción
                </dt>
                <dd className="mt-2 leading-relaxed text-muted-foreground">{stage.friction}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 font-semibold">
                  <Lightbulb aria-hidden="true" className="size-5 text-accent" /> Oportunidad de
                  mejora
                </dt>
                <dd className="mt-2 leading-relaxed text-muted-foreground">{stage.opportunity}</dd>
              </div>
            </dl>
          </div>
        </GlassCard>
      </div>

      <details className="mt-8 rounded-2xl border border-border bg-white/5 p-5 sm:p-6">
        <summary className="cursor-pointer text-lg font-semibold focus-visible:outline-2 focus-visible:outline-accent">
          Ver el mapa completo de este recorrido
        </summary>
        <p id="journey-scroll-hint" className="mt-3 text-sm text-muted-foreground">
          Desplaza la tabla horizontalmente para comparar todas las etapas.
        </p>
        <div
          role="region"
          aria-label="Mapa completo del recorrido"
          aria-describedby="journey-scroll-hint"
          tabIndex={0}
          className="mt-5 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-accent"
        >
          <table className="w-full min-w-[1500px] border-collapse text-left text-base">
            <caption className="sr-only">
              Customer Journey Map: {journey.label}. Emociones y oportunidades propuestas para
              validar.
            </caption>
            <thead>
              <tr>
                <th scope="col" className="w-44 border-b border-border p-4">
                  Dimensión
                </th>
                {journey.stages.map((item) => (
                  <th
                    key={item.name}
                    scope="col"
                    className="w-56 border-b border-border p-4 text-accent"
                  >
                    {item.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Objetivo", "goal"],
                  ["Acciones", "action"],
                  ["Puntos de contacto", "touchpoint"],
                  ["Pensamiento", "thought"],
                  ["Emoción prevista", "emotion"],
                  ["Fricción", "friction"],
                  ["Oportunidad", "opportunity"],
                ] as const
              ).map(([label, key]) => (
                <tr key={key} className="border-b border-border last:border-0">
                  <th scope="row" className="p-4 align-top font-semibold">
                    {label}
                  </th>
                  {journey.stages.map((item) => (
                    <td
                      key={item.name}
                      className="p-4 align-top leading-relaxed text-muted-foreground"
                    >
                      {item[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="mt-6 max-w-4xl text-sm leading-relaxed text-muted-foreground">
        Mapa propuesto a partir de los flujos del sitio. Los perfiles, pensamientos, emociones y
        fricciones son hipótesis para validar con entrevistas y observación de clientes; las
        oportunidades describen mejoras posibles. Este mapa no muestra el estado de un pedido.
      </p>
    </section>
  );
}
