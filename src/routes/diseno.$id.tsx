import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, ArrowLeft, Boxes, ShieldCheck, LockKeyhole, Box } from "lucide-react";
import { api, errorText, type Design } from "@/lib/community";
import { useMember } from "@/components/community/Account";
import { Button, GlassCard } from "@/components/site/ui";
import { toast } from "sonner";
export const Route = createFileRoute("/diseno/$id")({
  head: () => ({ meta: [{ title: "Diseño de la comunidad — ProtoLab" }] }),
  component: DesignDetail,
});
function DesignDetail() {
  const { id } = Route.useParams();
  const session = useMember();
  const [busy, setBusy] = useState(false);
  const design = useQuery({
    queryKey: ["design", id],
    queryFn: () => api<Design>("designs/" + id),
    retry: false,
  });
  const item = design.data;
  if (!item)
    return (
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p role="status">{design.isPending ? "Cargando diseño…" : "No encontramos este diseño."}</p>
        <Link to="/disenos" className="mt-6 inline-block text-accent">
          Volver a diseños
        </Link>
      </section>
    );
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <Link to="/disenos" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" />
        Todos los diseños
      </Link>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="aspect-square w-full rounded-3xl border border-border object-cover"
            />
          ) : (
            <div className="grid aspect-square place-items-center rounded-3xl border border-border bg-brand/10">
              <Box className="size-36 text-accent" />
            </div>
          )}
        </div>
        <div>
          <p className="label-caps text-accent">
            {item.category} · {item.material}
          </p>
          <h1 className="mt-4 text-4xl font-bold">{item.title}</h1>
          <p className="mt-3 text-muted-foreground">
            Diseñado por <span className="text-foreground">{item.author_name}</span>
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-xs text-accent">
            <ShieldCheck className="size-4" />
            {
              {
                approved: "Publicación revisada",
                pending: "En revisión",
                rejected: "Requiere cambios",
              }[item.status]
            }
          </div>
          <p className="mt-6 whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {item.description}
          </p>
          <GlassCard className="mt-8 p-5">
            <h2 className="font-bold">De la pantalla a tus manos.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Elige material, cantidad y entrega. Revisaremos el archivo y te enviaremos una
              cotización para fabricarlo.
            </p>
            <Link
              to="/cotizar"
              search={{ diseno: item.id }}
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 font-bold text-accent-foreground"
            >
              <Boxes className="size-5" />
              Fabricar con ProtoLab
            </Link>
          </GlassCard>
          <div className="mt-5">
            <Button
              variant="ghost"
              className="w-full py-4"
              disabled={busy}
              onClick={async () => {
                if (!session.data?.user) {
                  window.location.assign("/cuenta");
                  return;
                }
                setBusy(true);
                try {
                  const data = await api<{ url: string }>("download", { id });
                  window.location.assign(data.url);
                } catch (error) {
                  toast.error(errorText(error));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Download className="size-5" />
              {busy ? "Preparando descarga…" : "Descargar para mi impresora"}
            </Button>
            {!session.data?.user?.canDownload && (
              <p className="mt-3 flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <LockKeyhole className="size-4 shrink-0" />
                Publica un diseño original aprobado para desbloquear las descargas. Puedes pedir
                fabricación sin publicar.
              </p>
            )}
          </div>
          <p className="mt-7 text-xs text-muted-foreground">
            Licencia: {item.license}. Respeta la atribución y las condiciones del creador. La
            aprobación de publicación no certifica resistencia, seguridad ni ajuste dimensional.
          </p>
        </div>
      </div>
    </section>
  );
}
