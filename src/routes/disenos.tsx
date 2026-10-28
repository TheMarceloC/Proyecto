import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search,
  Upload,
  ArrowUpRight,
  Layers3,
  SlidersHorizontal,
  Box,
  ArrowRight,
} from "lucide-react";
import { api, DESIGN_CATEGORIES, type Design } from "@/lib/community";
import { COMPLEXITIES, designPrice, type Complexity } from "@/lib/design-commerce";
import { useMember } from "@/components/community/Account";
import { CATALOG_DEMO_MODE, DEMO_DESIGNS } from "@/lib/demo-designs";
import { DemoNotice } from "@/components/community/DemoDesign";
import { Button, GlassCard } from "@/components/site/ui";
import soporte from "@/assets/proj-soporte-sensor.jpg";
import carcasa from "@/assets/proj-carcasa.jpg";
import engranaje from "@/assets/proj-engranaje.jpg";

// Muestras de presentación, sin autores, archivos ni aprobaciones inventadas.
const SAMPLE_DESIGNS = [
  {
    title: "Soporte para sensor",
    category: "Electrónica",
    material: "PETG",
    image: soporte,
    description: "Una referencia para montar sensores y organizar un proyecto electrónico.",
  },
  {
    title: "Carcasa para electrónica",
    category: "Organización",
    material: "PLA",
    image: carcasa,
    description: "Inspírate para dar forma a una caja o alojamiento a la medida de tu proyecto.",
  },
  {
    title: "Conjunto de engranajes",
    category: "Mecánica",
    material: "PETG",
    image: engranaje,
    description: "Explora la idea de un mecanismo y solicita una pieza adaptada a tus medidas.",
  },
];
export const Route = createFileRoute("/disenos")({
  head: () => ({
    meta: [
      { title: "Catálogo de diseños 3D — ProtoLab" },
      {
        name: "description",
        content: "Compra diseños 3D según su complejidad o cotiza su fabricación con ProtoLab.",
      },
    ],
  }),
  component: DesignsPage,
});
function DesignsPage() {
  const designs = useQuery({
    queryKey: ["designs"],
    queryFn: () => api<Design[]>("designs"),
    enabled: !CATALOG_DEMO_MODE,
    retry: false,
  });
  const member = useMember();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [complexity, setComplexity] = useState("");
  const [sort, setSort] = useState("recent");
  const samples = (CATALOG_DEMO_MODE ? [] : SAMPLE_DESIGNS).filter(
    (d) =>
      (category === "Todos" || d.category === category) &&
      [d.title, d.description, d.material].join(" ").toLowerCase().includes(search.toLowerCase()),
  );
  const filtered = (CATALOG_DEMO_MODE ? DEMO_DESIGNS : designs.data || [])
    .filter(
      (d) =>
        (category === "Todos" || d.category === category) &&
        (!complexity || d.complexity === complexity) &&
        [d.title, d.description, d.author_name]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "low"
        ? (a.price ?? Infinity) - (b.price ?? Infinity)
        : sort === "high"
          ? (b.price ?? 0) - (a.price ?? 0)
          : 0,
    );
  return (
    <section className="mx-auto max-w-7xl px-5 pt-10 pb-24 sm:px-6">
      {CATALOG_DEMO_MODE && <DemoNotice />}
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-brand/20 via-panel to-accent/5 p-7 sm:p-11">
        <div className="pointer-events-none absolute -right-16 -top-20 size-80 rounded-full border-[35px] border-accent/10" />
        <p className="label-caps text-accent">Diseños con valor. Piezas con propósito.</p>
        <div className="relative mt-4 grid gap-7 lg:grid-cols-[1fr_290px]">
          <div>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
              Tu próxima pieza
              <br />
              <span className="text-gradient">empieza aquí.</span>
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Compra el diseño para tu impresora o cotiza la pieza fabricada por ProtoLab. Cada
              archivo tiene su precio, según el trabajo y la complejidad del diseño.
            </p>
            <Link
              to="/publicar"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-accent-foreground"
            >
              <Upload className="size-4" />
              Vender mi diseño
            </Link>
          </div>
          <div className="self-end rounded-2xl border border-white/10 bg-background/40 p-5">
            <Layers3 className="size-6 text-accent" />
            <p className="mt-3 font-semibold">Elige cómo crear.</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Explorar es libre. Cada archivo se compra por separado y se descarga después de
              verificar el pago. También puedes pedir solo la pieza física.
            </p>
            <Link to="/como-funciona" className="mt-4 inline-flex gap-2 text-sm text-accent">
              Así funciona
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-4 top-3.5 size-5 text-muted-foreground" />
          <input
            aria-label="Buscar diseños"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busca una pieza, una idea, un creador…"
            className="w-full rounded-xl border border-border bg-white/5 py-3 pl-12 pr-4 text-sm outline-none focus:border-accent"
          />
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal className="size-4" />
          Archivo digital y fabricación: dos opciones independientes
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <select
          aria-label="Filtrar por complejidad"
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
          className="rounded-xl border border-border bg-panel px-4 py-3 text-sm"
        >
          <option value="">Todas las complejidades</option>
          {Object.entries(COMPLEXITIES).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Ordenar diseños"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-border bg-panel px-4 py-3 text-sm"
        >
          <option value="recent">Más recientes</option>
          <option value="low">Menor precio</option>
          <option value="high">Mayor precio</option>
        </select>
      </div>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Categorías">
        {DESIGN_CATEGORIES.map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={
              "rounded-full border px-4 py-2 text-sm transition " +
              (category === item
                ? "border-accent bg-accent text-accent-foreground font-semibold"
                : "border-border text-muted-foreground hover:bg-white/5")
            }
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-9 flex items-center justify-between">
        <h2 className="text-xl font-bold">Explora la colección</h2>
        <span className="text-xs text-muted-foreground">
          {filtered.length} {CATALOG_DEMO_MODE ? "diseños de ejemplo" : "publicados"}
        </span>
      </div>
      {!CATALOG_DEMO_MODE && designs.isPending && (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          Cargando publicaciones de la comunidad… Puedes explorar los diseños de muestra.
        </p>
      )}
      {!CATALOG_DEMO_MODE && member.data?.configured === false && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-border p-4 text-sm text-muted-foreground"
        >
          Las publicaciones y las cuentas no están disponibles en este momento. Puedes explorar las
          muestras y estimar una pieza sin cuenta.
        </p>
      )}
      {!CATALOG_DEMO_MODE && designs.isError && (
        <GlassCard className="mt-4 p-5">
          <p role="status" className="text-sm text-muted-foreground">
            No pudimos cargar las publicaciones de la comunidad. Los diseños de muestra siguen
            disponibles.
          </p>
          <Button variant="ghost" className="mt-3" onClick={() => designs.refetch()}>
            Volver a cargar publicaciones
          </Button>
        </GlassCard>
      )}
      {filtered.length > 0 && (
        <>
          <h3 className="mt-6 font-semibold">
            {CATALOG_DEMO_MODE ? "Elige tu próximo diseño" : "Diseños a la venta"}
          </h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((design) => (
              <Link key={design.id} to="/diseno/$id" params={{ id: design.id }}>
                <GlassCard className="group h-full overflow-hidden transition hover:-translate-y-1 hover:border-accent/40">
                  {design.image_url ? (
                    <img
                      src={design.image_url}
                      alt={design.title}
                      className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center bg-brand/10">
                      <Box className="size-20 text-accent" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                      <span>{design.category}</span>
                      <span>{design.material}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold">{design.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">por {design.author_name}</p>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-brand/15 px-3 py-1 text-xs text-accent">
                        {COMPLEXITIES[design.complexity as Complexity]?.label || "En revisión"}
                      </span>
                      <span className="text-2xl font-bold">
                        {design.price !== null ? designPrice(design.price) : "En revisión"}
                      </span>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                      <span className="text-accent">
                        {CATALOG_DEMO_MODE ? "Ver diseño y precio" : "Ver y comprar archivo"}
                      </span>
                      <ArrowUpRight className="size-4 text-accent" />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </>
      )}
      {samples.length > 0 ? (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Referencias para inspirarte: estas muestras no incluyen archivos descargables ni están a
            la venta como diseños digitales. Puedes cotizar una pieza similar. Los diseños
            comerciales aparecen arriba al aprobarse con su precio.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {samples.map((sample) => (
              <GlassCard
                key={sample.title}
                className="group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-accent/40"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={sample.image}
                    alt={sample.title}
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-background/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider">
                    Diseño de muestra
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span>{sample.category}</span>
                    <span>{sample.material}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{sample.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{sample.description}</p>
                  <div className="mt-5 border-t border-border pt-4">
                    <Link
                      to="/cotizar"
                      search={{ inicio: "idea" }}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent"
                    >
                      Cotizar una pieza similar <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-white/[0.02] px-6 py-12 text-center">
          <Box className="mx-auto size-10 text-accent" />
          <h3 className="mt-4 text-xl font-bold">
            {search || category !== "Todos"
              ? "Todavía no hay coincidencias."
              : "Esta colección empieza contigo."}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Propón un diseño original para vender. El equipo revisará el archivo, la complejidad, el
            precio y las condiciones comerciales antes de publicarlo.
          </p>
          <Link to="/publicar" className="mt-5 inline-flex gap-2 font-semibold text-accent">
            Publicar un diseño
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : null}
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {[
          { title: "Organiza tu espacio", category: "Organización", img: carcasa },
          { title: "Resuelve un mecanismo", category: "Mecánica", img: engranaje },
          { title: "Dale forma a tu proyecto", category: "Electrónica", img: soporte },
        ].map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => {
              setCategory(item.category);
              setSearch("");
            }}
            className="group relative overflow-hidden rounded-2xl text-left"
          >
            <img
              src={item.img}
              alt=""
              className="h-44 w-full object-cover opacity-50 transition group-hover:opacity-70"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <span className="absolute bottom-5 left-5">
              <span className="label-caps text-accent">{item.category}</span>
              <span className="mt-1 block text-lg font-bold">{item.title}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
