"use client";

import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { FilaCert, type Fila } from "@/components/certificacions/estat";
import { cn } from "@/lib/utils";

export type Mes = { mes: string; label: string; total: string; resum: string; pendent?: string; files: Fila[] };

export function MesosAnteriors({ mesos }: { mesos: Mes[] }) {
  const [obert, setObert] = useState<string | null>(null);

  return (
    <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
      {mesos.map((m) => {
        const actiu = obert === m.mes;
        return (
          <div key={m.mes} className="@container flex flex-col">
            <button
              type="button"
              aria-expanded={actiu}
              onClick={() => setObert(actiu ? null : m.mes)}
              className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
            >
              <ChevronRightIcon
                className={cn("size-4 shrink-0 text-muted-foreground transition-transform", actiu && "rotate-90")}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body font-medium">{m.label}</span>
                <span className="truncate text-caption text-muted-foreground">
                  {m.resum}
                  {m.pendent && <span className="text-warning"> · {m.pendent}</span>}
                </span>
              </div>
              <span className="shrink-0 font-mono text-label tabular-nums">{m.total}</span>
            </button>
            {actiu && (
              <div className="flex flex-col divide-y divide-surface-border border-t border-surface-border bg-surface-inset/50 duration-200 animate-in fade-in slide-in-from-top-1">
                {m.files.map((f) => (
                  <FilaCert key={f.id} f={f} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
