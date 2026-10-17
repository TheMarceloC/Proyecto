import { useState } from "react";
import { useMember, MemberGate } from "./Account";
import { api, uploadFile, errorText } from "@/lib/community";
import { Button, Field, inputClass } from "@/components/site/ui";
import { CheckCircle2 } from "lucide-react";
export function MessageForm({
  kind,
  context = "",
}: {
  kind: "contact" | "advice";
  context?: string;
}) {
  return (
    <MemberGate>
      <MessageFields kind={kind} context={context} />
    </MemberGate>
  );
}
function MessageFields({ kind, context }: { kind: "contact" | "advice"; context: string }) {
  const member = useMember();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <div role="status" className="py-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-accent" />
        <h2 className="mt-5 text-2xl font-bold">Tu mensaje quedó guardado.</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          El equipo puede consultar tu solicitud y contactarte en el correo indicado.
        </p>
      </div>
    );
  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setBusy(true);
        setError("");
        try {
          const file_path = file ? await uploadFile(file, "quote") : null;
          await api("messages", {
            name: data.get("name"),
            email: data.get("email"),
            message: (context ? context + "\n" : "") + data.get("message"),
            kind,
            file_path,
          });
          setSent(true);
        } catch (error) {
          setError(errorText(error));
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Nombre">
        <input
          aria-label="Nombre"
          name="name"
          required
          maxLength={100}
          defaultValue={member.data?.user?.name || ""}
          className={inputClass}
        />
      </Field>
      <Field label="Correo de contacto">
        <input
          aria-label="Correo de contacto"
          type="email"
          name="email"
          required
          maxLength={254}
          defaultValue={member.data?.user?.email || ""}
          className={inputClass}
        />
      </Field>
      <Field label="Cuéntanos qué necesitas" hint={context}>
        <textarea
          aria-label="Cuéntanos qué necesitas"
          name="message"
          required
          minLength={20}
          maxLength={3500}
          rows={6}
          className={inputClass}
        />
      </Field>
      {kind === "advice" && (
        <Field label="Referencia o archivo" hint="Opcional · hasta 50 MB">
          <input
            aria-label="Referencia o archivo"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,.stl,.obj,.step,.stp,.3mf,.dwg,.dxf"
            className={inputClass}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Field>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      <Button disabled={busy} className="w-full py-4">
        {busy ? "Guardando…" : kind === "advice" ? "Solicitar asesoría" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
