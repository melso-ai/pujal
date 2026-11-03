"use client";

import { AlertTriangleIcon, CheckIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { discrepancies } from "@/lib/data";
import { eur } from "@/lib/format";

export function DiscrepanciesEstudi() {
  const [revisades, setRevisades] = useState<Record<string, string>>({});
  const [actual, setActual] = useState<(typeof discrepancies)[number] | null>(null);
  const [nota, setNota] = useState("");
  const pendents = discrepancies.length - Object.keys(revisades).length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Discrepàncies detectades</CardTitle>
          <CardDescription>Amidaments vs plànols i memòria</CardDescription>
          <CardAction>
            <Badge variant={pendents ? "destructive" : "secondary"}>
              {pendents ? <AlertTriangleIcon data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}
              {pendents} pendents
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-surface-border">
          {discrepancies.map((d) => (
            <div key={d.partida} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1 basis-48">
                <p className="text-body font-medium">{d.partida}</p>
                <p className="text-caption text-muted-foreground">{d.detall}</p>
                {revisades[d.partida] && <p className="mt-1 text-caption text-success">{revisades[d.partida]}</p>}
              </div>
              <span className="font-mono text-label tabular-nums">{eur(d.impacte)}</span>
              <Button size="sm" variant="outline" onClick={() => {
                setActual(d);
                setNota(revisades[d.partida] ?? "");
              }}>
                {revisades[d.partida] ? "Editar revisió" : "Revisar"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <Dialog open={!!actual} onOpenChange={(open) => { if (!open) setActual(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actual?.partida}</DialogTitle>
            <DialogDescription>{actual?.detall} · impacte {eur(actual?.impacte ?? 0)}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!actual || !nota.trim()) return;
            setRevisades((r) => ({ ...r, [actual.partida]: nota.trim() }));
            setActual(null);
          }} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="revisio-nota">Resolució de Jennifer</Label>
              <Textarea id="revisio-nota" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ajust d'amidament o criteri acordat amb l'arquitecte" required autoFocus />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setActual(null)}>Cancel·lar</Button>
              <Button type="submit" disabled={!nota.trim()}>Desar revisió</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
