import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { AgruparVolum } from "@/components/preus/agrupar-volum";
import { PriceHistoryChart } from "@/components/preus/price-history-chart";
import { TendenciaBadge } from "@/components/preus/preus-table";
import { TancamentsBrowser } from "@/components/preus/tancaments-browser";
import { industrials as proveidors } from "@/lib/industrials";
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

export function generateStaticParams() {
  return elements.map((e) => ({ id: e.id }));
}

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

      <div className="@container flex min-w-0 flex-col gap-8 p-4 md:p-8">
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

        <div className="grid gap-8 @4xl:grid-cols-[auto_minmax(0,1fr)] @4xl:items-end">
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
          <div className="flex flex-wrap gap-x-10 gap-y-4 @4xl:justify-end">
            <Stat label="Últim tancat" value={preu(r.ultimPreu)} hint={`${date(r.ultimaData)} · ${r.ultimIndustrial}`} />
            <Stat
              label="Tendència 6m"
              value={<TendenciaBadge valor={r.tendencia} label={r.tendencia === null ? "" : pctSigne(r.tendencia)} />}
            />
            <Stat label="Millor industrial" value={preu(r.millorPreu)} hint={r.millorIndustrial} />
            <Stat label="Pagat de més · 12m" value={eur(r.sobrecost12)} hint="vs. millor industrial" />
          </div>
        </div>

        <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1fr)_340px]">
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
                obraHref: `/obres/${f.obraId}`,
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
          <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border @3xl:hidden">
            {ranking.map((ind, i) => <Link key={ind.industrial} href={`/industrials/${proveidors.find((p) => p.nom === ind.industrial)!.id}`} className="flex flex-col gap-2 p-4 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-ring">
              <div className="flex flex-wrap items-center gap-2"><span className="text-body font-medium">{ind.industrial}</span>{i === 0 && <Badge variant="secondary" className="bg-brand-soft text-brand-text">Millor</Badge>}</div>
              <div className="flex items-end justify-between gap-2"><div className="flex flex-col"><span className="font-mono text-title-sm tabular-nums">{preu(ind.preuMitja)}<span className="text-caption text-muted-foreground">/{r.unitat}</span></span><span className="text-caption text-muted-foreground">Mitjana 12m</span></div><span className="text-caption text-muted-foreground">{ind.tancaments} preus · {ind.nObres} obres</span></div>
            </Link>)}
          </div>
          <div className="hidden min-w-0 overflow-x-auto rounded-card ring-1 ring-surface-border @3xl:block">
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
                        <Link href={`/industrials/${proveidors.find((p) => p.nom === ind.industrial)!.id}`} className="font-medium hover:text-brand-text hover:underline">{ind.industrial}</Link>
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

        <section className="flex min-w-0 flex-col gap-3">
          <h2 className="text-title-sm font-semibold">Preus tancats</h2>
          <TancamentsBrowser files={tancats.map((p, i) => {
            const delta = ((p.preu - r.referencia) / r.referencia) * 100;
            return {
              id: `${p.data}-${p.obraId}-${i}`,
              data: p.data,
              dataLabel: date(p.data),
              industrial: p.industrial,
              industrialHref: `/industrials/${proveidors.find((ind) => ind.nom === p.industrial)!.id}`,
              obra: p.obra,
              obraHref: `/obres/${p.obraId}`,
              capObra: p.capObra,
              volum: volumLabel(p.volum, r.unitat),
              preu: `${preu(p.preu)}/${r.unitat}`,
              valor: p.preu,
              delta,
              deltaLabel: pctSigne(delta),
            };
          })} />
        </section>
      </div>
    </>
  );
}
