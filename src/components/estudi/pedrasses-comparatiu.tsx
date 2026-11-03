"use client";

import Link from "next/link";

import { CheckIcon, ChevronRightIcon, SendIcon } from "lucide-react";
import { useState } from "react";

import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { industrials } from "@/lib/industrials";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  cobertura,
  electric,
  familiesSenseOferta,
  resumOfertes,
  type Cobertura,
  type OfertaPedrasses,
} from "@/lib/estudi-run";
import { eur, eurPrecise, num, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

const ELECTRIC = "IND.01";

const importOferta = (o: OfertaPedrasses) =>
  o.baseImposable === null ? "sense import" : eur(o.baseImposable);

const signe = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "");

function AdjudicatBadge({ onDesfes }: { onDesfes: () => void }) {
  return (
    <span className="flex items-center gap-1">
      <Badge className="bg-success/15 text-success">
        <CheckIcon data-icon="inline-start" />
        Adjudicat
      </Badge>
      <Button size="xs" variant="ghost" onClick={onDesfes}>
        Desfer
      </Button>
    </span>
  );
}

export function ComparatiuPedrasses() {
  const [cerca, setCerca] = useState("");
  const [filtre, setFiltre] = useState("totes");
  const [triat, setTriat] = useState<Record<string, string>>(() =>
    Object.fromEntries(cobertura.map((c) => [c.codi, (c.millor ?? c.ofertes[0]).id]))
  );
  const [adjudicat, setAdjudicat] = useState<Record<string, string>>({});
  const [obert, setObert] = useState<string | null>(null);
  const [sollicitat, setSollicitat] = useState<Record<string, boolean>>({});

  const adjudica = (codi: string, id: string) => setAdjudicat((a) => ({ ...a, [codi]: id }));
  const desfes = (codi: string) =>
    setAdjudicat((a) => {
      const rest = { ...a };
      delete rest[codi];
      return rest;
    });

  const electricFamilia = cobertura.find((c) => c.codi === ELECTRIC);
  const coincideix = (text: string) => text.toLocaleLowerCase("ca").includes(cerca.toLocaleLowerCase("ca").trim());
  const visibles = cobertura.filter((c) => coincideix(`${c.codi} ${c.nom} ${c.ofertes.map((o) => o.industrial).join(" ")}`) && (filtre === "totes" || (filtre === "adjudicades" ? !!adjudicat[c.codi] : !adjudicat[c.codi])));
  const sense = familiesSenseOferta.filter((f) => coincideix(`${f.codi} ${f.nom}`) && filtre !== "adjudicades");

  return (
    <div className="@container flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap gap-x-10 gap-y-3">
        <Stat
          label="Ofertes llegides"
          value={resumOfertes.total}
          hint={`${resumOfertes.pdf} PDF · ${resumOfertes.excel} Excel`}
        />
        <Stat label="Famílies amb oferta" value={resumOfertes.families} />
        <Stat label="Sense oferta" value={familiesSenseOferta.length} hint="Estructura" />
        <Stat label="Adjudicades" value={`${Object.keys(adjudicat).length}/${cobertura.length}`} />
      </div>

      {electricFamilia?.millor && !cerca && filtre === "totes" && (
        <ElectricCard
          adjudicat={adjudicat[ELECTRIC] === electricFamilia.millor.id}
          altraAdjudicacio={!!adjudicat[ELECTRIC] && adjudicat[ELECTRIC] !== electricFamilia.millor.id}
          onAdjudica={() => adjudica(ELECTRIC, electricFamilia.millor!.id)}
          onDesfes={() => desfes(ELECTRIC)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cobertura per família</CardTitle>
          <CardDescription>
            {resumOfertes.families} famílies · {resumOfertes.total} ofertes · {familiesSenseOferta.length} sense
            oferta
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input aria-label="Cercar família o industrial al comparatiu" placeholder="Cercar família o industrial…" value={cerca} onChange={(e) => setCerca(e.target.value)} />
            <select aria-label="Filtrar adjudicacions" value={filtre} onChange={(e) => setFiltre(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-label">
              <option value="totes">Totes les famílies</option>
              <option value="pendents">Pendents d&apos;adjudicar</option>
              <option value="adjudicades">Adjudicades</option>
            </select>
          </div>
          {visibles.length + sense.length === 0 && <div className="rounded-tile bg-surface-inset p-5 text-center"><p className="text-body">Cap família amb aquests filtres</p><Button variant="ghost" onClick={() => { setCerca(""); setFiltre("totes"); }}>Netejar filtres</Button></div>}
          <div className="flex flex-col divide-y divide-border">
          {visibles.map((c) => (
            <FamiliaFila
              key={c.codi}
              familia={c}
              obert={obert === c.codi}
              onObre={() => setObert(obert === c.codi ? null : c.codi)}
              triat={triat[c.codi]}
              onTria={(id) => setTriat((t) => ({ ...t, [c.codi]: id }))}
              adjudicat={adjudicat[c.codi]}
              onAdjudica={() => adjudica(c.codi, triat[c.codi])}
              onDesfes={() => desfes(c.codi)}
            />
          ))}
          {sense.map((f) => (
            <div key={f.codi} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="flex min-w-0 items-center gap-2 pl-6">
                <span className="font-mono text-label text-muted-foreground">{f.codi}</span>
                <span className="truncate text-body font-medium">{f.nom}</span>
                <Badge variant="outline" className="text-warning">
                  0 ofertes
                </Badge>
              </span>
              {sollicitat[f.codi] ? (
                <Badge className="bg-success/15 text-success">
                  <CheckIcon data-icon="inline-start" />
                  Sol·licitat
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSollicitat((s) => ({ ...s, [f.codi]: true }))}
                >
                  <SendIcon data-icon="inline-start" />
                  Sol·licitar
                </Button>
              )}
            </div>
          ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function etiquetaMillor(c: Cobertura, id: string) {
  if (id !== c.millor?.id) return "Triada";
  if (c.normalitzat) return "Millor normalitzada";
  return c.abastDiferent ? "Més baixa en brut" : "Millor";
}

function FamiliaFila({
  familia: c,
  obert,
  onObre,
  triat,
  onTria,
  adjudicat,
  onAdjudica,
  onDesfes,
}: {
  familia: Cobertura;
  obert: boolean;
  onObre: () => void;
  triat: string;
  onTria: (id: string) => void;
  adjudicat?: string;
  onAdjudica: () => void;
  onDesfes: () => void;
}) {
  const seleccio = c.ofertes.find((o) => o.id === (adjudicat ?? triat));
  const industrial = industrials.find((i) => i.nom === seleccio?.industrial);

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="grid gap-x-4 gap-y-2 @3xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] @3xl:items-center">
        <button
          type="button"
          onClick={onObre}
          aria-expanded={obert}
          className="flex min-h-10 min-w-0 items-center gap-2 rounded-md text-left focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ChevronRightIcon
            className={cn("size-4 shrink-0 text-muted-foreground transition-transform", obert && "rotate-90")}
          />
          <span className="font-mono text-label text-muted-foreground">{c.codi}</span>
          <span className="truncate text-body font-medium">{c.nom}</span>
          <span className="shrink-0 font-mono text-caption text-muted-foreground">{c.ofertes.length}</span>
        </button>
        <span className="pl-6 font-mono text-label tabular-nums @3xl:pl-0">
          {c.min === null || c.max === null
            ? "sense import"
            : c.min === c.max
              ? eur(c.min)
              : `${eur(c.min)} – ${eur(c.max)}`}
        </span>
        <span className="flex min-w-0 items-center gap-2 pl-6 text-label @3xl:pl-0">
          {seleccio && (
            <>
              {industrial ? <Link href={`/industrials/${industrial.id}`} className="truncate hover:text-brand-text hover:underline">{seleccio.industrial}</Link> : <span className="truncate">{seleccio.industrial}</span>}
              <span className="shrink-0 text-caption text-muted-foreground">
                {etiquetaMillor(c, seleccio.id)}
              </span>
            </>
          )}
        </span>
        <div className="pl-6 @3xl:pl-0">
          {adjudicat ? (
            <AdjudicatBadge onDesfes={onDesfes} />
          ) : (
            <Button size="sm" variant="outline" onClick={onAdjudica}>
              Adjudicar
            </Button>
          )}
        </div>
      </div>
      {c.avisos.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-6">
          {c.avisos.map((a) => (
            <Badge key={a} variant="outline" className="font-normal text-warning">
              {a}
            </Badge>
          ))}
        </div>
      )}
      {obert && (
        <div className="flex flex-col gap-2 pt-1 pl-6 duration-200 animate-in fade-in slide-in-from-top-1">
          {c.ofertes.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onTria(o.id)}
              disabled={!!adjudicat}
              aria-pressed={o.id === (adjudicat ?? triat)}
              className={cn(
                "flex w-full flex-col gap-1.5 rounded-tile p-3 text-left ring-1 transition-colors disabled:cursor-default",
                o.id === (adjudicat ?? triat)
                  ? "bg-surface-inset ring-foreground/25"
                  : "ring-surface-border hover:bg-surface-hover",
                adjudicat && o.id !== adjudicat && "opacity-50"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="text-body font-medium">{o.industrial}</span>
                  <Badge variant="secondary" className="font-normal">
                    {o.habitatges}
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    {o.format}
                  </Badge>
                </span>
                <span className="font-mono text-label font-medium tabular-nums">{importOferta(o)}</span>
              </div>
              <span className="text-caption text-muted-foreground">{o.abast}</span>
              {o.exclusions.length > 0 && (
                <span className="text-caption text-warning">Exclou: {o.exclusions.join(" · ")}</span>
              )}
              <span className="truncate font-mono text-micro text-faint-foreground" title={o.fitxer}>
                {o.fitxer}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ElectricCard({
  adjudicat,
  altraAdjudicacio,
  onAdjudica,
  onDesfes,
}: {
  adjudicat: boolean;
  altraAdjudicacio: boolean;
  onAdjudica: () => void;
  onDesfes: () => void;
}) {
  const amplada = Math.max(electric.efhysNormalitzat, electric.besoli.total);
  const totalBesoliCapitols = electric.perCapitol.reduce((s, c) => s + c.besoli, 0);
  const [totesOmeses, setTotesOmeses] = useState(false);
  const omesesMostra = totesOmeses ? electric.omesesMajors : electric.omesesMajors.slice(0, 5);

  const xifres = [
    { label: "EFHYS en brut", valor: eur(electric.efhys.total), hint: `${electric.efhys.partides} partides` },
    {
      label: "Partides omeses",
      valor: `+${eur(electric.omesesImport)}`,
      hint: `${electric.omeses.length} partides · preus Besolí`,
      className: "text-warning",
    },
    {
      label: "EFHYS normalitzat",
      valor: eur(electric.efhysNormalitzat),
      hint: `${signe(electric.diferencia)}${eur(Math.abs(electric.diferencia))} · ${signe(electric.diferencia)}${pct(Math.abs(electric.diferenciaPct))}`,
    },
    {
      label: "Besolí",
      valor: eur(electric.besoli.total),
      hint: `${electric.besoli.partides} partides`,
      millor: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardDescription className="font-mono">
          {ELECTRIC} Electricitat · Habitatge {electric.habitatge.replace("H", "")} ·{" "}
          {electric.partidesAmidament} partides a l&apos;amidament
        </CardDescription>
        <CardTitle className="text-title">Electricitat H1 · Besolí millora el preu normalitzat</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-2 @3xl:grid-cols-4">
          {xifres.map((x) => (
            <div
              key={x.label}
              className={cn(
                "flex flex-col gap-0.5 rounded-tile bg-surface-inset p-3",
                x.millor && "ring-1 ring-brand/40"
              )}
            >
              <span className="flex flex-wrap items-center justify-between gap-2 text-caption text-muted-foreground">
                {x.label}
                {x.millor && <Badge className="bg-brand-soft text-brand-text">Millor</Badge>}
              </span>
              <span className={cn("font-mono text-title-sm font-medium tabular-nums", x.className)}>
                {x.valor}
              </span>
              <span className="truncate font-mono text-caption text-muted-foreground tabular-nums">{x.hint}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-caption text-muted-foreground">EFHYS</span>
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="bg-foreground" style={{ width: `${(electric.efhys.total / amplada) * 100}%` }} />
              <div className="bg-warning" style={{ width: `${(electric.omesesImport / amplada) * 100}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-caption text-muted-foreground">Besolí</span>
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="bg-brand" style={{ width: `${(electric.besoli.total / amplada) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-label font-medium">Per capítol</span>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capítol</TableHead>
                <TableHead className="text-right">Besolí</TableHead>
                <TableHead className="text-right">EFHYS</TableHead>
                <TableHead className="text-right">Δ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {electric.perCapitol.map((c) => (
                <TableRow key={c.capitol}>
                  <TableCell className="max-w-48 whitespace-normal">{c.capitol}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{eur(c.besoli)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{eur(c.efhys)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono tabular-nums",
                      c.delta > 0 ? "text-destructive" : "text-success"
                    )}
                  >
                    {signe(c.delta)}
                    {eur(Math.abs(c.delta))}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-warning/5">
                <TableCell className="text-warning">
                  2.1–2.5 Domòtica · {electric.omeses.length} partides omeses
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">{eur(electric.omesesImport)}</TableCell>
                <TableCell className="text-right font-mono text-warning tabular-nums">—</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground tabular-nums">—</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {eur(totalBesoliCapitols + electric.omesesImport)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">{eur(electric.efhys.total)}</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        <div className="grid gap-6 @3xl:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-label font-medium">Partides que EFHYS no valora</span>
            <div className="flex flex-col gap-1">
              {electric.omesesPerCapitol.map((c) => (
                <div key={c.capitol} className="flex items-baseline justify-between gap-3 text-label">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {c.capitol} · {c.linies}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums">{eur(c.import)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1 rounded-tile bg-surface-inset p-3">
              {omesesMostra.map((o) => (
                <div key={o.n} className="flex items-baseline justify-between gap-3 text-caption">
                  <span className="min-w-0 truncate" title={o.desc}>
                    <span className="mr-1.5 font-mono text-muted-foreground">{o.n}</span>
                    {o.desc}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums">{eur(o.import)}</span>
                </div>
              ))}
              <Button size="sm" variant="ghost" className="self-start" onClick={() => setTotesOmeses(!totesOmeses)}>
                {totesOmeses ? "Mostrar menys" : `Veure les ${electric.omeses.length} partides omeses`}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-label font-medium">Diferències de preu unitari</span>
            <div className="flex flex-col divide-y divide-border rounded-tile ring-1 ring-surface-border">
              {electric.linies.map((l) => (
                <div key={l.n} className="flex flex-col gap-0.5 px-3 py-2">
                  <span className="truncate text-caption" title={l.desc}>
                    <span className="mr-1.5 font-mono text-muted-foreground">{l.n}</span>
                    {l.desc}
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-mono text-caption tabular-nums">
                    <span className="text-muted-foreground">
                      {num(l.quantitat)} {l.unitat} · {eurPrecise(l.besoli)} → {eurPrecise(l.efhys)}
                    </span>
                    <span className={l.impacte > 0 ? "text-destructive" : "text-success"}>
                      {signe(l.impacte)}
                      {eur(Math.abs(l.impacte))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-2 border-t">
        <span className="text-label">
          Besolí ·{" "}
          <span className="font-mono tabular-nums">
            {signe(-electric.diferencia)}
            {eur(Math.abs(electric.diferencia))}
          </span>{" "}
          vs EFHYS normalitzat
        </span>
        {adjudicat ? (
          <AdjudicatBadge onDesfes={onDesfes} />
        ) : altraAdjudicacio ? (
          <span className="text-caption text-muted-foreground">Una altra oferta adjudicada · revisa la família IND.01</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/pressupostos/pedrasses/negociar" />}>
              Negociar capítol a capítol
            </Button>
            <Button size="sm" onClick={onAdjudica}>
              Adjudicar a Besolí
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
