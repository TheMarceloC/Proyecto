/**
 * Visual progresiva de la pieza: acompaña los pasos del cotizador.
 * Paso 0 = boceto en wireframe · Paso 4 = pieza "fabricada".
 */
const MATERIAL_TINT: Record<string, string> = {
  PLA: "var(--accent)",
  PETG: "var(--brand)",
  ABS: "oklch(0.72 0.16 60)",
  TPU: "oklch(0.72 0.18 340)",
};

export function PieceVisual({
  step,
  material,
  label,
}: {
  step: number;
  material: string;
  label?: string;
}) {
  const solid = Math.min(1, Math.max(0, (step - 0.5) / 3));
  const tint = MATERIAL_TINT[material] ?? "var(--accent)";

  return (
    <div className="relative grid place-items-center rounded-2xl border border-border bg-white/[0.03] p-6">
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-700"
        style={{
          opacity: 0.15 + solid * 0.35,
          background: `radial-gradient(60% 60% at 50% 40%, color-mix(in oklab, ${tint} 40%, transparent), transparent 70%)`,
        }}
      />
      <svg viewBox="0 0 200 200" className="relative w-40 sm:w-48" role="img" aria-label="Pieza en construcción">
        {/* base grid */}
        <g stroke="var(--hairline)" strokeWidth="1">
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`h${i}`} x1="20" y1={150 + i * 8} x2="180" y2={150 + i * 8} />
          ))}
        </g>
        {/* isometric block */}
        <g style={{ transition: "opacity 700ms" }}>
          <polygon
            points="100,40 160,72 160,132 100,164 40,132 40,72"
            fill={`color-mix(in oklab, ${tint} ${Math.round(solid * 55)}%, transparent)`}
            stroke={tint}
            strokeWidth="2"
            strokeDasharray={solid > 0.65 ? "0" : "6 5"}
            style={{ transition: "all 700ms" }}
          />
          <polyline
            points="40,72 100,104 160,72"
            fill="none"
            stroke={tint}
            strokeWidth="1.5"
            opacity={0.7}
          />
          <line x1="100" y1="104" x2="100" y2="164" stroke={tint} strokeWidth="1.5" opacity={0.7} />
          {/* detalle: perforación aparece al completarse */}
          <circle
            cx="100"
            cy="104"
            r="14"
            fill="var(--background)"
            stroke={tint}
            strokeWidth="2"
            opacity={step >= 3 ? 1 : 0}
            style={{ transition: "opacity 600ms" }}
          />
        </g>
      </svg>
      <p className="relative mt-3 text-center text-xs text-muted-foreground">
        {label ?? "Tu pieza se va construyendo mientras avanzas."}
      </p>
    </div>
  );
}
