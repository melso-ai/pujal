import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  AlertTriangleIcon,
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  SendIcon,
} from "lucide-react";

import { Comparatiu } from "@/components/estudi/comparatiu";
import { DocumentacioPedrasses, PartidesPedrasses } from "@/components/estudi/pedrasses";
import { ComparatiuPedrasses } from "@/components/estudi/pedrasses-comparatiu";
import { PendentPreus } from "@/components/estudi/pendent-preus";
import { FullTancament } from "@/components/full-tancament";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  capitols,
  costDirecteEstudi,
  discrepancies,
  documentsArquitecte,
  estudis,
  etapesEstudi,
  getEstudi,
  totalPartides,
} from "@/lib/data";
import { exemplePedrasses, partides, resumOfertes } from "@/lib/estudi-run";
import { date, eur, eurPrecise, num, pct } from "@/lib/format";

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
  const preuOferta = 4_104_000;
  const igi = preuOferta * 0.045;

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Pressupostos", href: "/pressupostos" },
          { label: estudi.nom },
        ]}
       />

      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">{estudi.nom}</h1>
            <p className="text-sm text-muted-foreground">
              {real && `${exemplePedrasses.descripcio} · `}
              {estudi.arquitecte} · {estudi.responsable} · lliurament{" "}
              {date(estudi.lliurament)}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-x-12 gap-y-4">
            {estudi.importEstimat > 0 && (
              <Stat label="Import estimat" value={eur(estudi.importEstimat)} />
            )}
            {estudi.superficie > 0 && (
              <Stat label="Superfície" value={`${num(estudi.superficie)} m²`} />
            )}
            {real && (
              <>
                <Stat label="Partides" value={num(partides.total)} />
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

        <Tabs defaultValue={etapesEstudi[estudi.etapa]}>
          <TabsList variant="line" className="w-full justify-start overflow-x-auto">
            {etapesEstudi.map((etapa, i) => (
              <TabsTrigger key={etapa} value={etapa}>
                <span className="font-mono text-muted-foreground">{i + 1}</span>
                {etapa}
                {i < estudi.etapa && <CheckIcon />}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="Documentació" className="flex flex-col gap-4 pt-4">
            {real ? (
              <DocumentacioPedrasses />
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
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
                <Card>
                  <CardHeader>
                    <CardTitle>Discrepàncies detectades</CardTitle>
                    <CardDescription>Amidaments vs plànols i memòria</CardDescription>
                    <CardAction>
                      <Badge variant="destructive">
                        <AlertTriangleIcon data-icon="inline-start" />
                        {discrepancies.length}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Partida</TableHead>
                          <TableHead>Detall</TableHead>
                          <TableHead className="text-right">Impacte</TableHead>
                          <TableHead className="w-0" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {discrepancies.map((d) => (
                          <TableRow key={d.partida}>
                            <TableCell className="font-medium">{d.partida}</TableCell>
                            <TableCell className="text-muted-foreground">{d.detall}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums">
                              {eur(d.impacte)}
                            </TableCell>
                            <TableCell>
                              <Button size="xs" variant="outline">
                                Corregir
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="Partides" className="pt-4">
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
                  <CardContent>
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
                                <TableCell>{p.descripcio}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{p.familia}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono tabular-nums">
                                  {num(p.quantitat)} {p.unitat}
                                </TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground tabular-nums">
                                  {eurPrecise(p.preuRef)}
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
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="Comparatiu" className="pt-4">
            {real ? (
              <ComparatiuPedrasses />
            ) : (
              <Comparatiu />
            )}
          </TabsContent>

          <TabsContent value="Tancament" className="pt-4">
            {real ? (
              <PendentPreus que="Full de tancament" />
            ) : (
              <FullTancament />
            )}
          </TabsContent>

          <TabsContent value="Oferta" className="pt-4">
            {real ? (
              <PendentPreus que="Oferta" />
            ) : (
              <>
                <Card className="max-w-xl">
                  <CardHeader>
                    <CardTitle>Oferta al client</CardTitle>
                    <CardDescription>{estudi.nom}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 font-mono text-sm tabular-nums">
                    <div className="flex justify-between">
                      <span className="font-sans text-muted-foreground">Cost directe</span>
                      <span>{eur(costDirecteEstudi)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-muted-foreground">Base imposable</span>
                      <span>{eur(preuOferta)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-muted-foreground">IGI 4,5%</span>
                      <span>{eur(igi)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-medium">
                      <span className="font-sans">Total</span>
                      <span>{eur(preuOferta + igi)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 font-sans">
                      <Badge variant="outline">Pagament 60 dies</Badge>
                      <Badge variant="outline">Retenció 5% · 12 mesos</Badge>
                      <Badge variant="outline">Validesa 30 dies</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2 border-t">
                    <Button>
                      <SendIcon data-icon="inline-start" />
                      Enviar oferta
                    </Button>
                    <Button variant="outline">
                      <DownloadIcon data-icon="inline-start" />
                      PDF
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
