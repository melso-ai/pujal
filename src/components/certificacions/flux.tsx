"use client";

import { BanknoteIcon, ReceiptIcon, SendIcon, SignatureIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";

import { PASSOS, TO } from "@/components/certificacions/estat";
import { AskAction } from "@/components/chat/ask-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Estat } from "@/lib/certificacions";
import { cn } from "@/lib/utils";

type Dates = Partial<Record<"preparada" | "enviada" | "signada" | "facturada" | "cobrada", string>>;

export type Factura = {
  num: string;
  data: string;
  venciment: string;
  client: string;
  concepte: string;
  ute?: string;
  linies: { label: string; value: string }[];
  total: string;
};

export function Flux({
  estat: inicial,
  dates: datesInicials,
  avui,
  capObra,
  signant,
  factura,
  revisar,
  produccio,
}: {
  estat: Estat;
  dates: Dates;
  avui: string;
  capObra: string;
  signant: string;
  factura: Factura;
  revisar: string;
  produccio: string;
}) {
  const [estat, setEstat] = useState(inicial);
  const [d, setD] = useState(datesInicials);
  const [obert, setObert] = useState(false);

  const signada = !!d.signada;
  const emesa = estat === "Facturada" || estat === "Cobrada";
  const idx = PASSOS.indexOf(estat);
  const fet = (i: number) => i < idx || (i === idx && (estat === "Cobrada" || (estat === "Arquitecte" && signada)));

  const pas = (e: Estat, camp: keyof Dates) => {
    setEstat(e);
    setD((x) => ({ ...x, [camp]: avui }));
  };

  const [titol, linia] = {
    Producció: ["Producció en curs", capObra],
    Certificació: ["Llesta per enviar", `Preparada per ${capObra} · ${d.preparada}`],
    Arquitecte: signada
      ? ["Signada", `${signant} · ${d.signada}`]
      : ["Pendent de signar", `Enviada a ${signant} · ${d.enviada}`],
    Facturada: ["Facturada", `${factura.num} · ${d.facturada}`],
    Cobrada: ["Cobrada", `${factura.num} · ${d.cobrada}`],
  }[estat];

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-label font-medium">{titol}</span>
          <span className="truncate text-caption text-muted-foreground">{linia}</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {PASSOS.map((p, i) => (
            <div
              key={p}
              className={cn(
                "h-1.5 rounded-full transition-colors",
                fet(i) ? (estat === "Cobrada" ? TO.Cobrada : "bg-foreground") : i === idx ? TO[estat] : "bg-muted"
              )}
            />
          ))}
        </div>
        <div className="hidden grid-cols-5 gap-1 sm:grid">
          {PASSOS.map((p, i) => (
            <span
              key={p}
              className={cn("truncate text-caption", i === idx ? "font-medium text-foreground" : "text-muted-foreground")}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {estat === "Producció" && (
          <AskAction size="sm" className="rounded-full" prompt={produccio}>
            <SendIcon />
            Demanar la producció
          </AskAction>
        )}
        {estat === "Certificació" && (
          <Button size="sm" className="rounded-full" onClick={() => pas("Arquitecte", "enviada")}>
            <SendIcon />
            Enviar a l&apos;arquitecte
          </Button>
        )}
        {estat === "Arquitecte" && !signada && (
          <Button size="sm" className="rounded-full" onClick={() => setD((x) => ({ ...x, signada: avui }))}>
            <SignatureIcon />
            Marcar signada
          </Button>
        )}
        {estat === "Arquitecte" && signada && (
          <Button size="sm" className="rounded-full" onClick={() => setObert(true)}>
            <ReceiptIcon />
            Generar factura
          </Button>
        )}
        {emesa && (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setObert(true)}>
            <ReceiptIcon />
            Veure factura
          </Button>
        )}
        {estat === "Facturada" && (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => pas("Cobrada", "cobrada")}>
            <BanknoteIcon />
            Marcar cobrada
          </Button>
        )}
        <AskAction size="sm" variant="outline" className="rounded-full" prompt={revisar}>
          <SparklesIcon />
          Revisar amb IA
        </AskAction>
      </div>

      <Dialog open={obert} onOpenChange={setObert}>
        <DialogContent className="gap-5 sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 pr-8">
              <DialogTitle className="font-mono">{factura.num}</DialogTitle>
              <Badge variant={emesa ? "secondary" : "outline"}>{emesa ? "Emesa" : "Esborrany"}</Badge>
            </div>
            <DialogDescription>
              {factura.data} · venç {factura.venciment}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 text-caption">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-muted-foreground">De</span>
              <span className="text-label">Construccions Pujal, SA</span>
              <span className="text-muted-foreground">Sant Julià de Lòria</span>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-muted-foreground">A</span>
              <span className="text-label">{factura.client}</span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 text-caption">
            <span className="text-muted-foreground">Concepte</span>
            <span className="text-label">{factura.concepte}</span>
            {factura.ute && <span className="text-muted-foreground">{factura.ute}</span>}
          </div>

          <dl className="flex flex-col gap-2 rounded-tile bg-surface-inset p-3 text-label">
            {factura.linies.map((l) => (
              <div key={l.label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{l.label}</dt>
                <dd className="font-mono tabular-nums">{l.value}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-surface-border pt-2 text-body font-medium">
              <dt>Total a cobrar</dt>
              <dd className="font-mono tabular-nums">{factura.total}</dd>
            </div>
          </dl>

          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <SignatureIcon className="size-3.5 shrink-0" />
            <span className="truncate">
              Signada per {signant} · {d.signada ?? avui}
            </span>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Tancar</DialogClose>
            {!emesa && <Button onClick={() => pas("Facturada", "facturada")}>Emetre factura</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
