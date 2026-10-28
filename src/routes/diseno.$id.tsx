import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Boxes, ShieldCheck, Box } from "lucide-react";
import { api, type Design } from "@/lib/community";
import { COMPLEXITIES } from "@/lib/design-commerce";
import { DesignPurchaseActions } from "@/components/community/DesignPurchase";
import { demoDesign } from "@/lib/demo-designs";
import { DemoNotice, DemoPurchaseActions } from "@/components/community/DemoDesign";
import { GlassCard } from "@/components/site/ui";
export const Route = createFileRoute("/diseno/$id")({
  head: () => ({ meta: [{ title: "Diseño del catálogo — ProtoLab" }] }),
  component: DesignDetail,
});
function DesignDetail() {
  const { id } = Route.useParams();
  const demo = demoDesign(id);
  const design = useQuery({
    queryKey: ["design", id],
    queryFn: () => api<Design>("designs/" + id),
    retry: false,
    enabled: !demo,
  });
  const item = demo || design.data;
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
      {demo && <DemoNotice />}
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
            {item.category} · {item.material} · Complejidad{" "}
            {COMPLEXITIES[item.complexity]?.label || "en revisión"}
          </p>
          <h1 className="mt-4 text-4xl font-bold">{item.title}</h1>
          <p className="mt-3 text-muted-foreground">
            Diseñado por <span className="text-foreground">{item.author_name}</span>
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-xs text-accent">
            <ShieldCheck className="size-4" />
            {demo
              ? "Diseño de demostración"
              : {
                  approved: "Publicación revisada",
                  pending: "En revisión",
                  rejected: "Requiere cambios",
                }[item.status]}
          </div>
          <p className="mt-6 whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {item.description}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{item.complexity_notes}</p>
          {demo ? <DemoPurchaseActions design={item} /> : <DesignPurchaseActions design={item} />}
          <GlassCard className="mt-8 p-5">
            <h2 className="font-bold">De la pantalla a tus manos.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Elige material, cantidad y entrega. Revisaremos el archivo y te enviaremos una
              cotización para fabricarlo. La pieza física y el archivo digital se contratan por
              separado.
            </p>
            <Link
              to="/cotizar"
              search={{ diseno: item.id }}
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 font-bold text-accent-foreground"
            >
              <Boxes className="size-5" />
              Cotizar pieza fabricada
            </Link>
          </GlassCard>
          <p className="mt-7 text-xs text-muted-foreground">
            Licencia: {item.license}. Respeta la atribución y las condiciones del creador. La
            aprobación de publicación no certifica resistencia, seguridad ni ajuste dimensional.
          </p>
        </div>
      </div>
    </section>
  );
}
