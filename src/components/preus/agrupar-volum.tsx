"use client";

import Link from "next/link";
import { CheckIcon, FileTextIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  files: { obra: string; obraHref?: string; mesos: string; volum: string }[];
  industrials: string[];
}) {
  const [obert, setObert] = useState(false);
  const [preparat, setPreparat] = useState(false);
  const [seleccio, setSeleccio] = useState(industrials);
  const [destinataris, setDestinataris] = useState<string[]>([]);

  return (
    <Card className="min-w-0 rounded-card ring-surface-border">
      <CardHeader><CardTitle>Agrupar volum</CardTitle><CardDescription>{resum}</CardDescription></CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1"><span className="font-mono text-display font-medium tracking-tight text-brand-text tabular-nums">{estalvi}</span><span className="font-mono text-label text-muted-foreground tabular-nums">{preuActual} → {preuObjectiu} · −{descompte}</span></div>
        <div className="flex flex-col rounded-tile bg-surface-inset p-1">
          {files.map((f) => <div key={f.obra} className="flex items-baseline justify-between gap-3 rounded-lg px-2.5 py-2"><div className="flex min-w-0 flex-col">{f.obraHref ? <Link href={f.obraHref} className="truncate text-label hover:text-brand-text hover:underline">{f.obra}</Link> : <span className="truncate text-label">{f.obra}</span>}<span className="text-caption text-muted-foreground">{f.mesos}</span></div><span className="shrink-0 font-mono text-label tabular-nums">{f.volum}</span></div>)}
        </div>
        {preparat && <div role="status" className="flex items-start gap-2 rounded-tile bg-brand-soft px-3 py-2.5 text-label"><CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-text" /><div className="flex min-w-0 flex-col"><span className="font-medium">Esborrany preparat · {destinataris.length} industrials</span><span className="text-caption text-muted-foreground">Pendent d&apos;enviament</span></div></div>}
        <Button variant={preparat ? "outline" : "default"} className="w-full" onClick={() => { setSeleccio(preparat ? destinataris : industrials); setObert(true); }}><FileTextIcon />{preparat ? "Revisar sol·licitud" : "Demanar preu per volum"}</Button>
      </CardContent>
      <Dialog open={obert} onOpenChange={setObert}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Sol·licitud de preu per volum</DialogTitle><DialogDescription>{resum} · objectiu {preuObjectiu}</DialogDescription></DialogHeader>
          <fieldset className="flex flex-col gap-1"><legend className="mb-2 text-label font-medium">Industrials</legend>{industrials.map((nom) => <label key={nom} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-body hover:bg-surface-hover"><input type="checkbox" className="size-4 accent-brand" checked={seleccio.includes(nom)} onChange={(e) => setSeleccio((actual) => e.target.checked ? [...actual, nom] : actual.filter((n) => n !== nom))} />{nom}</label>)}</fieldset>
          <div className="rounded-tile bg-surface-inset p-4 text-body"><p className="mb-2 font-medium">Petició d&apos;oferta conjunta</p><p>Us demanem la vostra millor oferta per al volum següent, amb un preu objectiu de {preuObjectiu}.</p><ul className="mt-3 space-y-2">{files.map((f) => <li key={f.obra}><span className="font-medium">{f.obra}</span> · {f.volum}<br /><span className="text-caption text-muted-foreground">{f.mesos}</span></li>)}</ul><p className="mt-3">Indiqueu termini de subministrament, transport i condicions de pagament.</p></div>
          <DialogFooter><Button variant="outline" onClick={() => setObert(false)}>Cancel·lar</Button><Button disabled={seleccio.length === 0} onClick={() => { setDestinataris(seleccio); setPreparat(true); setObert(false); }}>Desar esborrany</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
