import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Barra, FilaCert, pp } from "@/components/certificacions/estat";
import { fila } from "@/components/certificacions/fila";
import { Flux, type Factura } from "@/components/certificacions/flux";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  AVUI,
  avancObra,
  certificacions,
  certsObra,
  de,
  deMes,
  desviacio,
  dia,
  getCertificacio,
  getObraCert,
  importMes,
  mesLabel,
  seguentFactura,
  totals,
  type Linia,
} from "@/lib/certificacions";
import { date, eur, eurPrecise, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return certificacions.map((c) => ({ id: c.id }));
}

const initials = (nom: string) =>
  nom
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

const sumaDies = (iso: string, dies: number) => {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + dies);
  return d.toISOString().slice(0, 10);
};

function Avis({ l }: { l: Linia }) {
  const d = desviacio(l);
  if (!d) return null;
  return d.tipus === "exces" ? (
    <span className="text-caption text-destructive">Excés {pct(d.pp)} sobre pressupost</span>
  ) : (
    <span className="text-caption text-warning">{pp(d.pp)} vs previst</span>
  );
}

function Persona({ nom, rol }: { nom: string; rol: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="sm">
        <AvatarFallback>{initials(nom)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-label">{nom}</span>
        <span className="truncate text-caption text-muted-foreground">{rol}</span>
      </div>
    </div>
  );
}

function Parell({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex justify-between gap-4", className)}>
      <dt className="min-w-0 truncate text-muted-foreground">{label}</dt>
      <dd className="shrink-0 font-mono tabular-nums">{value}</dd>
    </div>
  );
}

export default function CertificacioPage(props: PageProps<"/certificacions/[id]">) {
  return (
    <Suspense fallback={null}>
      <Detall params={props.params} />
    </Suspense>
  );
}

async function Detall({ params }: { params: PageProps<"/certificacions/[id]">["params"] }) {
  const { id } = await params;
  const c = getCertificacio(id);
  if (!c) notFound();
  const o = getObraCert(c.obraId)!;
  const t = totals(c);
  const a = avancObra(c);
  const ute = o.participacio < 100;
  const altres = certsObra(o.id).filter((x) => x.id !== c.id);
  const devs = c.linies.flatMap((l) => {
    const d = desviacio(l);
    if (!d) return [];
    return d.tipus === "exces"
      ? [`${l.nom} al ${pct(l.origen * 100)} del pressupost (${eur((l.origen - 1) * l.pressupost)} d'excés)`]
      : [`${l.nom} al ${pct(l.origen * 100)} a origen, ${pp(d.pp)} respecte al previst`];
  });

  const abans =
    c.estat === "Producció" || c.estat === "Certificació"
      ? "abans d'enviar-la a l'arquitecte"
      : c.estat === "Arquitecte"
        ? "abans de facturar-la"
        : "per a la propera certificació";
  const revisar = `Revisa la certificació ${deMes(c.mes)} ${de(o.nom)} (núm. ${c.num}, ${eur(t.pujal)}, ${pp(a.mes * 100)}). ${
    devs.length ? `Desviacions: ${devs.join("; ")}.` : "Cap capítol es desvia més de 4 punts del previst."
  } Compara-ho amb els mesos anteriors i digues què he de mirar ${abans}.`;
  const produccio = `Redacta un missatge a ${o.capObra} perquè tanqui la producció ${deMes(c.mes)} ${de(o.nom)} i la passi al programa de certificacions.`;

  const dataFactura = c.facturada ?? AVUI;
  const factura: Factura = {
    num: c.factura ?? seguentFactura(),
    data: date(dataFactura),
    venciment: date(sumaDies(dataFactura, 30)),
    client: o.client,
    concepte: `Certificació núm. ${c.num} · ${mesLabel(c.mes).toLowerCase()} · ${o.nom}`,
    ute: ute ? `UTE · ${o.participacio}% de ${eurPrecise(t.base)}` : undefined,
    linies: [
      { label: "Base imposable", value: eurPrecise(t.pujal) },
      { label: "IGI 4,5%", value: eurPrecise(t.igi) },
      ...(t.retencio ? [{ label: "Retenció de garantia 5%", value: `−${eurPrecise(t.retencio)}` }] : []),
    ],
    total: eurPrecise(t.total),
  };

  const totalMes = c.linies.reduce((s, l) => s + importMes(l), 0);

  return (
    <>
      <PageHeader crumbs={[{ label: "Certificacions", href: "/certificacions" }, { label: o.nom }]} />

      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {o.obs}
            </Badge>
            <Badge variant="outline">Núm. {c.num}</Badge>
            {ute && <Badge variant="secondary">UTE {o.participacio}%</Badge>}
          </div>
          <h1 className="text-display-sm font-semibold tracking-tight">{o.nom}</h1>
          <p className="text-body text-muted-foreground">
            {mesLabel(c.mes)} · {o.client}
            {o.fitxa && (
              <>
                {" · "}
                <Link href={`/obres/${o.id}`} className="hover:text-foreground hover:underline">
                  Fitxa de l&apos;obra
                </Link>
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 pt-1">
            <Persona nom={o.capObra} rol="Cap d'obra" />
            <Persona nom={o.signant} rol={o.signant === o.arquitecte ? "Arquitecte" : o.arquitecte} />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-12 gap-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-caption text-muted-foreground">
              {ute ? `Certificat aquest mes · part Pujal ${o.participacio}%` : "Certificat aquest mes"}
            </span>
            <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">{eur(t.pujal)}</span>
            <span className="text-caption text-muted-foreground">
              {pp(a.mes * 100)} · {pct(a.origen * 100)} a origen
            </span>
          </div>
          <Stat label="Total a cobrar" value={eur(t.total)} />
          <Stat label="Pendent d'executar" value={eur(Math.max(0, 1 - a.origen) * a.pressupost)} />
          <Stat label="Fi prevista" value={date(o.fi)} />
        </div>

        <Flux
          estat={c.estat}
          dates={{
            preparada: c.preparada && dia(c.preparada),
            enviada: c.enviada && dia(c.enviada),
            signada: c.signada && dia(c.signada),
            facturada: c.facturada && dia(c.facturada),
            cobrada: c.cobrada && dia(c.cobrada),
          }}
          avui={dia(AVUI)}
          capObra={o.capObra}
          signant={o.signant}
          factura={factura}
          revisar={revisar}
          produccio={produccio}
        />

        <section className="@container flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-title-sm font-semibold">Capítols</h2>
            {devs.length > 0 && (
              <span className="text-label text-warning">
                {devs.length} {devs.length === 1 ? "desviació" : "desviacions"}
              </span>
            )}
          </div>

          <div className="hidden overflow-hidden rounded-card bg-card ring-1 ring-surface-border @2xl:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Capítol</TableHead>
                  <TableHead className="text-right">Pressupost</TableHead>
                  <TableHead className="text-right">Anterior</TableHead>
                  <TableHead className="text-right">Aquest mes</TableHead>
                  <TableHead className="w-40">A origen</TableHead>
                  <TableHead className="pr-4 text-right">Import</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-mono tabular-nums">
                {c.linies.map((l) => {
                  const mes = (l.origen - l.anterior) * 100;
                  return (
                    <TableRow key={l.codi} className={cn(mes === 0 && "text-muted-foreground")}>
                      <TableCell className="pl-4 font-sans">
                        <div className="flex flex-col">
                          <span className="text-body">
                            <span className="mr-2 font-mono text-caption text-muted-foreground">{l.codi}</span>
                            {l.nom}
                          </span>
                          <Avis l={l} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{eur(l.pressupost)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{pct(l.anterior * 100)}</TableCell>
                      <TableCell className="text-right">{mes > 0 ? pp(mes) : "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Barra anterior={l.anterior * 100} origen={l.origen * 100} className="w-16" />
                          <span>{pct(l.origen * 100)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-4 text-right">{mes > 0 ? eur(importMes(l)) : "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter className="bg-surface-inset font-mono tabular-nums">
                <TableRow className="hover:bg-transparent">
                  <TableCell className="pl-4 font-sans font-medium">Total</TableCell>
                  <TableCell className="text-right">{eur(a.pressupost)}</TableCell>
                  <TableCell className="text-right">{pct(a.anterior * 100)}</TableCell>
                  <TableCell className="text-right">{pp(a.mes * 100)}</TableCell>
                  <TableCell>{pct(a.origen * 100)}</TableCell>
                  <TableCell className="pr-4 text-right">{eur(totalMes)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border @2xl:hidden">
            {c.linies.map((l) => {
              const mes = (l.origen - l.anterior) * 100;
              return (
                <div key={l.codi} className="flex flex-col gap-2 px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-body font-medium">
                      <span className="mr-2 font-mono text-caption text-muted-foreground">{l.codi}</span>
                      {l.nom}
                    </span>
                    <span className="shrink-0 font-mono text-label tabular-nums">
                      {mes > 0 ? eur(importMes(l)) : "—"}
                    </span>
                  </div>
                  <Barra anterior={l.anterior * 100} origen={l.origen * 100} />
                  <div className="flex justify-between gap-3 font-mono text-caption text-muted-foreground tabular-nums">
                    <span>
                      {pct(l.anterior * 100)} → {pct(l.origen * 100)}
                    </span>
                    <span>{mes > 0 ? pp(mes) : "—"}</span>
                  </div>
                  <Avis l={l} />
                </div>
              );
            })}
            <div className="flex items-baseline justify-between gap-3 bg-surface-inset px-4 py-3">
              <span className="text-body font-medium">Total</span>
              <span className="font-mono text-label font-medium tabular-nums">{eur(totalMes)}</span>
            </div>
          </div>
        </section>

        <div className="@container">
          <div className="grid gap-4 @3xl:grid-cols-2">
            <section className="flex flex-col gap-3 rounded-card bg-card p-4 ring-1 ring-surface-border">
              <h2 className="text-label font-medium">Factura</h2>
              <dl className="flex flex-col gap-2 text-label">
                {ute && <Parell label="Certificat UTE (100%)" value={eurPrecise(t.base)} />}
                <Parell label={ute ? `Base · part Pujal ${o.participacio}%` : "Base imposable"} value={eurPrecise(t.pujal)} />
                <Parell label="IGI 4,5%" value={`+${eurPrecise(t.igi)}`} />
                <Parell
                  label={o.retencio ? "Retenció 5%" : "Sense retenció"}
                  value={t.retencio ? `−${eurPrecise(t.retencio)}` : "—"}
                />
                <div className="flex justify-between gap-4 border-t border-surface-border pt-2 text-body font-medium">
                  <dt>Total a cobrar</dt>
                  <dd className="font-mono tabular-nums">{eurPrecise(t.total)}</dd>
                </div>
              </dl>
              {ute && (
                <div className="flex flex-col gap-2 border-t border-surface-border pt-3">
                  <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
                    <div className="h-full bg-foreground" style={{ width: `${o.participacio}%` }} />
                    {t.socis.map((s, i) => (
                      <div
                        key={s.nom}
                        className={cn("h-full", i % 2 ? "bg-chart-5" : "bg-chart-4")}
                        style={{ width: `${s.pct}%` }}
                      />
                    ))}
                  </div>
                  <dl className="flex flex-col gap-1.5 text-caption">
                    <Parell label={`Construccions Pujal · ${o.participacio}%`} value={eur(t.pujal)} className="text-foreground" />
                    {t.socis.map((s) => (
                      <Parell key={s.nom} label={`${s.nom} · ${s.pct}%`} value={eur(s.base)} />
                    ))}
                  </dl>
                </div>
              )}
            </section>

            <section className="flex flex-col gap-3 rounded-card bg-card p-4 ring-1 ring-surface-border">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-label font-medium">Avanç sobre pressupost</h2>
                <span className="font-mono text-label tabular-nums">{pct(a.origen * 100)}</span>
              </div>
              <Barra anterior={a.anterior * 100} origen={a.origen * 100} className="h-2" />
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-chart-4" />
                  Anterior {pct(a.anterior * 100)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-brand" />
                  Aquest mes {pp(a.mes * 100)}
                </span>
              </div>
              <dl className="flex flex-col gap-2 border-t border-surface-border pt-3 text-label">
                <Parell label="Certificat a origen" value={eur(a.origen * a.pressupost)} />
                <Parell label="Pressupost" value={eur(a.pressupost)} />
                <Parell label="Pendent d'executar" value={eur(Math.max(0, 1 - a.origen) * a.pressupost)} />
              </dl>
            </section>
          </div>
        </div>

        {altres.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-title-sm font-semibold">Altres mesos</h2>
            <div className="@container flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
              {altres.map((x) => (
                <FilaCert key={x.id} f={fila(x)} etiqueta={`${mesLabel(x.mes)} · núm. ${x.num}`} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
