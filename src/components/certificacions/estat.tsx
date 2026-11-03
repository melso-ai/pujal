import Link from "next/link";

import type { Estat } from "@/lib/certificacions";
import { cn } from "@/lib/utils";

export const PASSOS: Estat[] = ["Producció", "Certificació", "Arquitecte", "Facturada", "Cobrada"];

// Brand marks the step that waits on Pujal, warning the one that waits on the architect.
export const TO: Record<Estat, string> = {
  Producció: "bg-chart-4",
  Certificació: "bg-brand",
  Arquitecte: "bg-warning",
  Facturada: "bg-chart-2",
  Cobrada: "bg-success",
};

export const pp = (n: number) => `${n > 0.05 ? "+" : n < -0.05 ? "−" : ""}${Math.abs(n).toFixed(1)} pp`;

export function EstatDot({ estat, className }: { estat: Estat; className?: string }) {
  return <span aria-hidden className={cn("size-2 shrink-0 rounded-full", TO[estat], className)} />;
}

export function Barra({
  anterior,
  origen,
  className,
}: {
  anterior: number;
  origen: number;
  className?: string;
}) {
  const a = Math.min(100, anterior);
  const m = Math.max(0, Math.min(100, origen) - a);
  return (
    <div className={cn("flex h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full bg-chart-4" style={{ width: `${a}%` }} />
      <div className="h-full bg-brand" style={{ width: `${m}%` }} />
    </div>
  );
}

// Preformatted on the server so hydration never depends on the browser's ICU.
export type Fila = {
  id: string;
  nom: string;
  ute?: string;
  estat: Estat;
  linia: string;
  to: string;
  import: string;
  mes: string;
  anterior: number;
  origen: number;
};

export function FilaCert({ f, etiqueta }: { f: Fila; etiqueta?: string }) {
  return (
    <Link
      href={`/certificacions/${f.id}`}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
    >
      <EstatDot estat={f.estat} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-body font-medium">{etiqueta ?? f.nom}</span>
          {f.ute && <span className="shrink-0 text-caption text-muted-foreground">{f.ute}</span>}
        </span>
        <span className={cn("truncate text-caption", f.to)}>{f.linia}</span>
      </div>
      <div className="hidden w-32 shrink-0 flex-col gap-1.5 @xl:flex">
        <Barra anterior={f.anterior} origen={f.origen} />
        <span className="font-mono text-caption text-muted-foreground tabular-nums">
          {Math.round(f.anterior)} → {Math.round(f.origen)}%
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className="font-mono text-label tabular-nums">{f.import}</span>
        <span className="font-mono text-caption text-muted-foreground tabular-nums">{f.mes}</span>
      </div>
    </Link>
  );
}
