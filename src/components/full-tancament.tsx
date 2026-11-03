"use client";

import { useState } from "react";
import { CheckIcon, RotateCcwIcon, SaveIcon, SendIcon } from "lucide-react";

import { preuTancament, useTancament, type VariablesTancament } from "@/components/estudi/tancament-store";
import { Button } from "@/components/ui/button";

import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  costPersonaMes,
  despesesGenerals,
  indirectesMensuals,
} from "@/lib/data";
import { eur, pct } from "@/lib/format";

export function FullTancament({ estudiId = "placa-major", preuInicial = 4_104_000 }: { estudiId?: string; preuInicial?: number }) {
  const { values, save } = useTancament(estudiId, preuInicial);
  const [missatge, setMissatge] = useState("");
  return <CalculTancament key={JSON.stringify(values)} inicial={values} save={save} preuInicial={preuInicial} missatge={missatge} setMissatge={setMissatge} />;
}

function CalculTancament({ inicial, save, preuInicial, missatge, setMissatge }: {
  inicial: VariablesTancament;
  save: (v: VariablesTancament) => boolean;
  preuInicial: number;
  missatge: string;
  setMissatge: (message: string) => void;
}) {
  const [mesos, setMesos] = useState(inicial.mesos);
  const [persones, setPersones] = useState(inicial.persones);
  const [preuBase, setPreuBase] = useState(inicial.preuBase);
  const [acompanyar, setAcompanyar] = useState(inicial.acompanyar);
  const costDirecteEstudi = Math.round(preuInicial / 1.2);
  const variables = { mesos, persones, preuBase, acompanyar, revisio: inicial.revisio };
  const canviat = mesos !== inicial.mesos || persones !== inicial.persones || preuBase !== inicial.preuBase || acompanyar !== inicial.acompanyar;
  const valid = mesos >= 1 && persones >= 0 && preuBase > 0;
  const preu = preuTancament(variables);
  const indMensual = indirectesMensuals.reduce((s, i) => s + i.import, 0);
  const indirectes = mesos * indMensual + persones * mesos * costPersonaMes;
  const dg = preu * despesesGenerals;
  const benefici = preu - costDirecteEstudi - indirectes - dg;
  const k = preu / costDirecteEstudi;
  const net = preu > 0 ? (benefici / preu) * 100 : 0;
  const brut = preu > 0 ? ((preu - costDirecteEstudi - indirectes) / preu) * 100 : 0;
  const dinsObjectiu = brut >= 20;

  return (
    <div className="@container min-w-0">
    <div className="grid min-w-0 gap-4 @3xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Variables</CardTitle>
          <CardDescription>Mesos, persones i preu</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="mesos">Mesos d&apos;obra</Label>
            <Input
              id="mesos"
              type="number"
              min={1}
              value={mesos}
              onChange={(e) => setMesos(Math.max(0, Math.floor(Number(e.target.value)) || 0))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="persones">Persones a l&apos;obra</Label>
            <Input
              id="persones"
              type="number"
              min={0}
              value={persones}
              onChange={(e) => setPersones(Math.max(0, Math.floor(Number(e.target.value)) || 0))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="preu">Preu d&apos;oferta (€)</Label>
            <Input
              id="preu"
              type="number"
              step={1000}
              min={1}
              value={preuBase}
              onChange={(e) => setPreuBase(Math.max(0, Number(e.target.value)) || 0)}
            />
          </div>
          <Separator />
          <Label className="gap-3">
            <Checkbox
              checked={acompanyar}
              onCheckedChange={(v) => setAcompanyar(v === true)}
            />
            Acompanyar (+10%)
          </Label>
          {!valid && <p className="text-caption text-destructive" role="alert">Indica almenys 1 mes i un preu superior a 0 €.</p>}
        </CardContent>
        <CardFooter className="flex-wrap gap-2 border-t">
          <Button disabled={!valid} onClick={() => {
            if (save({ ...variables, revisio: false })) setMissatge("Variables desades · oferta actualitzada");
            else setMissatge("No s'ha pogut desar. Torna-ho a provar.");
          }}><SaveIcon data-icon="inline-start" />Desar</Button>
          <Button variant="ghost" aria-label="Restablir variables inicials" onClick={() => {
            setMesos(14); setPersones(3); setPreuBase(preuInicial); setAcompanyar(false);
            setMissatge("Variables restablertes · desa per aplicar-les");
          }}><RotateCcwIcon data-icon="inline-start" />Restablir</Button>
          {missatge && <p className="w-full text-caption text-muted-foreground" role="status">{missatge}</p>}
        </CardFooter>
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        <Card>
          <CardContent className="flex flex-wrap items-end gap-x-12 gap-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-caption text-muted-foreground">Marge brut</span>
              <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
                {valid ? pct(brut) : "—"}
              </span>
              <Badge variant="outline" className={dinsObjectiu ? "text-success" : "text-warning"}>
                {dinsObjectiu ? "Objectiu ≥20% assolit" : "Objectiu ≥20%"}
              </Badge>
            </div>
            <Stat label="K de pas" value={valid ? k.toFixed(2) : "—"} />
            <Stat label="Marge després de generals" value={valid ? pct(net) : "—"} />
            <Stat label="Preu d'oferta" value={eur(preu)} />
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-tile bg-surface-inset p-3">
          <span className="text-label text-muted-foreground">{canviat ? "Canvis sense desar" : inicial.revisio ? "Pendent de signatura · Benito" : "Jennifer · esborrany de tancament"}</span>
          <Button variant="outline" disabled={!valid || (inicial.revisio && !canviat)} onClick={() => {
            setMissatge(save({ ...variables, revisio: true }) ? "Revisió preparada per a Benito" : "No s'ha pogut desar. Torna-ho a provar.");
          }}>
            {inicial.revisio ? <CheckIcon data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            {inicial.revisio ? "Revisió preparada" : "Preparar per a Benito"}
          </Button>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepte</TableHead>
                  <TableHead className="text-right">Import</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-mono tabular-nums">
                <TableRow>
                  <TableCell className="font-sans">Cost directe</TableCell>
                  <TableCell className="text-right">{eur(costDirecteEstudi)}</TableCell>
                </TableRow>
                {indirectesMensuals.map((i) => (
                  <TableRow key={i.concepte}>
                    <TableCell className="whitespace-normal font-sans text-muted-foreground">
                      {i.concepte} · {mesos} mesos
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {eur(i.import * mesos)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="whitespace-normal font-sans text-muted-foreground">
                    Personal · {persones} × {mesos} mesos
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {eur(persones * mesos * costPersonaMes)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-sans">Indirectes</TableCell>
                  <TableCell className="text-right">{eur(indirectes)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-sans">
                    Despeses generals · {pct(despesesGenerals * 100, 0)}
                  </TableCell>
                  <TableCell className="text-right">{eur(dg)}</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter className="font-mono tabular-nums">
                <TableRow>
                  <TableCell className="font-sans">Benefici</TableCell>
                  <TableCell className="text-right">{eur(benefici)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
