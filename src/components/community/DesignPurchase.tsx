import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { api, errorText, type Design, type DesignPurchase } from "@/lib/community";
import { DESIGN_LICENSE, LICENSE_TERMS, designPrice } from "@/lib/design-commerce";
import { useMember } from "./Account";
import { Button, GlassCard } from "@/components/site/ui";

export function DesignPurchaseActions({ design }: { design: Design }) {
  const session = useMember();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const purchases = useQuery({
    queryKey: ["purchases", design.id],
    queryFn: () => api<DesignPurchase[]>("purchases?design=" + design.id),
    enabled: Boolean(session.data?.user),
    retry: false,
  });
  const purchase = purchases.data?.find((p) => p.design_id === design.id);
  const own = session.data?.user?.id === design.owner_id;
  const canDownload = own || session.data?.user?.isAdmin || purchase?.status === "paid";
  const available = design.status === "approved" && design.price !== null;
  return (
    <GlassCard className="mt-8 p-6">
      <p className="label-caps text-accent">Archivo digital</p>
      <p className="mt-3 text-4xl font-bold">
        {design.price !== null ? designPrice(design.price) : "Precio en revisión"}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Pago por este diseño. La fabricación se cotiza aparte.
      </p>
      <details className="mt-5 text-sm text-muted-foreground" open>
        <summary className="cursor-pointer font-semibold text-foreground">{DESIGN_LICENSE}</summary>
        <p className="mt-2 leading-relaxed">{LICENSE_TERMS}</p>
      </details>
      {canDownload ? (
        <Button
          className="mt-5 w-full"
          disabled={busy || !available}
          onClick={async () => {
            setBusy(true);
            try {
              window.location.assign(
                (await api<{ url: string }>("download", { id: design.id })).url,
              );
            } catch (error) {
              toast.error(errorText(error));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Download className="size-4" />
          {busy ? "Preparando archivo…" : own ? "Descargar mi archivo" : "Descargar diseño"}
        </Button>
      ) : !available ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Este diseño todavía no está a la venta.
        </p>
      ) : !session.data?.user ? (
        <Link
          to="/cuenta"
          className="mt-5 flex justify-center rounded-xl bg-accent px-5 py-4 font-bold text-accent-foreground"
        >
          Iniciar sesión para comprar
        </Link>
      ) : purchases.isPending ? (
        <p role="status" className="mt-5 text-sm">
          Consultando tus compras…
        </p>
      ) : purchases.isError ? (
        <div className="mt-5">
          <p role="alert">No pudimos consultar tu compra.</p>
          <Button variant="ghost" onClick={() => purchases.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : purchase ? (
        <div className="mt-5 rounded-xl border border-border p-4 text-sm">
          <p className="font-semibold">
            {purchase.status === "revoked"
              ? "Acceso revocado. Contacta al equipo."
              : "Solicitud registrada · pendiente de pago"}
          </p>
          <p className="mt-2">
            Importe de tu solicitud: <strong>{designPrice(purchase.amount)}</strong>
          </p>
          <p className="mt-2 break-all text-xs text-muted-foreground">Referencia: {purchase.id}</p>
          <p className="mt-3 text-muted-foreground">
            Coordina el pago con el equipo e indica esta referencia. La descarga se habilita cuando
            ProtoLab verifica el pago; registrar la solicitud no realiza ningún cobro.
          </p>
          <Link to="/contacto" className="mt-3 inline-block font-semibold text-accent">
            Coordinar con el equipo →
          </Link>
        </div>
      ) : (
        <form
          className="mt-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!accepted) return;
            setBusy(true);
            try {
              await api<DesignPurchase>("purchases", {
                design_id: design.id,
                accepted_license: DESIGN_LICENSE,
              });
              await qc.invalidateQueries({ queryKey: ["purchases"] });
              toast.success("Solicitud de compra registrada. Falta coordinar y verificar el pago.");
            } catch (error) {
              toast.error(errorText(error));
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="flex gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              required
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 accent-teal-400"
            />
            Acepto las condiciones de uso del archivo.
          </label>
          <Button className="mt-4 w-full py-4" disabled={busy || !accepted}>
            <ShoppingBag className="size-4" />
            {busy ? "Registrando…" : "Solicitar compra del diseño"}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Pago coordinado con el equipo y verificado manualmente. No se cobra desde esta página.
          </p>
        </form>
      )}
    </GlassCard>
  );
}
