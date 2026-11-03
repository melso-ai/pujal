"use client";

import { CheckIcon, HourglassIcon, SendIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { familiesSenseOferta, partides } from "@/lib/estudi-run";

export function PendentPreus({ que }: { que: string }) {
  const [enviades, setEnviades] = useState(false);

  return (
    <div className="flex max-w-xl flex-col gap-4 rounded-card bg-card p-5 shadow-[var(--surface-shadow)] ring-1 ring-surface-border">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-inset text-warning">
          <HourglassIcon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-body font-medium">{que} pendent de preus d&apos;estructura</span>
          <span className="text-caption text-muted-foreground">
            {partides.estructura} partides sense cap oferta
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {familiesSenseOferta.map((f) => (
          <Badge key={f.codi} variant="outline">
            <span className="font-mono text-muted-foreground">{f.codi}</span>
            {f.nom}
          </Badge>
        ))}
      </div>
      <div>
        {enviades ? (
          <Badge className="bg-success/15 text-success">
            <CheckIcon data-icon="inline-start" />
            {familiesSenseOferta.length} sol·licituds enviades
          </Badge>
        ) : (
          <Button onClick={() => setEnviades(true)}>
            <SendIcon data-icon="inline-start" />
            Demanar ofertes d&apos;estructura
          </Button>
        )}
      </div>
    </div>
  );
}
