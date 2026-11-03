"use client";

import { CheckIcon, PrinterIcon, SendIcon } from "lucide-react";
import { useState } from "react";

import { preuTancament, useTancament } from "@/components/estudi/tancament-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { eur } from "@/lib/format";

const escape = (text: string) => text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function OfertaEstudi({ id, nom, preuInicial }: { id: string; nom: string; preuInicial: number }) {
  const { values } = useTancament(id, preuInicial);
  const preu = preuTancament(values);
  const igi = preu * 0.045;
  const [obert, setObert] = useState(false);
  const [enviat, setEnviat] = useState(false);
  const [correu, setCorreu] = useState("");
  const [error, setError] = useState("");

  const imprimir = () => {
    const finestra = window.open("", "_blank", "width=800,height=900");
    if (!finestra) { setError("Permet les finestres emergents per obrir l'oferta imprimible."); return; }
    finestra.opener = null;
    finestra.document.write(`<!doctype html><html lang="ca"><head><meta charset="utf-8"><title>Oferta · ${escape(nom)}</title><style>body{font:15px system-ui;color:#171717;max-width:760px;margin:60px auto;padding:24px}h1{font-size:30px}table{width:100%;border-collapse:collapse;margin:32px 0}td{padding:14px 0;border-bottom:1px solid #ddd}td:last-child{text-align:right;font-variant-numeric:tabular-nums}small{color:#666}button{padding:12px 18px;border:1px solid #ddd;background:white;border-radius:8px;cursor:pointer}@media print{button{display:none}}</style></head><body><small>Construccions Pujal · Sant Julià de Lòria · Des de 1906</small><h1>${escape(nom)}</h1><p>Oferta econòmica · esborrany de demostració</p><table><tr><td>Base imposable</td><td>${escape(eur(preu))}</td></tr><tr><td>IGI 4,5%</td><td>${escape(eur(igi))}</td></tr><tr><td><strong>Total</strong></td><td><strong>${escape(eur(preu + igi))}</strong></td></tr></table><p>Pagament a 60 dies · Retenció del 5% durant 12 mesos · Validesa de 30 dies</p><p>Preparada per Jennifer · Pendent de signatura de Benito</p><button onclick="window.print()">Imprimir / desar PDF</button></body></html>`);
    finestra.document.close();
    finestra.focus();
    setError("");
  };

  return (
    <>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Oferta al client</CardTitle>
          <CardDescription>{nom}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 font-mono text-body tabular-nums">
          <div className="flex justify-between gap-3"><span className="font-sans text-muted-foreground">Base imposable</span><span>{eur(preu)}</span></div>
          <div className="flex justify-between gap-3"><span className="font-sans text-muted-foreground">IGI 4,5%</span><span>{eur(igi)}</span></div>
          <Separator />
          <div className="flex justify-between gap-3 text-title-sm font-medium"><span className="font-sans">Total</span><span>{eur(preu + igi)}</span></div>
          <div className="flex flex-wrap gap-2 pt-2 font-sans">
            <Badge variant="outline">Pagament 60 dies</Badge>
            <Badge variant="outline">Retenció 5% · 12 mesos</Badge>
            <Badge variant="outline">Validesa 30 dies</Badge>
          </div>
          <p className="font-sans text-caption text-muted-foreground">{enviat ? `Enviament de prova registrat · ${correu}` : values.revisio ? "Pendent de signatura · Benito" : "Esborrany · pendent de revisió del tancament"}</p>
        </CardContent>
        <CardFooter className="flex-wrap gap-2 border-t">
          <Button onClick={() => setObert(true)}>
            {enviat ? <CheckIcon data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            {enviat ? "Revisar enviament" : "Preparar enviament"}
          </Button>
          <Button variant="outline" onClick={imprimir}><PrinterIcon data-icon="inline-start" />Imprimir / PDF</Button>
          {error && <p className="w-full text-caption text-destructive" role="alert">{error}</p>}
        </CardFooter>
      </Card>
      <Dialog open={obert} onOpenChange={setObert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preparar oferta</DialogTitle>
            <DialogDescription>{nom} · {eur(preu + igi)} amb IGI</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setEnviat(true); setObert(false); }}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="oferta-correu">Correu del client</Label>
              <Input id="oferta-correu" type="email" placeholder="client@empresa.ad" required value={correu} onChange={(e) => setCorreu(e.target.value)} autoFocus />
            </div>
            <div className="rounded-tile bg-surface-inset p-3 text-caption text-muted-foreground">Enviament de prova · no s&apos;envia cap correu. La signatura de Benito queda pendent.</div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setObert(false)}>Cancel·lar</Button>
              <Button type="submit">Registrar enviament de prova</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
