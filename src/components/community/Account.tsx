import { useState, useEffect, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LogIn, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { api, errorText, type SessionState } from "@/lib/community";
import { Button, Field, GlassCard, inputClass } from "@/components/site/ui";

export function useMember() {
  return useQuery({
    queryKey: ["member"],
    queryFn: () => api<SessionState>("session"),
    staleTime: 30000,
    retry: false,
  });
}
export function AccountForm() {
  const queryClient = useQueryClient();
  const session = useMember();
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    // La confirmación de correo puede regresar con un fragmento de Supabase.
    // No guardamos esos tokens en JavaScript: el acceso se inicia con cookies HttpOnly.
    if (window.location.hash.includes("access_token")) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      setNotice("Correo confirmado. Ya puedes iniciar sesión.");
    }
  }, []);
  return (
    <GlassCard className="mx-auto w-full max-w-lg p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
          <LogIn />
        </span>
        <div>
          <h2 className="text-xl font-bold">
            {register ? "Crea tu espacio maker" : "Bienvenido a ProtoLab"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tus compras, tus diseños y tus piezas.
          </p>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 rounded-xl bg-white/5 p-1">
        {[false, true].map((mode) => (
          <button
            key={String(mode)}
            type="button"
            className={
              "rounded-lg px-3 py-2 text-sm " +
              (register === mode
                ? "bg-accent text-accent-foreground font-semibold"
                : "text-muted-foreground")
            }
            onClick={() => {
              setRegister(mode);
              setError("");
              setNotice("");
            }}
          >
            {mode ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        ))}
      </div>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (session.isPending || session.isError || session.data?.configured !== true) return;
          setBusy(true);
          setError("");
          setNotice("");
          const data = new FormData(event.currentTarget);
          try {
            const result = await api<{ confirmationRequired?: boolean }>(
              "auth/" + (register ? "signup" : "login"),
              {
                email: data.get("email"),
                password: data.get("password"),
                ...(register ? { name: data.get("name") } : {}),
              },
            );
            if (result.confirmationRequired) {
              setNotice("Revisa tu correo y confirma tu cuenta. Después inicia sesión aquí.");
              setRegister(false);
            }
            await queryClient.invalidateQueries({ queryKey: ["member"] });
          } catch (error) {
            setError(errorText(error));
          } finally {
            setBusy(false);
          }
        }}
      >
        {register && (
          <Field label="Nombre público">
            <input
              aria-label="Nombre público"
              name="name"
              required
              minLength={2}
              maxLength={60}
              autoComplete="nickname"
              className={inputClass}
            />
          </Field>
        )}
        <Field label="Correo electrónico">
          <input
            aria-label="Correo electrónico"
            type="email"
            name="email"
            required
            autoComplete="email"
            maxLength={254}
            className={inputClass}
          />
        </Field>
        <Field label="Contraseña" hint="Al menos 8 caracteres.">
          <input
            aria-label="Contraseña"
            type="password"
            name="password"
            minLength={8}
            maxLength={128}
            required
            autoComplete={register ? "new-password" : "current-password"}
            className={inputClass}
          />
        </Field>
        {notice && (
          <p role="status" className="rounded-xl bg-accent/10 p-3 text-sm text-accent">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        )}
        {session.data?.configured === false && (
          <p role="status" className="text-sm text-muted-foreground">
            El acceso a cuentas no está disponible en este momento. Puedes seguir explorando el
            catálogo.
          </p>
        )}
        {session.isError && (
          <div role="status" className="text-sm text-muted-foreground">
            <p>No pudimos comprobar el acceso. Puedes seguir explorando y estimando tu pieza.</p>
            <button type="button" className="mt-2 text-accent" onClick={() => session.refetch()}>
              Reintentar conexión
            </button>
          </div>
        )}
        <Button
          className="w-full"
          disabled={
            busy || session.isPending || session.isError || session.data?.configured !== true
          }
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          {register ? "Crear mi cuenta" : "Entrar a mi cuenta"}
        </Button>
        {register && (
          <p className="text-xs text-muted-foreground">
            Tu nombre será visible en los diseños que publiques. Tu correo y tus pedidos son
            privados.
          </p>
        )}
      </form>
      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-accent" />
        Cada compra verificada habilita la descarga de ese diseño.
      </p>
    </GlassCard>
  );
}
export function MemberGate({ children }: { children: ReactNode }) {
  const member = useMember();
  if (member.isPending)
    return (
      <p role="status" className="py-12 text-center text-muted-foreground">
        Cargando tu cuenta…
      </p>
    );
  return member.data?.user ? (
    <>{children}</>
  ) : (
    <div className="py-8">
      <AccountForm />
    </div>
  );
}
export function MemberButton() {
  const member = useMember();
  return (
    <Link
      to="/cuenta"
      className="hidden rounded-full border border-border px-4 py-2 text-sm text-foreground transition hover:bg-white/10 sm:block"
    >
      {member.data?.user ? member.data.user.name.split(" ")[0] : "Mi cuenta"}
    </Link>
  );
}
