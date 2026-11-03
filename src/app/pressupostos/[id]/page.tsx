import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  CheckIcon,
  FileTextIcon,
} from "lucide-react";

import Link from "next/link";

import { DiscrepanciesEstudi } from "@/components/estudi/discrepancies";
import { EstudiTabs } from "@/components/estudi/estudi-tabs";
import { OfertaEstudi } from "@/components/estudi/oferta";
import { Comparatiu } from "@/components/estudi/comparatiu";
import { DocumentacioPedrasses, PartidesPedrasses } from "@/components/estudi/pedrasses";
import { ComparatiuPedrasses } from "@/components/estudi/pedrasses-comparatiu";
import { PendentPreus } from "@/components/estudi/pendent-preus";
import { FullTancament } from "@/components/full-tancament";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  capitols,
  documentsArquitecte,
  estudis,
  etapesEstudi,
  getEstudi,
  obres,
  totalPartides,
} from "@/lib/data";
import { exemplePedrasses, partides, resumOfertes } from "@/lib/estudi-run";
import { date, eur, eurPrecise, num, pct } from "@/lib/format";

const preusPartida: Record<string, string> = {
  "02.03": "formigo-ha25",
  "02.07": "acer-b500s",
  "02.09": "encofrat",
  "05.02": "fusteria-alumini",
  "05.06": "rajola-porcellanica",
  "05.11": "cuina-equipada",
};

export function generateStaticParams() {
  return estudis.map((e) => ({ id: e.id }));
}

export default function EstudiPage(props: PageProps<"/pressupostos/[id]">) {
  return (
    <Suspense fallback={null}>
      <Estudi params={props.params} />
    </Suspense>
  );
}

async function Estudi({
  params,
}: {
  params: PageProps<"/pressupostos/[id]">["params"];
}) {
  const { id } = await params;
  const estudi = getEstudi(id);
  if (!estudi) notFound();

  const real = estudi.id === exemplePedrasses.estudiId;
  const obra = obres.find((o) => o.id === estudi.id);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Pressupostos", href: "/pressupostos" },
          { label: estudi.nom },
        ]}
       />

      <div className="@container flex min-w-0 flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-display-sm font-semibold tracking-tight">{estudi.nom}</h1>
            <p className="text-sm text-muted-foreground">
              {real && `${exemplePedrasses.descripcio} · `}
              {estudi.arquitecte} · {estudi.responsable} · lliurament{" "}
              {date(estudi.lliurament)}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-caption text-muted-foreground">{real ? "Partides a estudiar" : "Import estimat"}</span>
            <span className="font-mono text-4xl font-medium tracking-tight tabular-nums sm:text-5xl">{real ? num(partides.total) : eur(estudi.importEstimat)}</span>
            {obra && <Link href={`/obres/${obra.id}`} className="w-fit text-label text-brand-text hover:underline">Obrir fitxa d&apos;obra →</Link>}
          </div>
          <div className="flex flex-wrap items-end gap-x-12 gap-y-4">
            {estudi.superficie > 0 && (
              <Stat label="Superfície" value={`${num(estudi.superficie)} m²`} />
            )}
            {real && (
              <>
                <Stat
                  label="Ofertes"
                  value={resumOfertes.total}
                  hint={`${resumOfertes.families} famílies`}
                />
              </>
            )}
            <Stat
              label="Etapa"
              value={`${estudi.etapa + 1}/${etapesEstudi.length}`}
              hint={etapesEstudi[estudi.etapa]}
            />
          </div>
          <Progress value={((estudi.etapa + 1) / etapesEstudi.length) * 100} />
        </div>

        <EstudiTabs etapa={estudi.etapa}>
          <TabsList variant="line" className="min-h-11 w-full min-w-0 justify-start overflow-x-auto">
            {etapesEstudi.map((etapa, i) => (
              <TabsTrigger key={etapa} value={etapa} className="min-h-10 flex-none px-3">
                <span className="font-mono text-muted-foreground">{i + 1}</span>
                {etapa}
                {i < estudi.etapa && <CheckIcon />}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent keepMounted value="Documentació" className="flex flex-col gap-4 pt-4 data-[hidden]:hidden">
            {real ? (
              <DocumentacioPedrasses />
            ) : (
              <>
                <div className="grid gap-3 @3xl:grid-cols-3">
                  {documentsArquitecte.map((d) => (
                    <Card key={d.nom} size="sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileTextIcon className="size-4 text-muted-foreground" />
                          {d.nom}
                        </CardTitle>
                        <CardDescription>
                          {d.fitxers} fitxers · {d.format}
                        </CardDescription>
                        <CardAction>
                          <Badge variant="secondary">
                            <CheckIcon data-icon="inline-start" />
                            Llegit
                          </Badge>
                        </CardAction>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
                <DiscrepanciesEstudi />
              </>
            )}
          </TabsContent>

          <TabsContent keepMounted value="Partides" className="pt-4 data-[hidden]:hidden">
            {real ? (
              <PartidesPedrasses />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Partides</CardTitle>
                    <CardDescription>
                      {capitols.reduce((s, c) => s + c.partides.length, 0)} de{" "}
                      {totalPartides} · preu de referència de l&apos;històric
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="@container min-w-0">
                    <div className="flex flex-col gap-6 @3xl:hidden">
                      {capitols.map((c) => (
                        <section key={c.codi} className="flex flex-col gap-3">
                          <h2 className="text-label font-medium text-muted-foreground">{c.codi} · {c.nom}</h2>
                          <div className="flex flex-col divide-y divide-surface-border rounded-tile bg-surface-inset px-3">
                            {c.partides.map((p) => (
                              <article key={p.codi} className="flex flex-col gap-3 py-4">
                                <div><span className="font-mono text-caption text-muted-foreground">{p.codi} · {p.familia}</span><h3 className="text-body font-medium">{p.descripcio}</h3></div>
                                <dl className="grid grid-cols-2 gap-3 text-label">
                                  <div><dt className="text-caption text-muted-foreground">Quantitat</dt><dd className="font-mono tabular-nums">{num(p.quantitat)} {p.unitat}</dd></div>
                                  <div><dt className="text-caption text-muted-foreground">Preu d&apos;estudi</dt><dd className="font-mono tabular-nums">{eurPrecise(p.preuEstudi)}/{p.unitat}</dd></div>
                                  <div><dt className="text-caption text-muted-foreground">Referència</dt><dd className="font-mono tabular-nums">{preusPartida[p.codi] ? <Link href={`/preus/${preusPartida[p.codi]}`} className="text-brand-text underline underline-offset-4">{eurPrecise(p.preuRef)}/{p.unitat}</Link> : `${eurPrecise(p.preuRef)}/${p.unitat}`}</dd></div>
                                  <div><dt className="text-caption text-muted-foreground">Import</dt><dd className="font-mono font-medium tabular-nums">{eur(p.quantitat * p.preuEstudi)}</dd></div>
                                </dl>
                              </article>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                    <div className="hidden @3xl:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Codi</TableHead>
                          <TableHead>Descripció</TableHead>
                          <TableHead>Família</TableHead>
                          <TableHead className="text-right">Quantitat</TableHead>
                          <TableHead className="text-right">Ref.</TableHead>
                          <TableHead className="text-right">Estudi</TableHead>
                          <TableHead className="text-right">Δ</TableHead>
                          <TableHead className="text-right">Import</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {capitols.flatMap((c) => [
                          <TableRow key={c.codi} className="hover:bg-transparent">
                            <TableCell
                              colSpan={8}
                              className="pt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase"
                            >
                              {c.codi} · {c.nom}
                            </TableCell>
                          </TableRow>,
                          ...c.partides.map((p) => {
                            const delta = ((p.preuEstudi - p.preuRef) / p.preuRef) * 100;
                            return (
                              <TableRow key={p.codi}>
                                <TableCell className="font-mono text-muted-foreground">
                                  {p.codi}
                                </TableCell>
                                <TableCell className="min-w-40 whitespace-normal">{p.descripcio}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{p.familia}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono tabular-nums">
                                  {num(p.quantitat)} {p.unitat}
                                </TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground tabular-nums">
                                  {preusPartida[p.codi] ? <Link href={`/preus/${preusPartida[p.codi]}`} className="text-brand-text underline underline-offset-4">{eurPrecise(p.preuRef)}</Link> : eurPrecise(p.preuRef)}
                                </TableCell>
                                <TableCell className="text-right font-mono tabular-nums">
                                  {eurPrecise(p.preuEstudi)}
                                </TableCell>
                                <TableCell
                                  className={`text-right font-mono tabular-nums ${delta > 3 ? "text-destructive" : "text-muted-foreground"}`}
                                >
                                  {delta > 0 ? "+" : ""}
                                  {pct(delta)}
                                </TableCell>
                                <TableCell className="text-right font-mono tabular-nums">
                                  {eur(p.quantitat * p.preuEstudi)}
                                </TableCell>
                              </TableRow>
                            );
                          }),
                        ])}
                      </TableBody>
                    </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent keepMounted value="Comparatiu" className="pt-4 data-[hidden]:hidden">
            {real ? (
              <ComparatiuPedrasses />
            ) : (
              <Comparatiu />
            )}
          </TabsContent>

          <TabsContent keepMounted value="Tancament" className="pt-4 data-[hidden]:hidden">
            {real ? (
              <PendentPreus que="Full de tancament" />
            ) : (
              <FullTancament estudiId={estudi.id} preuInicial={estudi.importEstimat} />
            )}
          </TabsContent>

          <TabsContent keepMounted value="Oferta" className="pt-4 data-[hidden]:hidden">
            {real ? (
              <PendentPreus que="Oferta" />
            ) : (
              <OfertaEstudi id={estudi.id} nom={estudi.nom} preuInicial={estudi.importEstimat} />
            )}
          </TabsContent>
        </EstudiTabs>
      </div>
    </>
  );
}
