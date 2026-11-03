"use client";

import Link from "next/link";
import {
  CheckIcon,
  FileTextIcon,
  PaperclipIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";

import { AskAction } from "@/components/chat/ask-action";
import { EstatBadge } from "@/components/estat-badge";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  getEstudi,
  passosAprovacio,
  type Obra,
} from "@/lib/data";
import { date, eur, pct } from "@/lib/format";
import { industrials } from "@/lib/industrials";

const pestanyes = [
  "resum",
  "contractes",
  "certificacions",
  "factures",
  "activitat",
];
const llegirPestanya = () => {
  const valor = window.location.hash.slice(1);
  return pestanyes.includes(valor) ? valor : "resum";
};
const escoltarHash = (canvi: () => void) => {
  window.addEventListener("hashchange", canvi);
  return () => window.removeEventListener("hashchange", canvi);
};

function setTab(valor: string) {
  window.history.replaceState(window.history.state, "", `#${valor}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

type Factura = (typeof factures)[number] & { fitxer?: string };

function IndustrialLink({ nom }: { nom: string }) {
  const industrial = industrials.find((i) => i.nom === nom);
  return industrial ? (
    <Link
      href={`/industrials/${industrial.id}`}
      className="font-medium underline-offset-4 hover:text-brand-text hover:underline"
    >
      {nom}
    </Link>
  ) : (
    <span className="font-medium">{nom}</span>
  );
}

function Buit({
  titol,
  children,
}: {
  titol: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-surface-inset p-8 text-center">
      <FileTextIcon className="size-5 text-muted-foreground" />
      <p className="text-body font-medium">{titol}</p>
      {children}
    </div>
  );
}

export function ObraDetail({ obra }: { obra: Obra }) {
  const teMoviments = obra.id === "aixovall";
  const estudi = getEstudi(obra.id);
  const tab = useSyncExternalStore(escoltarHash, llegirPestanya, () => "resum");
  const [files, setFiles] = useState<Factura[]>(
    teMoviments ? factures.map((f) => ({ ...f })) : [],
  );
  const [certs, setCerts] = useState(
    teMoviments ? certificacions.map((c) => ({ ...c })) : [],
  );
  const [registre, setRegistre] = useState(teMoviments ? [...activitat] : []);
  const [seleccio, setSeleccio] = useState<string | null>(null);
  const [cert, setCert] = useState<string | null>(null);
  const [avis, setAvis] = useState("");
  const [errorAdjunt, setErrorAdjunt] = useState("");
  const [pendentsNomes, setPendentsNomes] = useState(false);
  const fitxer = useRef<HTMLInputElement>(null);
  const pendents = files.filter((f) => f.pas < passosAprovacio.length);
  const llista = pendentsNomes ? pendents : files;
  const factura = files.find((f) => f.num === seleccio);
  const certificacio = certs.find((c) => c.mes === cert);
  const contractats = teMoviments ? contractes : [];
  const senseSignar = contractats.filter((c) => !c.signat);
  const delta = obra.margePrevist - obra.margeEstudi;
  const afegirActivitat = (que: string) =>
    setRegistre((r) => [{ quan: "Ara", que, qui: "Marta Pujal" }, ...r]);
  const actor = (pas: number) =>
    pas === 1 ? obra.capObra : pas === 3 ? "Benito" : "Marta Pujal";

  function aprovar() {
    if (
      !factura ||
      factura.albarans === 0 ||
      factura.pas >= passosAprovacio.length
    )
      return;
    const pas = factura.pas;
    const missatge = `${factura.num} · ${passosAprovacio[pas]} aprovada`;
    setFiles((r) =>
      r.map((f) => (f.num === factura.num ? { ...f, pas: f.pas + 1 } : f)),
    );
    setRegistre((r) => [{ quan: "Ara", que: missatge, qui: actor(pas) }, ...r]);
    setAvis(missatge);
    setSeleccio(null);
  }

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Obres", href: "/obres" }, { label: obra.nom }]}
      />
      <div className="flex min-w-0 flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {obra.obs}
            </Badge>
            <EstatBadge estat={obra.estat} />
            {obra.participacio < 100 && (
              <Badge variant="secondary">UTE {obra.participacio}%</Badge>
            )}
          </div>
          <h1 className="text-display-sm font-semibold tracking-tight">
            {obra.nom}
          </h1>
          <p className="text-body text-muted-foreground">
            {obra.lloc} · {obra.client}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-muted-foreground">
            <span>
              Cap d&apos;obra ·{" "}
              <span className="text-foreground">{obra.capObra}</span>
            </span>
            <span>{obra.arquitecte}</span>
            {estudi && (
              <Link
                href={`/pressupostos/${estudi.id}`}
                className="font-medium text-brand-text hover:underline"
              >
                Veure estudi
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-caption text-muted-foreground">
            Marge previst
          </span>
          <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
            {pct(obra.margePrevist)}
          </span>
          <span className="text-caption text-muted-foreground">
            Estudi {pct(obra.margeEstudi)} ·{" "}
            <span className={delta < 0 ? "text-warning" : "text-success"}>
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)} pp
            </span>
          </span>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Facturat" value={eur(obra.facturat)} />
          <Stat label="Cobrat" value={eur(obra.cobrat)} />
          <Stat
            label="Pendent de contractar"
            value={eur(obra.pendentContractar)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap justify-between gap-2 text-caption text-muted-foreground">
            <span>
              {date(obra.inici)} → {date(obra.fi)}
            </span>
            <span className="font-mono tabular-nums">
              {Math.round(obra.certificat * 100)}% certificat
            </span>
          </div>
          <Progress value={obra.certificat * 100} />
        </div>

        {teMoviments && (
          <section className="flex flex-col gap-3">
            <h2 className="text-title-sm font-semibold">Requereix atenció</h2>
            <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
              <div className="flex items-center justify-between gap-3 p-4">
                <span className="flex items-center gap-3 text-body">
                  <TriangleAlertIcon className="size-4 shrink-0 text-warning" />
                  {pendents.length} factures pendents d&apos;aprovar
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTab("factures");
                    setPendentsNomes(true);
                  }}
                >
                  Revisar
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <span className="text-body">
                  {senseSignar.length} contractes sense signar
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTab("contractes")}
                >
                  Revisar
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <span className="text-body">
                  {certs.some((c) => !c.validada)
                    ? "Certificació de novembre a punt"
                    : "Certificacions validades"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTab("certificacions")}
                >
                  Revisar
                </Button>
              </div>
            </div>
          </section>
        )}
        {avis && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-tile bg-surface-inset px-4 py-3 text-label"
          >
            <CheckIcon className="size-4 shrink-0 text-success" />
            {avis}
          </div>
        )}

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(String(value))}
          className="min-w-0"
        >
          <TabsList
            variant="line"
            className="max-w-full justify-start overflow-x-auto"
          >
            <TabsTrigger value="resum" className="shrink-0">
              Resum
            </TabsTrigger>
            <TabsTrigger value="contractes" className="shrink-0">
              Contractes{" "}
              <Badge variant="outline" className="font-mono">
                {contractats.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="certificacions" className="shrink-0">
              Certificacions
            </TabsTrigger>
            <TabsTrigger value="factures" className="shrink-0">
              Factures{" "}
              <Badge variant="outline" className="font-mono">
                {pendents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="activitat" className="shrink-0">
              Activitat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resum" className="min-w-0 pt-4">
            {teMoviments ? (
              <section className="flex min-w-0 flex-col gap-3">
                <h2 className="text-title-sm font-semibold">
                  Cost per capítol
                </h2>
                <div className="overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4">Capítol</TableHead>
                        <TableHead className="hidden text-right lg:table-cell">
                          Estudi
                        </TableHead>
                        <TableHead className="hidden text-right lg:table-cell">
                          Reestudi
                        </TableHead>
                        <TableHead className="text-right">Contractat</TableHead>
                        <TableHead className="pr-4 text-right">Real</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {capitolsObra.map((c) => (
                        <TableRow key={c.nom}>
                          <TableCell className="pl-4 whitespace-normal font-medium">
                            {c.nom}
                          </TableCell>
                          <TableCell className="hidden text-right font-mono text-muted-foreground tabular-nums lg:table-cell">
                            {eur(c.estudi)}
                          </TableCell>
                          <TableCell className="hidden text-right font-mono text-muted-foreground tabular-nums lg:table-cell">
                            {eur(c.reestudi)}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {eur(c.contractat)}
                          </TableCell>
                          <TableCell
                            className={`pr-4 text-right font-mono tabular-nums ${c.real > c.contractat ? "text-warning" : ""}`}
                          >
                            {eur(c.real)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            ) : (
              <Buit titol="Sense desglossament de costos registrat">
                {estudi ? (
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/pressupostos/${estudi.id}`} />}
                  >
                    Obrir estudi i tancament
                  </Button>
                ) : (
                  <AskAction
                    variant="outline"
                    prompt={`Prepara el desglossament de costos per capítol de ${obra.nom}.`}
                  >
                    Preparar desglossament
                  </AskAction>
                )}
              </Buit>
            )}
          </TabsContent>

          <TabsContent value="contractes" className="min-w-0 pt-4">
            {contractats.length ? (
              <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
                {contractats.map((c) => (
                  <div
                    key={c.industrial}
                    className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4"
                  >
                    <div className="min-w-0 flex-1 basis-44">
                      <IndustrialLink nom={c.industrial} />
                      <div className="mt-1 text-caption text-muted-foreground">
                        {c.familia} · {c.pagament} ·{" "}
                        {c.retencio ? "Retenció 5%" : "Sense retenció"}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-label tabular-nums">
                        {eur(c.import)}
                      </span>
                      <Badge
                        variant="outline"
                        className={c.signat ? "text-success" : "text-warning"}
                      >
                        {c.signat ? "Signat" : "Sense signar"}
                      </Badge>
                      {!c.signat && (
                        <AskAction
                          variant="outline"
                          size="sm"
                          prompt={`Redacta un correu a ${c.industrial} per demanar la signatura del contracte de ${obra.nom}, per ${eur(c.import)}.`}
                        >
                          Preparar recordatori
                        </AskAction>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Buit titol="Sense contractes registrats">
                <AskAction
                  variant="outline"
                  prompt={`Prepara una proposta de contractació per a ${obra.nom}, amb ${eur(obra.pendentContractar)} pendents de contractar.`}
                >
                  Preparar contractació
                </AskAction>
              </Buit>
            )}
          </TabsContent>

          <TabsContent value="certificacions" className="min-w-0 pt-4">
            {certs.length ? (
              <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
                {certs.map((c) => (
                  <button
                    key={c.mes}
                    onClick={() => setCert(c.mes)}
                    className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4 text-left transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]"
                  >
                    <div className="flex min-w-0 flex-1 basis-32 flex-col gap-1">
                      <span className="text-body font-medium">{c.mes}</span>
                      <span className="text-caption text-muted-foreground">
                        {Math.round(c.avanc * 100)}% certificat ·{" "}
                        {c.cobrada
                          ? "Cobrada"
                          : c.facturada
                            ? "Pendent de cobrament"
                            : c.validada
                              ? "Pendent de facturar"
                              : "Pendent de validar"}
                      </span>
                    </div>
                    <span className="font-mono text-label tabular-nums">
                      {eur(c.import)}
                    </span>
                    <span className="text-label text-brand-text">Revisar</span>
                  </button>
                ))}
              </div>
            ) : (
              <Buit titol="Sense certificacions registrades">
                <AskAction
                  variant="outline"
                  prompt={`Prepara la primera certificació de ${obra.nom} amb les partides executades.`}
                >
                  Preparar certificació
                </AskAction>
              </Buit>
            )}
          </TabsContent>

          <TabsContent value="factures" className="min-w-0 pt-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-title-sm font-semibold">
                  Factures de cost
                </h2>
                <label className="flex min-h-9 cursor-pointer items-center gap-2 text-label">
                  <input
                    type="checkbox"
                    checked={pendentsNomes}
                    onChange={(e) => setPendentsNomes(e.target.checked)}
                    className="size-4 accent-brand"
                  />
                  Només pendents
                </label>
              </div>
              {llista.length ? (
                <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
                  {llista.map((f) => (
                    <div
                      key={f.num}
                      className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4"
                    >
                      <div className="min-w-0 flex-1 basis-44">
                        <button
                          onClick={() => setSeleccio(f.num)}
                          className="text-left text-body font-medium underline-offset-4 hover:underline"
                        >
                          {f.proveidor}
                        </button>
                        <p className="mt-1 font-mono text-caption text-muted-foreground">
                          {f.num} · {date(f.data)}
                        </p>
                        {f.repartida && (
                          <span className="text-caption text-muted-foreground">
                            Repartida entre 3 obres
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-label tabular-nums">
                          {eur(f.import)}
                        </span>
                        <span
                          className={`text-caption ${f.albarans === 0 ? "text-warning" : "text-muted-foreground"}`}
                        >
                          {f.albarans
                            ? `${f.albarans} albarans`
                            : "Falten albarans"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            f.pas === passosAprovacio.length
                              ? "text-success"
                              : "text-warning"
                          }
                        >
                          {f.pas === passosAprovacio.length
                            ? "Aprovada"
                            : passosAprovacio[f.pas]}
                        </Badge>
                        <Button
                          size="sm"
                          variant={
                            f.pas === passosAprovacio.length
                              ? "outline"
                              : "default"
                          }
                          onClick={() => setSeleccio(f.num)}
                        >
                          {f.pas === passosAprovacio.length
                            ? "Veure"
                            : f.albarans === 0
                              ? "Adjuntar albarans"
                              : "Aprovar"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Buit
                  titol={
                    files.length
                      ? "Totes les factures estan aprovades"
                      : "Sense factures registrades"
                  }
                >
                  {files.length ? (
                    <Button
                      variant="outline"
                      onClick={() => setPendentsNomes(false)}
                    >
                      Veure totes les factures
                    </Button>
                  ) : (
                    <AskAction
                      variant="outline"
                      prompt={`Prepara la revisió de factures de cost de ${obra.nom}.`}
                    >
                      Preparar revisió
                    </AskAction>
                  )}
                </Buit>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activitat" className="min-w-0 pt-4">
            {registre.length ? (
              <div className="flex flex-col divide-y divide-surface-border rounded-card bg-card px-4 ring-1 ring-surface-border">
                {registre.map((a, i) => (
                  <div key={i} className="flex gap-4 py-4">
                    <span className="w-12 shrink-0 font-mono text-caption text-muted-foreground">
                      {a.quan}
                    </span>
                    <div className="min-w-0">
                      <p className="text-body">{a.que}</p>
                      <span className="text-caption text-muted-foreground">
                        {a.qui}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Buit titol="Sense activitat registrada">
                <Button variant="outline" onClick={() => setTab("resum")}>
                  Tornar al resum
                </Button>
              </Buit>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={!!factura}
        onOpenChange={(open) => {
          if (!open) {
            setSeleccio(null);
            setErrorAdjunt("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Factura {factura?.num}</DialogTitle>
            <DialogDescription>
              {factura?.proveidor} · {factura && eur(factura.import)}
            </DialogDescription>
          </DialogHeader>
          {factura && (
            <>
              <p className="text-caption text-muted-foreground">
                Simulació · aprovació de {actor(factura.pas)}
              </p>
              <ol className="flex flex-col gap-2">
                {passosAprovacio.map((p, i) => (
                  <li key={p} className="flex items-center gap-2 text-label">
                    <span
                      className={`flex size-6 items-center justify-center rounded-full font-mono text-caption ${i < factura.pas ? "bg-brand-soft text-brand-text" : "bg-surface-inset text-muted-foreground"}`}
                    >
                      {i < factura.pas ? (
                        <CheckIcon className="size-3" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    {p}
                    {i === factura.pas && (
                      <span className="ml-auto text-caption text-muted-foreground">
                        {actor(i)}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <div className="rounded-tile bg-surface-inset p-3 text-label">
                <span>
                  {factura.albarans
                    ? `${factura.albarans} albarans adjunts`
                    : "Cal adjuntar els albarans abans d'aprovar."}
                </span>
                {factura.fitxer && (
                  <p className="mt-1 break-all text-caption text-muted-foreground">
                    {factura.fitxer}
                  </p>
                )}
              </div>
              {factura.albarans === 0 && (
                <>
                  <input
                    ref={fitxer}
                    aria-label="Fitxer d'albarà"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="sr-only"
                    onChange={(e) => {
                      const arxiu = e.target.files?.[0];
                      if (!arxiu) return;
                      if (
                        !/\.(pdf|png|jpe?g)$/i.test(arxiu.name) ||
                        arxiu.size > 10 * 1024 * 1024
                      ) {
                        setErrorAdjunt(
                          "Tria un PDF, PNG o JPG de fins a 10 MB.",
                        );
                        e.target.value = "";
                        return;
                      }
                      setErrorAdjunt("");
                      setFiles((r) =>
                        r.map((f) =>
                          f.num === factura.num
                            ? { ...f, albarans: 1, fitxer: arxiu.name }
                            : f,
                        ),
                      );
                      afegirActivitat(
                        `Albarà adjunt a la factura ${factura.num}`,
                      );
                      setAvis(`Albarà ${arxiu.name} adjunt`);
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fitxer.current?.click()}
                  >
                    <PaperclipIcon />
                    Adjuntar albarà
                  </Button>
                </>
              )}
              {errorAdjunt && (
                <p role="alert" className="text-label text-warning">
                  {errorAdjunt}
                </p>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSeleccio(null);
                    setErrorAdjunt("");
                  }}
                >
                  Tancar
                </Button>
                {factura.pas < passosAprovacio.length && (
                  <Button disabled={!factura.albarans} onClick={aprovar}>
                    Confirmar aprovació
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!certificacio}
        onOpenChange={(open) => {
          if (!open) setCert(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificació · {certificacio?.mes}</DialogTitle>
            <DialogDescription>
              {obra.nom} · {obra.arquitecte}
            </DialogDescription>
          </DialogHeader>
          {certificacio && (
            <>
              <div className="font-mono text-3xl tabular-nums">
                {eur(certificacio.import)}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {Math.round(certificacio.avanc * 100)}% executat
                </Badge>
                <Badge variant="outline">
                  {certificacio.validada ? "Validada" : "Pendent de validar"}
                </Badge>
                <Badge variant="outline">
                  {certificacio.facturada ? "Facturada" : "Sense facturar"}
                </Badge>
                <Badge variant="outline">
                  {certificacio.cobrada ? "Cobrada" : "Sense cobrar"}
                </Badge>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCert(null)}>
                  Tancar
                </Button>
                {!certificacio.validada && (
                  <Button
                    onClick={() => {
                      setCerts((r) =>
                        r.map((c) =>
                          c.mes === certificacio.mes
                            ? { ...c, validada: true }
                            : c,
                        ),
                      );
                      afegirActivitat(
                        `Validació de l'arquitecte registrada · ${certificacio.mes}`,
                      );
                      setAvis(`Certificació ${certificacio.mes} validada`);
                      setCert(null);
                    }}
                  >
                    Registrar validació
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
