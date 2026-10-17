import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/site/sections";
import { GlassCard, OptionCard } from "@/components/site/ui";
import { MessageForm } from "@/components/community/MessageForm";
export const Route = createFileRoute("/asesoria")({
  head: () => ({ meta: [{ title: "Asesoría de diseño — ProtoLab" }] }),
  component: Advice,
});
const options = [
  { title: "Tengo una idea", text: "Cuéntanos qué necesitas y qué problema resuelve." },
  { title: "Tengo un boceto o una foto", text: "Comparte medidas, referencias y lo que buscas." },
  { title: "Tengo una pieza física", text: "Revisamos cómo reproducirla o mejorarla." },
  { title: "Quiero mejorar un diseño", text: "Hablemos de ajustes, dimensiones y fabricación." },
];
function Advice() {
  const [selected, setSelected] = useState(options[0]!.title);
  return (
    <>
      <PageHeader
        eyebrow="Diseñemos juntos"
        title="No necesitas tener todo resuelto."
        text="Una idea, una referencia o una pieza física pueden ser el comienzo. Nosotros te ayudamos a definir el siguiente paso."
      />
      <section className="mx-auto grid max-w-6xl items-start gap-8 px-6 py-12 lg:grid-cols-2">
        <div className="space-y-3">
          {options.map((o) => (
            <OptionCard
              key={o.title}
              title={o.title}
              text={o.text}
              selected={selected === o.title}
              onClick={() => setSelected(o.title)}
            />
          ))}
        </div>
        <GlassCard className="p-6 sm:p-8">
          <MessageForm kind="advice" context={selected} />
        </GlassCard>
      </section>
    </>
  );
}
