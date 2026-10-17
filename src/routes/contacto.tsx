import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, MessagesSquare, MapPin } from "lucide-react";
import { PageHeader } from "@/components/site/sections";
import { GlassCard } from "@/components/site/ui";
import { MessageForm } from "@/components/community/MessageForm";
export const Route = createFileRoute("/contacto")({
  head: () => ({ meta: [{ title: "Hablemos de tu proyecto — ProtoLab" }] }),
  component: Contact,
});
function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Hagamos algo"
        title="Las buenas piezas empiezan conversando."
        text="Cuéntanos qué estás creando. Revisaremos tu solicitud y buscaremos cómo ayudarte."
      />
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-2">
        <div className="space-y-5">
          <GlassCard className="p-7">
            <MessagesSquare className="size-7 text-accent" />
            <h2 className="mt-4 text-xl font-bold">Un espacio para tu proyecto</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Escribe desde tu cuenta para que podamos relacionar tu consulta con tus diseños y
              solicitudes.
            </p>
          </GlassCard>
          <GlassCard className="p-7">
            <MapPin className="size-6 text-accent" />
            <p className="mt-3 font-semibold">Honduras</p>
            <p className="mt-2 text-sm text-muted-foreground">
              La entrega y el envío se coordinan al revisar tu proyecto.
            </p>
          </GlassCard>
          <Link to="/cotizar" className="inline-flex gap-2 font-semibold text-accent">
            ¿Ya tienes la pieza en mente? Cotízala
            <ArrowUpRight className="size-5" />
          </Link>
        </div>
        <GlassCard className="p-6 sm:p-8">
          <MessageForm kind="contact" />
        </GlassCard>
      </section>
    </>
  );
}
