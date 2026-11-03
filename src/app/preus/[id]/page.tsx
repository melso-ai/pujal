import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { AgruparVolum } from "@/components/preus/agrupar-volum";
import { PriceHistoryChart } from "@/components/preus/price-history-chart";
import { TendenciaBadge } from "@/components/preus/preus-table";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { date, eur, pct } from "@/lib/format";
import {
  elements,
  mesosLabel,
  pctSigne,
  preu,
  preusTancats,
  PREVISIO,
  rankingIndustrials,
  resumElement,
  seriePerIndustrial,
  volumLabel,
} from "@/lib/preus";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return elements.map((e) => ({ id: e.id }));
}

const TANCAMENTS_VISIBLES = 12;

export default function ElementPage(props: PageProps<"/preus/[id]">) {
  return (
    <Suspense fallback={null}>
      <Element params={props.params} />
    </Suspense>
  );
}

async function Element({ params }: { params: PageProps<"/preus/[id]">["params"] }) {
  const { id } = await params;
  const r = resumElement(id);
  if (!r) notFound();

  const tancats = preusTancats(id);
  const ranking = rankingIndustrials(id);
  const { rows, industrials } = seriePerIndustrial(id);
  const unitat = `/${r.unitat}`;

  return (
    <>
      <PageHeader crumbs={[{ label: "Preus", href: "/preus" }, { label: r.nom }]} />

      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{r.capitol}</Badge>
            <Badge variant="outline" className="font-mono">
              {r.unitat}
            </Badge>
          </div>
          <h1 className="text-display-sm font-semibold tracking-tight">{r.nom}</h1>
          <p className="text-body text-muted-foreground">
            {tancats.length} preus tancats · {r.nObres} obres · {industrials.length} industrials
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
          <div className="flex flex-col gap-1">
            <span className="text-caption text-muted-foreground">Preu de referència per a estudis</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
                {preu(r.referencia)}
              </span>
              <span className="font-mono text-title-sm text-muted-foreground">{unitat}</span>
            </div>
            <span className="font-mono text-caption text-muted-foreground tabular-nums">
              Mediana 6 mesos · {preu(r.rang[0])} – {preu(r.rang[1])} · {r.tancaments6} preus
            </span>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 lg:justify-end">
            <Stat label="Últim tancat" value={preu(r.ultimPreu)} hint={`${date(r.ultimaData)} · ${r.ultimIndustrial}`} />
            <Stat
              label="Tendència 6m"
              value={<TendenciaBadge valor={r.tendencia} label={r.tendencia === null ? "" : pctSigne(r.tendencia)} />}
            />
            <Stat label="Millor industrial" value={preu(r.millorPreu)} hint={r.millorIndustrial} />
            <Stat label="Pagat de més · 12m" value={eur(r.sobrecost12)} hint="vs. millor industrial" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="rounded-card ring-surface-border">
            <CardHeader>
              <CardTitle>Preus tancats per industrial</CardTitle>
              <CardDescription>Mitjana mensual{unitat}</CardDescription>
            </CardHeader>
            <CardContent>
              <PriceHistoryChart rows={rows} industrials={industrials} referencia={r.referencia} />
            </CardContent>
          </Card>

          {r.agrupar.volum > 0 ? (
            <AgruparVolum
              resum={`${r.agrupar.nObres} ${r.agrupar.nObres === 1 ? "obra" : "obres"} · ${volumLabel(r.agrupar.volum, r.unitat)} en ${PREVISIO.length} mesos`}
              estalvi={eur(r.agrupar.estalvi)}
              preuActual={preu(r.referencia)}
              preuObjectiu={preu(r.agrupar.preuObjectiu)}
              descompte={pct(r.agrupar.descompte * 100)}
              files={r.agrupar.files.map((f) => ({
                obra: f.obra,
                mesos: mesosLabel(f.mesos),
                volum: volumLabel(f.volum, r.unitat),
              }))}
              industrials={r.industrials}
            />
          ) : (
            <Card className="rounded-card ring-surface-border">
              <CardHeader>
                <CardTitle>Agrupar volum</CardTitle>
                <CardDescription>Cap volum previst en {PREVISIO.length} mesos</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-title-sm font-semibold">Industrials</h2>
          <div className="overflow-x-auto rounded-xl ring-1 ring-surface-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Industrial</TableHead>
                  <TableHead className="text-right">Preu mitjà 12m</TableHead>
                  <TableHead className="text-right">Últim</TableHead>
                  <TableHead className="text-right">Obres</TableHead>
                  <TableHead className="pr-4 text-right">Preus tancats</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((ind, i) => (
                  <TableRow key={ind.industrial}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ind.industrial}</span>
                        {i === 0 && (
                          <Badge variant="secondary" className="bg-brand-soft text-brand-text">
                            Millor
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{preu(ind.preuMitja)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono tabular-nums">{preu(ind.ultimPreu)}</span>
                        <span className="text-caption text-muted-foreground">{date(ind.ultimaData)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{ind.nObres}</TableCell>
                    <TableCell className="pr-4 text-right font-mono tabular-nums">{ind.tancaments}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-title-sm font-semibold">Últims preus tancats</h2>
            <span className="text-caption text-muted-foreground">
              {Math.min(TANCAMENTS_VISIBLES, tancats.length)} de {tancats.length}
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl ring-1 ring-surface-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Data</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Industrial</TableHead>
                  <TableHead>Cap d&apos;obra</TableHead>
                  <TableHead className="text-right">Volum</TableHead>
                  <TableHead className="pr-4 text-right">Preu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tancats.slice(0, TANCAMENTS_VISIBLES).map((p, i) => {
                  const delta = ((p.preu - r.referencia) / r.referencia) * 100;
                  return (
                    <TableRow key={`${p.data}-${p.obraId}-${i}`}>
                      <TableCell className="pl-4 text-muted-foreground">{date(p.data)}</TableCell>
                      <TableCell>{p.obra}</TableCell>
                      <TableCell>{p.industrial}</TableCell>
                      <TableCell className="text-muted-foreground">{p.capObra}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {volumLabel(p.volum, r.unitat)}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={cn(
                              "font-mono text-caption tabular-nums",
                              delta > 2 ? "text-warning" : delta < -2 ? "text-success" : "text-muted-foreground"
                            )}
                          >
                            {pctSigne(delta)}
                          </span>
                          <span className="font-mono tabular-nums">{preu(p.preu)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </>
  );
}
