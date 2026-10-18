import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
}: {
  className?: string | undefined;
  children: ReactNode;
}) {
  return <div className={cn("glass rounded-2xl", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  className,
}: {
  eyebrow?: string | undefined;
  title: ReactNode;
  text?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <p className="label-caps text-accent">{eyebrow}</p> : null}
      <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
      {text ? <p className="mt-3 text-muted-foreground">{text}</p> : null}
    </div>
  );
}

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export const btnStyles = {
  primary: cn(btnBase, "bg-accent text-accent-foreground shadow-glow hover:brightness-110"),
  brand: cn(btnBase, "bg-brand text-brand-foreground hover:brightness-110"),
  ghost: cn(btnBase, "glass text-foreground hover:bg-white/10"),
};

export function ActionLink({
  to,
  variant = "primary",
  className,
  children,
}: {
  to: string;
  variant?: keyof typeof btnStyles;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={cn(btnStyles[variant], className)}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof btnStyles }) {
  return <button className={cn(btnStyles[variant], className)} {...props} />;
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">
      {children}
    </span>
  );
}

export function Dot() {
  return <span className="size-1.5 shrink-0 rounded-full bg-accent" />;
}

export function StatusBadge({
  label,
  tone = "accent",
}: {
  label: string;
  tone?: "accent" | "brand" | "muted";
}) {
  const tones = {
    accent: "bg-accent/12 text-accent border-accent/25",
    brand: "bg-brand/15 text-brand border-brand/30",
    muted: "bg-white/5 text-muted-foreground border-border",
  };
  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone])}>
      {label}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-input bg-white/5 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-accent/60";

export function OptionCard({
  selected,
  onClick,
  title,
  text,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  text?: string | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 text-left transition",
        selected ? "border-accent bg-accent/10" : "border-border bg-white/5 hover:bg-white/10",
      )}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      {text ? <p className="mt-1 text-xs text-muted-foreground">{text}</p> : null}
    </button>
  );
}

export function PillOption({
  selected,
  onClick,
  children,
  disabled = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg border py-2.5 text-center text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        selected
          ? "border-accent bg-accent/10 text-foreground"
          : "border-border bg-white/5 text-muted-foreground hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
