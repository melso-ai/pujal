"use client";

import { useState } from "react";

import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
  costDirecteEstudi,
  costPersonaMes,
  despesesGenerals,
  indirectesMensuals,
} from "@/lib/data";
import { eur, pct } from "@/lib/format";

export function FullTancament() {
  const [mesos, setMesos] = useState(14);
  const [persones, setPersones] = useState(3);
  const [preuBase, setPreuBase] = useState(4_104_000);
  const [acompanyar, setAcompanyar] = useState(false);

  const preu = acompanyar ? Math.round(preuBase * 1.1) : preuBase;
  const indMensual = indirectesMensuals.reduce((s, i) => s + i.import, 0);
  const indirectes = mesos * indMensual + persones * mesos * costPersonaMes;
  const dg = preu * despesesGenerals;
  const benefici = preu - costDirecteEstudi - indirectes - dg;
  const k = preu / costDirecteEstudi;
  const net = (benefici / preu) * 100;
  const dinsObjectiu = net >= 2 && net <= 3.5;

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
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
              onChange={(e) => setMesos(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="persones">Persones a l&apos;obra</Label>
            <Input
              id="persones"
              type="number"
              min={0}
              value={persones}
              onChange={(e) => setPersones(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="preu">Preu d&apos;oferta (€)</Label>
            <Input
              id="preu"
              type="number"
              step={1000}
              value={preuBase}
              onChange={(e) => setPreuBase(Number(e.target.value) || 0)}
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
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="flex flex-wrap items-end gap-x-12 gap-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">K de pas</span>
              <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
                {k.toFixed(2)}
              </span>
            </div>
            <Stat
              label="Benefici net"
              value={pct(net)}
              hint={
                <Badge variant={dinsObjectiu ? "secondary" : "destructive"}>
                  {dinsObjectiu ? "Dins objectiu 2–3%" : "Fora d'objectiu"}
                </Badge>
              }
            />
            <Stat label="Preu d'oferta" value={eur(preu)} />
          </CardContent>
        </Card>

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
                    <TableCell className="font-sans text-muted-foreground">
                      {i.concepte} · {mesos} mesos
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {eur(i.import * mesos)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-sans text-muted-foreground">
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
  );
}
