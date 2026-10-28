import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, Download, ArrowUpRight, LogOut, FolderOpen } from "lucide-react";
import { AccountForm, useMember } from "@/components/community/Account";
import { GlassCard, Button } from "@/components/site/ui";
import { PageHeader } from "@/components/site/sections";
import { api, errorText } from "@/lib/community";
import { toast } from "sonner";
export const Route = createFileRoute("/cuenta")({
  head: () => ({ meta: [{ title: "Mi cuenta — ProtoLab" }] }),
  component: Cuenta,
});
function Cuenta() {
  const member = useMember();
  const qc = useQueryClient();
  const user = member.data?.user;
  return (
    <>
      <PageHeader
        eyebrow="Tu espacio"
        title={user ? "Hola, " + user.name.split(" ")[0] : "Todo empieza con una idea"}
        text="Compra diseños, propone tus creaciones para vender y encarga tus piezas."
      />
      <section className="mx-auto max-w-6xl px-6 py-12">
        {!user ? (
          <AccountForm />
        ) : (
          <div className="space-y-6">
            <GlassCard className="relative overflow-hidden p-8">
              <p className="label-caps text-accent">Tu catálogo de posibilidades</p>
              <h2 className="mt-3 text-2xl font-bold">Tus diseños comprados, en un solo lugar.</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Cada compra con pago verificado habilita su archivo. Publicar diseños es una opción
                para vender tus creaciones, independiente de tus compras.
              </p>
              <Link
                to="/panel"
                className="mt-6 inline-flex items-center gap-2 text-accent font-semibold"
              >
                Ver mis compras y proyectos
                <ArrowUpRight className="size-4" />
              </Link>
            </GlassCard>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  to: "/publicar",
                  title: "Vende un diseño",
                  text: "Propón tu creación y su precio para revisión.",
                  Icon: Upload,
                },
                {
                  to: "/disenos",
                  title: "Encuentra tu próxima pieza",
                  text: "Compra el archivo o cotiza su fabricación.",
                  Icon: Download,
                },
                {
                  to: "/panel",
                  title: "Tus proyectos",
                  text: "Publicaciones, cotizaciones y seguimiento.",
                  Icon: FolderOpen,
                },
              ].map((item) => (
                <Link key={item.to} to={item.to}>
                  <GlassCard className="h-full p-6 transition hover:border-accent/40">
                    <item.Icon className="text-accent size-6" />
                    <h3 className="mt-4 font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                  </GlassCard>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {user.isAdmin && (
                <Link to="/admin" className="text-sm font-semibold text-accent">
                  Administrar ProtoLab →
                </Link>
              )}
              <Button
                variant="ghost"
                onClick={async () => {
                  try {
                    await api("auth/logout", {});
                    qc.clear();
                    window.location.assign("/");
                  } catch (error) {
                    toast.error(errorText(error));
                  }
                }}
              >
                <LogOut className="size-4" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
