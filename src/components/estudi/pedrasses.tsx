import { CheckIcon, FileSpreadsheetIcon, FileTextIcon } from "lucide-react";

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
  familiesSenseOferta,
  installacionsPedrasses,
  partides,
  zones,
} from "@/lib/estudi-run";
import { num } from "@/lib/format";

export function DocumentacioPedrasses() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
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
                <span key={f} className="flex min-w-0 items-center gap-2 text-caption text-muted-foreground">
                  <Icona className="size-3.5 shrink-0" />
                  <span className="truncate" title={f}>
                    {f}
                  </span>
                </span>
              );
            })}
            {z.fitxers > 4 && (
              <span className="text-caption text-faint-foreground">+{z.fitxers - 4} més</span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PartidesPedrasses() {
  return (
    <div className="flex flex-col gap-4">
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Codi</TableHead>
                <TableHead>Capítol</TableHead>
                <TableHead className="hidden md:table-cell">Exemples</TableHead>
                <TableHead className="text-right">Partides</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capitolsPedrasses.map((c) => (
                <TableRow key={c.codi}>
                  <TableCell className="font-mono text-muted-foreground">{c.codi}</TableCell>
                  <TableCell className="font-medium">{c.nom}</TableCell>
                  <TableCell className="hidden max-w-80 truncate text-muted-foreground md:table-cell">
                    {c.exemples.join(" · ")}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{c.partides}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
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
                    <TableCell>
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
