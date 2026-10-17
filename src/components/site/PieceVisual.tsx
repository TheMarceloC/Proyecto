import { useId } from "react";
const TINT: Record<string, string> = {
  PLA: "var(--accent)",
  PETG: "var(--brand)",
  ABS: "#e9ac68",
  TPU: "#d18bea",
};
function gearPath(radius: number, teeth: number) {
  const points = Array.from({ length: teeth * 4 }, (_, i) => {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const r = i % 4 < 2 ? radius : radius * 0.85;
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  return (
    points.map((p, i) => (i ? "L" : "M") + p.join(",")).join(" ") +
    "Z M -19 0 a 19 19 0 1 0 38 0 a 19 19 0 1 0 -38 0 Z"
  );
}
const stages = [
  "Idea y propósito",
  "Geometría y referencias",
  "Material y acabado",
  "Preparación del proyecto",
  "Listo para revisión",
];
export function PieceVisual({
  step,
  material,
  label,
}: {
  step: number;
  material: string;
  label?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const progress = (Math.min(4, Math.max(0, step)) + 1) / 5;
  const tint = TINT[material] || "var(--accent)";
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-[#09101e] p-5">
      <div className="flex items-center justify-between">
        <p className="label-caps text-accent">De la idea a la pieza</p>
        <span className="font-mono text-[10px] text-muted-foreground">
          0{Math.min(4, step) + 1} / 05
        </span>
      </div>
      <svg
        viewBox="0 0 320 300"
        className="mx-auto w-full max-w-[330px]"
        role="img"
        aria-label={"Mecanismo de engranajes que se completa: " + stages[step]}
      >
        <defs>
          <linearGradient id={uid + "metal"} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#b9c9ff" />
            <stop offset=".4" stopColor={tint} />
            <stop offset="1" stopColor="#132c48" />
          </linearGradient>
          <linearGradient id={uid + "side"}>
            <stop stopColor="#182946" />
            <stop offset="1" stopColor={tint} />
          </linearGradient>
          <clipPath id={uid + "build"}>
            <rect
              x="0"
              y={265 - progress * 240}
              width="320"
              height={progress * 240}
              style={{ transition: "y 900ms ease,height 900ms ease" }}
            />
          </clipPath>
        </defs>
        <g stroke="#30445f" opacity=".45" strokeWidth=".6">
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i}>
              <path d={`M${20 + i * 28} 225 L${145 + i * 14} 150`} />
              <path d={`M20 ${150 + i * 12} L300 ${150 + i * 12}`} />
            </g>
          ))}
        </g>
        <ellipse cx="160" cy="235" rx="110" ry="25" fill={tint} opacity=".08" />
        <g transform="translate(160 164) rotate(-18) scale(1 .64)">
          <g opacity=".25" fill="none" stroke={tint} strokeWidth="1" strokeDasharray="4 4">
            <rect x="-107" y="-96" width="214" height="178" rx="22" />
            <path d={gearPath(68, 16)} />
            <path transform="translate(73 -75) scale(.49)" d={gearPath(68, 12)} />
            <path d="M-130 0H130 M0 -130V120" />
          </g>
          <g clipPath={`url(#${uid}build)`} transform="translate(0 0)" />
        </g>
        <g clipPath={`url(#${uid}build)`}>
          <g transform="translate(160 164) rotate(-18) scale(1 .64)">
            <rect
              x="-107"
              y="-78"
              width="214"
              height="178"
              rx="22"
              fill="#122135"
              stroke="#365470"
              strokeWidth="1.5"
            />
            <rect
              x="-107"
              y="-96"
              width="214"
              height="178"
              rx="22"
              fill="#182c44"
              stroke={tint}
              strokeWidth="1.5"
            />
            {[-83, 83].flatMap((x) =>
              [-73, 59].map((y) => (
                <g key={x + "_" + y}>
                  <circle cx={x} cy={y} r="9" fill="#080f1c" stroke="#3d6178" />
                  <circle cx={x} cy={y} r="4" fill="#658697" />
                </g>
              )),
            )}
            {Array.from({ length: 9 }, (_, i) => (
              <path
                key={i}
                transform={`translate(0 ${20 - i * 2})`}
                d={gearPath(68, 16)}
                fill={`url(#${uid}side)`}
                fillRule="evenodd"
                stroke="#183b50"
                strokeWidth=".7"
              />
            ))}
            <path
              d={gearPath(68, 16)}
              fill={`url(#${uid}metal)`}
              fillRule="evenodd"
              stroke="#bdd7e2"
              strokeWidth="1.2"
            />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i * Math.PI) / 3;
              return (
                <circle
                  key={i}
                  cx={Math.cos(angle) * 43}
                  cy={Math.sin(angle) * 43}
                  r="7"
                  fill="#102739"
                  stroke={tint}
                />
              );
            })}
            <g transform="translate(73 -75) scale(.49)">
              <path transform="translate(0 14)" d={gearPath(68, 12)} fill="#183c4f" />
              <path
                d={gearPath(68, 12)}
                fill={`url(#${uid}metal)`}
                fillRule="evenodd"
                stroke="#b0cad9"
                strokeWidth="2"
              />
              <circle r="12" fill="#13283b" stroke={tint} />
            </g>
            <circle r="17" fill="#071421" stroke="#bdd8e2" strokeWidth="2" />
            <circle r="8" fill="#234956" />
            <path d="M-6 -6L6 6 M6 -6L-6 6" stroke="#a9b9c7" />
          </g>
        </g>
        {step < 4 && (
          <g
            style={{
              transform: `translateY(${265 - progress * 240}px)`,
              transition: "transform 900ms ease",
            }}
          >
            <path d="M35 0H285" stroke={tint} strokeWidth="1.5" opacity=".8" />
            <rect x="35" y="-8" width="250" height="18" fill={tint} opacity=".07" />
          </g>
        )}
        <g stroke={tint} strokeWidth=".7" opacity=".5">
          <path d="M28 65V40H53 M267 40H292V65 M28 240V265H53 M267 265H292V240" />
        </g>
        <text x="27" y="285" fill="#8197ac" fontSize="8" fontFamily="monospace">
          ENSAMBLE · CAPAS · GEOMETRÍA
        </text>
      </svg>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-700"
          style={{ width: progress * 100 + "%" }}
        />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{stages[step]}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label || "Comparte. Diseña. Fabrica."}</p>
    </div>
  );
}
