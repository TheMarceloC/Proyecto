import { useId, type CSSProperties } from "react";

const TINT: Record<string, string> = {
  PLA: "var(--accent)",
  PETG: "#678bff",
  ABS: "#e9ac68",
  TPU: "#d18bea",
};
const STAGES = [
  "Base preparada",
  "Los ejes encajan en la base",
  "Los engranajes entran en posición",
  "La tapa cierra el mecanismo",
  "Tornillos ajustados. Ensamble completo.",
];
const PARTS = ["Base", "Ejes", "Engranajes", "Tapa", "Tornillos"];

function gearPath(radius: number, teeth: number, hole: number) {
  const points = Array.from({ length: teeth * 4 }, (_, i) => {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const r = i % 4 < 2 ? radius : radius * 0.84;
    return `${i ? "L" : "M"}${Math.cos(a) * r},${Math.sin(a) * r}`;
  }).join(" ");
  return `${points} Z M ${-hole} 0 a ${hole} ${hole} 0 1 0 ${hole * 2} 0 a ${hole} ${hole} 0 1 0 ${-hole * 2} 0 Z`;
}

export function PieceVisual({
  step,
  material,
  label,
  compact = false,
}: {
  step: number;
  material: string;
  label?: string;
  compact?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const stage = Math.min(4, Math.max(0, step));
  const tint = TINT[material] || "var(--accent)";
  // Cada grupo se desplaza desde la vista explosionada a su posición de encaje.
  const fit = (at: number, x: number, y: number, angle = 0): CSSProperties => ({
    transform:
      stage >= at
        ? "translate(0px, 0px) rotate(0deg)"
        : `translate(${x}px, ${y}px) rotate(${angle}deg)`,
    transitionDelay: stage >= at ? "100ms" : "0ms",
  });
  const bolts: [number, number][] = [
    [-87, -60],
    [87, -60],
    [-87, 69],
    [87, 69],
  ];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-[#09101e] p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="label-caps text-accent">Pieza a pieza</p>
        <span className="font-mono text-[10px] text-muted-foreground">0{stage + 1} / 05</span>
      </div>
      <svg
        viewBox="0 0 400 405"
        className={
          compact ? "mx-auto w-full max-w-[260px] lg:max-w-[160px]" : "mx-auto w-full max-w-[390px]"
        }
        role="img"
        aria-label={`Ensamblaje de una caja de engranajes: ${STAGES[stage]}`}
      >
        <defs>
          <linearGradient id={uid + "metal"} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#d2e4f3" />
            <stop offset=".4" stopColor={tint} />
            <stop offset="1" stopColor="#1a3556" />
          </linearGradient>
          <linearGradient id={uid + "case"} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#24415e" />
            <stop offset="1" stopColor="#0d1c30" />
          </linearGradient>
        </defs>
        <g stroke="#30445f" opacity=".3" strokeWidth=".6">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M25 ${275 + i * 12}H375 M${40 + i * 40} 270L${i * 40 - 30} 390`} />
          ))}
        </g>
        <ellipse cx="200" cy="328" rx="125" ry="25" fill={tint} opacity=".08" />
        {stage < 4 && (
          <g stroke={tint} strokeDasharray="3 6" opacity=".25" fill="none">
            <path d="M106 130V295 M294 130V295 M200 65V310" />
          </g>
        )}
        <g transform="translate(200 278) rotate(-18) scale(1 .62)">
          <rect x="-112" y="-77" width="224" height="181" rx="24" fill="#0b1828" stroke="#34536f" />
          <rect
            x="-112"
            y="-94"
            width="224"
            height="181"
            rx="24"
            fill={`url(#${uid}case)`}
            stroke={tint}
            strokeWidth="1.5"
          />
          <rect x="-99" y="-81" width="198" height="155" rx="18" fill="#0a1625" stroke="#34536f" />
          {bolts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="7" fill="#060e18" stroke="#4b6a83" />
          ))}
          <g className="assembly-part" style={fit(1, 0, -150)}>
            {(
              [
                [-27, 7],
                [59, -25],
              ] as [number, number][]
            ).map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <ellipse rx="15" ry="12" fill="#294659" stroke="#7291a1" />
                <path d="M-7 0V-42Q0 -49 7 -42V0" fill={`url(#${uid}metal)`} stroke="#c3d5de" />
                <ellipse cy="-42" rx="7" ry="4" fill="#c2d6df" />
              </g>
            ))}
          </g>
          <g className="assembly-part" style={fit(2, -75, -155, -28)}>
            <g transform="translate(-27 -10)">
              {[12, 8, 4].map((y) => (
                <path
                  key={y}
                  transform={`translate(0 ${y})`}
                  d={gearPath(61, 16, 11)}
                  fill="#19405a"
                  stroke="#365e78"
                  fillRule="evenodd"
                />
              ))}
              <path
                d={gearPath(61, 16, 11)}
                fill={`url(#${uid}metal)`}
                stroke="#c2e0eb"
                fillRule="evenodd"
              />
              {Array.from({ length: 6 }, (_, i) => (
                <circle
                  key={i}
                  cx={Math.cos((i * Math.PI) / 3) * 37}
                  cy={Math.sin((i * Math.PI) / 3) * 37}
                  r="6"
                  fill="#102739"
                  stroke={tint}
                />
              ))}
            </g>
          </g>
          <g className="assembly-part" style={fit(2, 85, -135, 36)}>
            <g transform="translate(59 -42) rotate(12)">
              <path
                transform="translate(0 10)"
                d={gearPath(30, 10, 9)}
                fill="#21415b"
                stroke="#658195"
                fillRule="evenodd"
              />
              <path
                d={gearPath(30, 10, 9)}
                fill={`url(#${uid}metal)`}
                stroke="#d3e3ec"
                fillRule="evenodd"
              />
            </g>
          </g>
          <g className="assembly-part" style={fit(3, 0, -238)}>
            <path
              d="M-88 -104H88Q112 -104 112 -80V53Q112 77 88 77H-88Q-112 77 -112 53V-80Q-112 -104 -88 -104Z M-67 -71H67Q84 -71 84 -54V29Q84 46 67 46H-67Q-84 46 -84 29V-54Q-84 -71 -67 -71Z"
              fill={`url(#${uid}case)`}
              stroke={tint}
              strokeWidth="2"
              fillRule="evenodd"
            />
            <rect
              x="-84"
              y="-71"
              width="168"
              height="117"
              rx="17"
              fill={tint}
              fillOpacity=".045"
              stroke="#81aebf"
              strokeOpacity=".5"
            />
            <path d="M-68 -59L-12 -59 M-68 -52L-34 -52" stroke="#d2ecf4" opacity=".35" />
            <text
              x="0"
              y="65"
              fill="#bdd3e3"
              fontSize="9"
              textAnchor="middle"
              fontFamily="monospace"
            >
              PROTOLAB
            </text>
          </g>
          <g className="assembly-part" style={fit(4, 0, -285)}>
            {bolts.map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y - 10})`}>
                <path d="M-3 -9V-25H3V-9" stroke="#b9cad7" fill="#50697d" />
                <circle cy="-25" r="7" fill={`url(#${uid}metal)`} stroke="#c5dce9" />
                <path d="M-3 -28L3 -22 M3 -28L-3 -22" stroke="#12263a" strokeWidth="1.5" />
              </g>
            ))}
          </g>
        </g>
        <text
          x="200"
          y="385"
          textAnchor="middle"
          fill="#8197ac"
          fontSize="9"
          fontFamily="monospace"
        >
          {stage === 4 ? "ENSAMBLE COMPLETO" : "VISTA EXPLOSIONADA → ENSAMBLE"}
        </text>
      </svg>
      <div className="flex gap-1.5" aria-label="Partes ensambladas">
        {PARTS.map((part, i) => (
          <div key={part} className="flex-1 text-center">
            <div
              className={`h-1 rounded-full transition-colors duration-700 ${i <= stage ? "bg-accent" : "bg-white/10"}`}
            />
            <span
              className={`mt-2 block text-[9px] ${i <= stage ? "text-accent" : "text-muted-foreground"}`}
            >
              {part}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground" aria-live="polite">
        {STAGES[stage]}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label || "Comparte. Diseña. Fabrica."}</p>
    </div>
  );
}
