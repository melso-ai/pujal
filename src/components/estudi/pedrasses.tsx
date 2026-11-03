"use client";

import Link from "next/link";
import { useState } from "react";

import { CheckIcon, FileSpreadsheetIcon, FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  capitolsPedrasses,
  cobertura,
  familiesSenseOferta,
  installacionsPedrasses,
  partides,
  zones,
} from "@/lib/estudi-run";
import { eur, num } from "@/lib/format";

export function DocumentacioPedrasses() {
  const [fitxer, setFitxer] = useState<{ nom: string; carpeta: string } | null>(null);
  const oferta = cobertura.flatMap((c) => c.ofertes).find((o) => o.fitxer === fitxer?.nom);
  return (
    <>
    <div className="@container">
    <div className="grid gap-3 @2xl:grid-cols-3">
      {zones.map((z) => (
        <Card key={z.id} size="sm">
          <CardHeader>
            <CardTitle>{z.nom}</CardTitle>
            <CardDescription className="font-mono">
              {z.carpeta} · {z.fitxers} fitxers
              {z.industrials && ` · ${z.industrials} industrials`}
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">
                <CheckIcon data-icon="inline-start" />
                Llegit
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            {z.exemples.slice(0, 4).map((f) => {
              const Icona = f.toLowerCase().endsWith(".xlsx") ? FileSpreadsheetIcon : FileTextIcon;
              return (
                <button key={f} type="button" onClick={() => setFitxer({ nom: f, carpeta: z.nom })} className="flex min-w-0 items-center gap-2 rounded-lg py-1 text-left text-caption text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
                  <Icona className="size-3.5 shrink-0" />
                  <span className="truncate" title={f}>{f}</span>
                </button>
              );
            })}
            {z.fitxers > 4 && (
              <span className="text-caption text-faint-foreground">+{z.fitxers - 4} més</span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
    </div>
    <Dialog open={!!fitxer} onOpenChange={(open) => { if (!open) setFitxer(null); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6 leading-snug break-words">{fitxer?.nom}</DialogTitle>
          <DialogDescription>{fitxer?.carpeta} · resum extret del document</DialogDescription>
        </DialogHeader>
        {oferta ? (
          <div className="flex flex-col gap-3">
            <p className="text-body font-medium">{oferta.industrial} · {oferta.habitatges}</p>
            <span className="font-mono text-display-sm tabular-nums">{oferta.baseImposable === null ? "Sense import" : eur(oferta.baseImposable)}</span>
            <p className="text-label text-muted-foreground">{oferta.abast}</p>
            {oferta.exclusions.length > 0 && <p className="text-caption text-warning">Exclou: {oferta.exclusions.join(" · ")}</p>}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{partides.arquitectura} partides d&apos;arquitectura</Badge>
            <Badge variant="outline">{partides.estructura} d&apos;estructura</Badge>
            <Badge variant="outline">{partides.installacionsH1 + partides.installacionsH2} d&apos;instal·lacions</Badge>
          </div>
        )}
        <Button nativeButton={false} variant="outline" render={<Link href={`/pressupostos/pedrasses#${oferta ? "comparatiu" : "partides"}`} />} onClick={() => setFitxer(null)}>
          {oferta ? "Veure al comparatiu" : "Consultar partides"}
        </Button>
      </DialogContent>
    </Dialog>
    </>
  );
}

export function PartidesPedrasses() {
  const [cerca, setCerca] = useState("");
  const capitols = capitolsPedrasses.filter((c) => `${c.codi} ${c.nom} ${c.exemples.join(" ")}`.toLocaleLowerCase("ca").includes(cerca.toLocaleLowerCase("ca")));
  return (
    <div className="@container flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap gap-x-10 gap-y-3">
        {[
          { label: "Total", valor: partides.total },
          { label: "Arquitectura", valor: partides.arquitectura },
          { label: "Estructura", valor: partides.estructura },
          { label: "Instal·lacions H1", valor: partides.installacionsH1 },
          { label: "Instal·lacions H2", valor: partides.installacionsH2 },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <span className="text-caption text-muted-foreground">{s.label}</span>
            <span className="font-mono text-title-sm font-medium tabular-nums">{num(s.valor)}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arquitectura</CardTitle>
          <CardDescription>
            {partides.arquitectura} partides · {partides.capitolsArquitectura} capítols
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-3">
          <Input aria-label="Cercar capítols d'arquitectura" placeholder="Cercar codi o capítol…" value={cerca} onChange={(e) => setCerca(e.target.value)} />
          {capitols.length === 0 && <div className="rounded-tile bg-surface-inset p-5 text-center"><p className="text-body">Cap capítol coincideix amb «{cerca}»</p><Button variant="ghost" onClick={() => setCerca("")}>Netejar cerca</Button></div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Codi</TableHead>
                <TableHead>Capítol</TableHead>
                <TableHead className="hidden @3xl:table-cell">Exemples</TableHead>
                <TableHead className="text-right">Partides</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capitols.map((c) => (
                <TableRow key={c.codi}>
                  <TableCell className="font-mono text-muted-foreground">{c.codi}</TableCell>
                  <TableCell className="max-w-48 whitespace-normal font-medium"><details><summary className="cursor-pointer rounded-sm py-1 focus-visible:outline-2 focus-visible:outline-ring">{c.nom}</summary><ul className="mt-2 space-y-1 text-caption font-normal text-muted-foreground">{c.exemples.map((e) => <li key={e}>{e}</li>)}</ul></details></TableCell>
                  <TableCell className="hidden max-w-80 truncate text-muted-foreground @3xl:table-cell">
                    {c.exemples.join(" · ")}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{c.partides}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Estructura</CardTitle>
            <CardDescription>{partides.estructura} partides</CardDescription>
            <CardAction>
              <Badge variant="outline" className="text-warning">
                Sense ofertes
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {familiesSenseOferta.map((f) => (
              <Badge key={f.codi} variant="outline">
                <span className="font-mono text-muted-foreground">{f.codi}</span>
                {f.nom}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instal·lacions</CardTitle>
            <CardDescription>
              Engix · {partides.installacionsH1 + partides.installacionsH2} partides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sistema</TableHead>
                  <TableHead className="text-right">H1</TableHead>
                  <TableHead className="text-right">H2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installacionsPedrasses.map((i) => (
                  <TableRow key={i.codi}>
                    <TableCell className="whitespace-normal">
                      <span className="mr-2 font-mono text-muted-foreground">{i.codi}</span>
                      {i.nom}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{i.h1}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{i.h2}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {partides.installacionsH1}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {partides.installacionsH2}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
