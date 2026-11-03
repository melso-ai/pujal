import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AskAction } from "@/components/chat/ask-action";
import { ComandaMarc } from "@/components/compres/comanda-marc";
import { DemandaChart } from "@/components/compres/demanda-chart";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  getOportunitat,
  MESOS,
  oportunitats,
  PERIODE,
  promptNegociar,
  SEGUENT_CODI,
  seriePerObra,
} from "@/lib/compres";
import { date, eur, num, pct, plural } from "@/lib/format";
import { mesLabel, preu, volumLabel } from "@/lib/preus";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return oportunitats.map((o) => ({ element: o.id }));
}

export default function CompraPage(props: PageProps<"/compres/[element]">) {
  return (
    <Suspense fallback={null}>
      <Compra params={props.params} />
    </Suspense>
  );
}

async function Compra({ params }: { params: PageProps<"/compres/[element]">["params"] }) {
  const { element } = await params;
  const o = getOportunitat(element);
  if (!o) notFound();

  const { rows, series } = seriePerObra(o);
  const u = `/${o.unitat}`;
  const mh = o.millorHistoric;
  const pedrasses = o.demanda.find((d) => d.siAdjudica);
  const millor = o.candidats.find((c) => c.preuMitja !== null);

  return (
    <>
      <PageHeader crumbs={[{ label: "Compres", href: "/compres" }, { label: o.nom }]} />

      <div className="@container flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{o.capitol}</Badge>
            <Badge variant="outline">
              <span className="font-mono text-muted-foreground">{o.familia}</span>
              {o.familiaNom}
            </Badge>
          </div>
          <h1 className="text-display-sm font-semibold tracking-tight">{o.nom}</h1>
          <ComandaMarc
            codi={SEGUENT_CODI}
            element={o.nom}
            unitat={o.unitat}
            referencia={o.referencia}
            objectiu={o.preuObjectiu}
            industrials={o.candidats.map((c) => ({
              id: c.id,
              nom: c.nom,
              preu: c.preuMitja !== null ? `${preu(c.preuMitja)}${u}` : null,
            }))}
            mesos={MESOS.map((mes, i) => ({
              mes,
              label: mesLabel(mes),
              volum: o.perMes[i],
              obres: o.demanda
                .filter((d) => !d.siAdjudica && d.mesos[i] > 0)
                .map((d) => d.obra.curt)
                .join(", "),
            }))}
          >
            <AskAction size="sm" className="rounded-full" prompt={promptNegociar(o)}>
              Negociar volum
            </AskAction>
          </ComandaMarc>
        </div>

        <div className="grid gap-8 @4xl:grid-cols-[auto_minmax(0,1fr)] @4xl:items-end">
          <div className="flex flex-col gap-1">
            <span className="text-caption text-muted-foreground">
              {o.agrupable ? `Estalvi agrupant · ${PERIODE}` : `Una sola obra · ${PERIODE}`}
            </span>
            <span
              className={cn(
                "font-mono text-5xl font-medium tracking-tight tabular-nums",
                o.agrupable && "text-brand-text"
              )}
            >
              {eur(o.estalvi)}
            </span>
            <span className="font-mono text-caption text-muted-foreground tabular-nums">
              {volumLabel(o.volum, o.unitat)} · {plural(o.nObres, "obra", "obres")}
              {pedrasses && ` · +${volumLabel(pedrasses.volum, o.unitat)} si s'adjudica Pedrasses`}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 @4xl:justify-end">
            <Stat label="Referència" value={`${preu(o.referencia)}${u}`} hint="mediana 6 mesos" />
            <Stat
              label="Objectiu agrupat"
              value={<span className="text-brand-text">{`${preu(o.preuObjectiu)}${u}`}</span>}
              hint={`${o.ancora.nom} −${pct(o.descompte * 100)}`}
            />
            <Stat label="Millor històric" value={`${preu(mh.preu)}${u}`} hint={`${mh.industrial} · ${date(mh.data)}`} />
            <Stat label="Import a referència" value={eur(o.importReferencia)} />
          </div>
        </div>

        <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="rounded-card ring-surface-border">
            <CardHeader>
              <CardTitle>Demanda per mes</CardTitle>
              <CardDescription>{o.unitat} per obra</CardDescription>
            </CardHeader>
            <CardContent>
              <DemandaChart rows={rows} series={series} unitat={o.unitat} />
            </CardContent>
          </Card>

          <Card className="rounded-card ring-surface-border">
            <CardHeader>
              <CardTitle>Industrials candidats</CardTitle>
              <CardDescription>Preu mitjà 12 mesos</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col rounded-tile bg-surface-inset p-1">
                {o.candidats.map((c) => (
                  <Link
                    key={c.id}
                    href={`/industrials/${c.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-surface-hover"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-label font-medium">{c.nom}</span>
                        {c === millor && (
                          <Badge variant="secondary" className="bg-brand-soft text-brand-text">
                            Millor
                          </Badge>
                        )}
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {c.tancaments
                          ? `${plural(c.tancaments, "preu tancat", "preus tancats")} · ${plural(c.nObres, "obra", "obres")}`
                          : c.pedrasses
                            ? "Oferta a Pedrasses"
                            : plural(c.nObres, "obra", "obres")}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-label tabular-nums">
                      {c.preuMitja !== null ? preu(c.preuMitja) : "—"}
                    </span>
                  </Link>
                ))}
              </div>
              <Link href={`/preus/${o.id}`} className="px-1 text-label text-muted-foreground hover:text-foreground">
                Historial de preus
              </Link>
            </CardContent>
          </Card>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-title-sm font-semibold">Obres</h2>
          <div className="overflow-x-auto rounded-xl ring-1 ring-surface-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Obra</TableHead>
                  {MESOS.map((m) => (
                    <TableHead key={m} className="text-right">
                      {mesLabel(m)}
                    </TableHead>
                  ))}
                  <TableHead className="pr-4 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {o.demanda.map((d) => (
                  <TableRow key={d.obra.id} className={cn(d.siAdjudica && "text-muted-foreground")}>
                    <TableCell className="pl-4">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2">
                          {d.obra.href ? (
                            <Link href={d.obra.href} className="font-medium hover:underline">
                              {d.obra.nom}
                            </Link>
                          ) : (
                            <span className="font-medium">{d.obra.nom}</span>
                          )}
                          {d.siAdjudica && (
                            <Badge variant="outline" className="border-dashed text-muted-foreground">
                              Si s&apos;adjudica
                            </Badge>
                          )}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {d.siAdjudica ? "Estudi en curs" : `${d.obra.capObra} · ${d.obra.estat}`}
                        </span>
                      </div>
                    </TableCell>
                    {d.mesos.map((v, i) => (
                      <TableCell key={MESOS[i]} className="text-right font-mono tabular-nums">
                        {v ? num(v) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    ))}
                    <TableCell className="pr-4 text-right font-mono font-medium tabular-nums">
                      {volumLabel(d.volum, o.unitat)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="pl-4 font-medium">Confirmat</TableCell>
                  {o.perMes.map((v, i) => (
                    <TableCell key={MESOS[i]} className="text-right font-mono tabular-nums">
                      {v ? num(v) : "—"}
                    </TableCell>
                  ))}
                  <TableCell className="pr-4 text-right font-mono font-medium tabular-nums">
                    {volumLabel(o.volum, o.unitat)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </section>
      </div>
    </>
  );
}
