"use client";

import { FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { date, eur } from "@/lib/format";
import type { OfertaPedrasses } from "@/lib/industrials";

export function OfertaResum({ oferta: o }: { oferta: OfertaPedrasses }) {
  return (
    <Dialog>
      <div className="mt-auto flex min-w-0 flex-wrap items-center justify-between gap-2">
        <span className="min-w-0 flex-1 truncate text-caption text-muted-foreground" title={o.fitxer}>{o.fitxer}</span>
        <DialogTrigger render={<Button variant="outline" size="sm" />}><FileTextIcon />Veure resum</DialogTrigger>
      </div>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle className="break-words pr-6 leading-snug">{o.industrial} · {("numero" in o && o.numero) || "Oferta"}</DialogTitle><DialogDescription>{o.familiaNom} · Xalets Les Pedrasses · {o.habitatges}</DialogDescription></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-2 rounded-tile bg-surface-inset p-4"><span className="font-mono text-display-sm tabular-nums">{o.baseImposable === null ? "Import pendent de revisar" : eur(o.baseImposable)}</span><span className="text-caption text-muted-foreground">Base imposable{o.data ? ` · ${date(o.data)}` : ""}</span></div>
          <p className="text-body">{o.abast}</p>
          {o.condicions.length > 0 && <section className="flex flex-col gap-2"><h3 className="text-label font-medium">Condicions</h3><ul className="list-disc space-y-1 pl-4 text-body text-muted-foreground">{o.condicions.map((c) => <li key={c}>{c}</li>)}</ul></section>}
          {o.exclusions.length > 0 && <section className="flex flex-col gap-2"><h3 className="text-label font-medium text-warning">No inclou</h3><ul className="list-disc space-y-1 pl-4 text-body text-muted-foreground">{o.exclusions.map((c) => <li key={c}>{c}</li>)}</ul></section>}
          <span className="break-all text-caption text-muted-foreground">Font: {o.fitxer}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
