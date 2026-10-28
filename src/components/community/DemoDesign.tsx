import { useState } from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import type { Design } from "@/lib/community";
import { designPrice } from "@/lib/design-commerce";
import { Button, GlassCard } from "@/components/site/ui";

export function DemoNotice() {
  return (
    <p
      role="note"
      className="mb-6 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-muted-foreground"
    >
      <strong className="text-foreground">Vista demostrativa.</strong> Diseños y precios de ejemplo.
      No se procesan compras ni descargas.
    </p>
  );
}

export function DemoPurchaseActions({ design }: { design: Design }) {
  const [preview, setPreview] = useState(false);
  return (
    <GlassCard className="mt-8 p-6">
      <p className="label-caps text-accent">Archivo digital</p>
      <p className="mt-3 text-4xl font-bold">{designPrice(design.price!)}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Precio de ejemplo del diseño. Fabricación y entrega por separado.
      </p>
      {preview ? (
        <div
          role="region"
          aria-label="Vista previa de compra"
          className="mt-5 rounded-xl border border-accent/25 bg-accent/5 p-5"
        >
          <h2 className="text-xl font-bold">Tu diseño, listo para crear.</h2>
          <div className="mt-5 flex justify-between gap-4 text-sm">
            <span>{design.title}</span>
            <strong>{designPrice(design.price!)}</strong>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-bold">
            <span>Total del archivo</span>
            <span>{designPrice(design.price!)}</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Esta es una vista previa de la compra. No se guarda un pedido, no se cobra dinero y no
            se entrega ningún archivo.
          </p>
          <Button className="mt-4 w-full" disabled>
            Pago no disponible en demostración
          </Button>
          <Button variant="ghost" className="mt-3 w-full" onClick={() => setPreview(false)}>
            <ArrowLeft className="size-4" />
            Volver al diseño
          </Button>
        </div>
      ) : (
        <Button className="mt-5 w-full py-4" onClick={() => setPreview(true)}>
          <ShoppingBag className="size-4" />
          Comprar diseño · demo
        </Button>
      )}
    </GlassCard>
  );
}
