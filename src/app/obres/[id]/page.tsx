import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  AlertTriangleIcon,
  CheckIcon,
  CircleIcon,
  FileSignatureIcon,
} from "lucide-react";

import { EstatBadge } from "@/components/estat-badge";
import { AskAction } from "@/components/chat/ask-action";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  activitat,
  capitolsObra,
  certificacions,
  contractes,
  factures,
  getObra,
  obres,
  passosAprovacio,
} from "@/lib/data";
import { date, eur, pct } from "@/lib/format";

export function generateStaticParams() {
  return obres.map((o) => ({ id: o.id }));
}

const initials = (nom: string) =>
  nom
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckIcon className="size-4" />
  ) : (
    <CircleIcon className="size-3 text-muted-foreground" />
  );
}

export default function ObraPage(props: PageProps<"/obres/[id]">) {
  return (
    <Suspense fallback={null}>
      <Obra params={props.params} />
    </Suspense>
  );
}

async function Obra({ params }: { params: PageProps<"/obres/[id]">["params"] }) {
  const { id } = await params;
  const obra = getObra(id);
  if (!obra) notFound();

  const enCurs = obra.certificat > 0;
  const delta = obra.margePrevist - obra.margeEstudi;
  const pendents = factures.filter((f) => f.pas < passosAprovacio.length);
  const senseSignar = contractes.filter((c) => !c.signat);

  return (
    <>
      <PageHeader crumbs={[{ label: "Obres", href: "/obres" }, { label: obra.nom }]} />

      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {obra.obs}
            </Badge>
            <EstatBadge estat={obra.estat} />
            {obra.participacio < 100 && (
              <Badge variant="secondary">UTE {obra.participacio}%</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">{obra.nom}</h1>
              <p className="text-sm text-muted-foreground">
                {obra.lloc} · {obra.client} · {obra.arquitecte}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{initials(obra.capObra)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm leading-tight">
                <span>{obra.capObra}</span>
                <span className="text-xs text-muted-foreground">Cap d&apos;obra</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-wrap items-end gap-x-12 gap-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Marge previst</span>
                  <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
                    {pct(obra.margePrevist)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Estudi {pct(obra.margeEstudi)} ·{" "}
                    <span className={delta < 0 ? "text-destructive" : ""}>
                      {delta > 0 ? "+" : ""}
                      {delta.toFixed(1)} pp
                    </span>
                  </span>
                </div>
                <Stat label="Facturat" value={eur(obra.facturat)} />
                <Stat label="Cobrat" value={eur(obra.cobrat)} />
                <Stat label="Pendent de contractar" value={eur(obra.pendentContractar)} />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {date(obra.inici)} → {date(obra.fi)}
                  </span>
                  <span className="font-mono tabular-nums">
                    {Math.round(obra.certificat * 100)}% certificat
                  </span>
                </div>
                <Progress value={obra.certificat * 100} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requereix atenció</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2">
                  <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <span>{pendents.length} factures pendents d&apos;aprovar</span>
                </div>
                <AskAction size="xs" variant="outline" prompt="Quines factures falten per aprovar i què he de mirar a cadascuna?">
                  Revisar
                </AskAction>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2">
                  <FileSignatureIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{senseSignar.length} contractes sense signar</span>
                </div>
                <AskAction size="xs" variant="outline" prompt="Redacta un correu a Clima Valira perquè signin el contracte">
                  Enviar
                </AskAction>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>Certificació de novembre a punt</span>
                </div>
                <AskAction size="xs" prompt={`Prepara la certificació de novembre de ${obra.nom} i redacta el correu a l'arquitecte perquè la validi`}>
                  Validar
                </AskAction>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="resum">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="resum">Resum</TabsTrigger>
            <TabsTrigger value="contractes">
              Contractes
              <Badge variant="outline" className="font-mono">
                {contractes.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="certificacions">Certificacions</TabsTrigger>
            <TabsTrigger value="factures">
              Factures
              <Badge variant="outline" className="font-mono">
                {pendents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="activitat">Activitat</TabsTrigger>
          </TabsList>

          <TabsContent value="resum" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Estudi → reestudi → contractat → real</CardTitle>
                <CardDescription>Per capítol</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Capítol</TableHead>
                      <TableHead className="text-right">Estudi</TableHead>
                      <TableHead className="text-right">Reestudi</TableHead>
                      <TableHead className="text-right">Contractat</TableHead>
                      <TableHead className="text-right">Real</TableHead>
                      <TableHead className="text-right">Δ contractat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="font-mono tabular-nums">
                    {capitolsObra.map((c) => {
                      const d = c.contractat - c.estudi;
                      return (
                        <TableRow key={c.nom}>
                          <TableCell className="font-sans font-medium">{c.nom}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {eur(c.estudi)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {eur(c.reestudi)}
                          </TableCell>
                          <TableCell className="text-right">{eur(c.contractat)}</TableCell>
                          <TableCell className="text-right">{enCurs ? eur(c.real) : "—"}</TableCell>
                          <TableCell
                            className={`text-right ${d > 0 ? "text-destructive" : "text-muted-foreground"}`}
                          >
                            {d > 0 ? "+" : ""}
                            {eur(d)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contractes" className="pt-4">
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Industrial</TableHead>
                      <TableHead>Família</TableHead>
                      <TableHead>Pagament</TableHead>
                      <TableHead>Retenció 5%</TableHead>
                      <TableHead>Estat</TableHead>
                      <TableHead className="text-right">Import</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractes.map((c) => (
                      <TableRow key={c.industrial}>
                        <TableCell className="font-medium">{c.industrial}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{c.familia}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.pagament}</TableCell>
                        <TableCell>
                          <Check ok={c.retencio} />
                        </TableCell>
                        <TableCell>
                          {c.signat ? (
                            <Badge variant="secondary">Signat</Badge>
                          ) : (
                            <Badge variant="destructive">Sense signar</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {eur(c.import)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificacions" className="pt-4">
            <Card>
              <CardContent>
                {enCurs ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mes</TableHead>
                        <TableHead className="w-48">Avanç</TableHead>
                        <TableHead>Arquitecte</TableHead>
                        <TableHead>Facturada</TableHead>
                        <TableHead>Cobrada</TableHead>
                        <TableHead className="text-right">Import</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certificacions.map((c) => (
                        <TableRow key={c.mes}>
                          <TableCell className="font-medium">{c.mes}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Progress value={c.avanc * 100} className="w-24" />
                              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                                {Math.round(c.avanc * 100)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Check ok={c.validada} />
                          </TableCell>
                          <TableCell>
                            <Check ok={c.facturada} />
                          </TableCell>
                          <TableCell>
                            <Check ok={c.cobrada} />
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {eur(c.import)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Encara no hi ha certificacions
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="factures" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Factures de cost</CardTitle>
                <CardDescription>
                  {passosAprovacio.join(" → ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factura</TableHead>
                      <TableHead>Proveïdor</TableHead>
                      <TableHead>Albarans</TableHead>
                      <TableHead>Aprovació</TableHead>
                      <TableHead className="text-right">Import</TableHead>
                      <TableHead className="w-0" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {factures.map((f) => (
                      <TableRow key={f.num}>
                        <TableCell className="font-mono text-xs">
                          {f.num}
                          <div className="font-sans text-muted-foreground">{date(f.data)}</div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {f.proveidor}
                          {f.repartida && (
                            <Badge variant="outline" className="ml-2">
                              Repartida 3 obres
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {f.albarans > 0 ? (
                            <Badge variant="secondary" className="font-mono">
                              {f.albarans} quadren
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Falten</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {passosAprovacio.map((p, i) => (
                              <Badge
                                key={p}
                                variant={i < f.pas ? "default" : "outline"}
                                className="px-1.5"
                              >
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {eur(f.import)}
                        </TableCell>
                        <TableCell>
                          {f.pas < passosAprovacio.length && (
                            <Button size="xs">Aprovar</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activitat" className="pt-4">
            <Card>
              <CardContent className="flex flex-col">
                {activitat.map((a, i) => (
                  <div key={i} className="flex gap-4 border-b py-3 last:border-0">
                    <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">
                      {a.quan}
                    </span>
                    <div className="flex flex-col gap-0.5 text-sm">
                      <span>{a.que}</span>
                      <span className="text-xs text-muted-foreground">{a.qui}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
