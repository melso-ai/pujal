"use client";

import { CheckIcon, SendIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AgruparVolum({
  resum,
  estalvi,
  preuActual,
  preuObjectiu,
  descompte,
  files,
  industrials,
}: {
  resum: string;
  estalvi: string;
  preuActual: string;
  preuObjectiu: string;
  descompte: string;
  files: { obra: string; mesos: string; volum: string }[];
  industrials: string[];
}) {
  const [enviat, setEnviat] = useState(false);

  return (
    <Card className="rounded-card ring-surface-border">
      <CardHeader>
        <CardTitle>Agrupar volum</CardTitle>
        <CardDescription>{resum}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-display font-medium tracking-tight text-brand-text tabular-nums">
            {estalvi}
          </span>
          <span className="font-mono text-label text-muted-foreground tabular-nums">
            {preuActual} → {preuObjectiu} · −{descompte}
          </span>
        </div>

        <div className="flex flex-col rounded-tile bg-surface-inset p-1">
          {files.map((f) => (
            <div key={f.obra} className="flex items-baseline justify-between gap-3 rounded-lg px-2.5 py-1.5">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-label">{f.obra}</span>
                <span className="text-caption text-muted-foreground">{f.mesos}</span>
              </div>
              <span className="shrink-0 font-mono text-label tabular-nums">{f.volum}</span>
            </div>
          ))}
        </div>

        {enviat ? (
          <div className="flex items-start gap-2 rounded-tile bg-brand-soft px-3 py-2.5 text-label">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-text" />
            <div className="flex flex-col">
              <span className="font-medium">Sol·licitud enviada a {industrials.length} industrials</span>
              <span className="text-caption text-muted-foreground">{industrials.join(" · ")}</span>
            </div>
          </div>
        ) : (
          <Button className="w-full" onClick={() => setEnviat(true)}>
            <SendIcon data-icon="inline-start" />
            Demanar preu per volum
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
