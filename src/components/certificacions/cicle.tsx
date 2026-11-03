"use client";

import { useState } from "react";

import { EstatDot, FilaCert, TO, type Fila } from "@/components/certificacions/estat";
import type { Estat } from "@/lib/certificacions";
import { cn } from "@/lib/utils";

export type Tram = { estat: Estat; n: number; import: string; pes: number; nota?: string };

export function Cicle({ trams, files }: { trams: Tram[]; files: Fila[] }) {
  const [filtre, setFiltre] = useState<Estat | null>(null);
  const visibles = filtre ? files.filter((f) => f.estat === filtre) : files;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
        {trams
          .filter((t) => t.pes > 0)
          .map((t) => (
            <div
              key={t.estat}
              className={cn("h-full transition-opacity", TO[t.estat], filtre && filtre !== t.estat && "opacity-30")}
              style={{ width: `${t.pes}%` }}
            />
          ))}
      </div>

      <div className="grid divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border sm:grid-cols-5 sm:divide-x sm:divide-y-0">
        {trams.map((t) => {
          const actiu = filtre === t.estat;
          return (
            <button
              key={t.estat}
              type="button"
              aria-pressed={actiu}
              disabled={t.n === 0}
              onClick={() => setFiltre(actiu ? null : t.estat)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50 sm:flex-col sm:items-start sm:gap-1 sm:py-3",
                actiu && "bg-surface-hover"
              )}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
                <EstatDot estat={t.estat} />
                <span className={cn("truncate text-caption", actiu ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {t.estat}
                </span>
              </span>
              <span className="font-mono text-title-sm font-medium tabular-nums">{t.n}</span>
              <span className="w-24 text-right font-mono text-caption text-muted-foreground tabular-nums sm:w-auto sm:text-left">
                {t.import}
              </span>
              {t.nota && <span className="hidden text-caption text-brand-text sm:block">{t.nota}</span>}
            </button>
          );
        })}
      </div>

      <div className="@container flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
        {visibles.map((f) => (
          <FilaCert key={f.id} f={f} />
        ))}
      </div>
    </div>
  );
}
