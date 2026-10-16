import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/sections";
import { Button, Field, GlassCard, inputClass } from "@/components/site/ui";
import { BRAND } from "@/lib/protolab";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — ProtoLab" },
      {
        name: "description",
        content: "Escríbenos por correo o WhatsApp para resolver dudas sobre tu pieza o proyecto.",
      },
      { property: "og:title", content: "Contacto — ProtoLab" },
      {
        property: "og:description",
        content: "Hablemos de tu pieza: correo y WhatsApp de ProtoLab en Honduras.",
      },
    ],
  }),
  component: ContactoPage,
});

function ContactoPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title="Hablemos de tu proyecto"
        text="Cuéntanos qué necesitas fabricar y te respondemos con opciones."
      />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <GlassCard className="flex items-center gap-4 p-5">
              <Mail className="size-5 text-accent" />
              <div>
                <p className="label-caps">Correo</p>
                <p className="text-sm text-foreground">{BRAND.email}</p>
              </div>
            </GlassCard>
            <GlassCard className="flex items-center gap-4 p-5">
              <MessageCircle className="size-5 text-accent" />
              <div>
                <p className="label-caps">WhatsApp</p>
                <p className="text-sm text-foreground">{BRAND.whatsapp}</p>
              </div>
            </GlassCard>
            <GlassCard className="flex items-center gap-4 p-5">
              <MapPin className="size-5 text-accent" />
              <div>
                <p className="label-caps">Ubicación</p>
                <p className="text-sm text-foreground">{BRAND.country} · entrega local y envíos</p>
              </div>
            </GlassCard>
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
              <Field label="Mensaje">
                <textarea
                  rows={5}
                  className={inputClass}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </Field>
              <Button
                onClick={() => {
                  toast.success("Mensaje enviado", {
                    description: "Te responderemos por correo.",
                  });
                  setForm({ name: "", email: "", message: "" });
                }}
              >
                Enviar mensaje
              </Button>
            </div>
          </GlassCard>
        </div>
      </section>
    </>
  );
}
