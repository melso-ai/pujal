"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  FolderCheckIcon,
  FolderIcon,
  LoaderCircleIcon,
  MailIcon,
  PlayIcon,
  RotateCcwIcon,
  SkipForwardIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useCountUp } from "@/components/estudi/use-count-up";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  capitolsPujal,
  correuExemple,
  discrepanciesRun,
  ESCALA_TEMPS,
  etapesRun,
  exempleCanillo,
  families,
  impacteDiscrepancies,
  industrialsCartera,
  mapejos,
  preusRun,
  tancamentRun,
  totalIndustrials,
  totalPartidesRun,
  totals,
  type EtapaId,
  type Fitxer,
} from "@/lib/estudi-run";
import { date, eur, eurPrecise, num, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

type Fase = "idle" | "running" | "done";
type Estat = "pending" | "active" | "done";

const DURADA_TOTAL = etapesRun.reduce((s, e) => s + e.durada, 0);

function mida(bytes: number) {
  return bytes > 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

function temps(ms: number) {
  const s = Math.round((ms / 1000) * ESCALA_TEMPS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function NouEstudi() {
  const [carpetes, setCarpetes] = useState<Record<string, Fitxer[]>>({});
  const [exemple, setExemple] = useState(false);
  const [fase, setFase] = useState<Fase>("idle");
  const [actual, setActual] = useState(0);
  const [execucio, setExecucio] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const llestes = exempleCanillo.carpetes.every((c) => (carpetes[c.id]?.length ?? 0) > 0);

  useEffect(() => {
    if (fase !== "running") return;
    const t = setTimeout(() => {
      if (actual < etapesRun.length - 1) setActual(actual + 1);
      else setFase("done");
    }, etapesRun[actual].durada);
    return () => clearTimeout(t);
  }, [fase, actual]);

  useEffect(() => {
    if (fase !== "running") return;
    const t = setInterval(() => setElapsed((e) => Math.min(e + 100, DURADA_TOTAL)), 100);
    return () => clearInterval(t);
  }, [fase]);

  const carregarExemple = () => {
    setCarpetes(Object.fromEntries(exempleCanillo.carpetes.map((c) => [c.id, c.fitxers])));
    setExemple(true);
  };

  const iniciar = () => {
    if (!exemple) carregarExemple();
    setActual(0);
    setElapsed(0);
    setExecucio((n) => n + 1);
    setFase("running");
  };

  const saltar = () => {
    setActual(etapesRun.length);
    setElapsed(DURADA_TOTAL);
    setFase("done");
  };

  if (fase === "idle") {
    return (
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-display-sm font-semibold tracking-tight">Nou estudi</h1>
          <p className="text-body text-muted-foreground">
            {exemple
              ? `${exempleCanillo.nom} · ${exempleCanillo.arquitecte} · ${num(exempleCanillo.superficie)} m²`
              : "Deixa les 3 carpetes de l'arquitecte"}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {exempleCanillo.carpetes.map((c) => (
            <DropCarpeta
              key={c.id}
              nom={c.nom}
              format={c.format}
              fitxers={carpetes[c.id] ?? []}
              onFitxers={(f) => setCarpetes((prev) => ({ ...prev, [c.id]: f }))}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="lg" onClick={iniciar} disabled={!llestes}>
            <PlayIcon data-icon="inline-start" />
            Començar estudi
          </Button>
          <Button size="lg" variant="outline" onClick={carregarExemple}>
            Carregar exemple
          </Button>
          <span className="text-caption text-muted-foreground">Avui: ≈ 2 mesos per estudi</span>
        </div>
      </div>
    );
  }

  const progres =
    fase === "done" ? 100 : Math.min(99, (elapsed / DURADA_TOTAL) * 100);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-display-sm font-semibold tracking-tight">{exempleCanillo.nom}</h1>
          <p className="text-body text-muted-foreground">
            {exempleCanillo.arquitecte} · lliurament {date(exempleCanillo.lliurament)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-caption text-muted-foreground">Temps</span>
            <span className="font-mono text-title font-medium tabular-nums">{temps(elapsed)}</span>
          </div>
          {fase === "running" ? (
            <Button variant="outline" onClick={saltar}>
              <SkipForwardIcon data-icon="inline-start" />
              Saltar
            </Button>
          ) : (
            <Button variant="outline" onClick={iniciar}>
              <RotateCcwIcon data-icon="inline-start" />
              Repetir
            </Button>
          )}
        </div>
      </div>
      <Progress value={progres} />
      <ol className="flex flex-col">
        {etapesRun.map((e, i) => {
          const estat: Estat =
            fase === "done" || i < actual ? "done" : i === actual ? "active" : "pending";
          return (
            <Pas
              key={`${execucio}-${e.id}`}
              index={i}
              id={e.id}
              titol={e.titol}
              durada={e.durada}
              estat={estat}
              last={i === etapesRun.length - 1}
            />
          );
        })}
      </ol>
      {fase === "done" && <Resum elapsed={elapsed} />}
    </div>
  );
}

function DropCarpeta({
  nom,
  format,
  fitxers,
  onFitxers,
}: {
  nom: string;
  format: string;
  fitxers: Fitxer[];
  onFitxers: (f: Fitxer[]) => void;
}) {
  const [sobre, setSobre] = useState(false);
  const plena = fitxers.length > 0;
  const pagines = fitxers.reduce((s, f) => s + (f.pagines ?? 0), 0);
  const llegir = (list: FileList | null) => {
    if (!list?.length) return;
    onFitxers(Array.from(list, (f) => ({ nom: f.name, mida: mida(f.size) })));
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setSobre(true);
      }}
      onDragLeave={() => setSobre(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSobre(false);
        llegir(e.dataTransfer.files);
      }}
      className={cn(
        "flex min-h-28 cursor-pointer sm:min-h-44 flex-col gap-3 rounded-card p-4 transition-colors",
        plena
          ? "bg-card shadow-[var(--surface-shadow)] ring-1 ring-surface-border"
          : "border-2 border-dashed border-border hover:border-ring hover:bg-surface-hover",
        sobre && "border-brand bg-brand-soft"
      )}
    >
      <input type="file" multiple className="sr-only" onChange={(e) => llegir(e.target.files)} />
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-body font-medium">
          {plena ? (
            <FolderCheckIcon className="size-4 text-success" />
          ) : (
            <FolderIcon className="size-4 text-muted-foreground" />
          )}
          {nom}
        </span>
        <Badge variant="outline" className="font-mono">
          {format}
        </Badge>
      </div>
      {plena ? (
        <div className="flex flex-col gap-1 animate-in fade-in">
          <span className="font-mono text-label tabular-nums">
            {fitxers.length} fitxers{pagines > 0 && ` · ${pagines} pàg.`}
          </span>
          {fitxers.slice(0, 3).map((f) => (
            <span key={f.nom} className="truncate text-caption text-muted-foreground">
              {f.nom}
            </span>
          ))}
          {fitxers.length > 3 && (
            <span className="text-caption text-faint-foreground">+{fitxers.length - 3} més</span>
          )}
        </div>
      ) : (
        <span className="mt-auto text-caption text-muted-foreground">Arrossega o tria fitxers</span>
      )}
    </label>
  );
}

function Pas({
  index,
  id,
  titol,
  durada,
  estat,
  last,
}: {
  index: number;
  id: EtapaId;
  titol: string;
  durada: number;
  estat: Estat;
  last: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const actiu = estat === "active";

  useEffect(() => {
    if (actiu) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [actiu]);

  return (
    <li ref={ref} className="flex gap-4">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
            estat === "pending" && "text-faint-foreground ring-1 ring-border",
            actiu && "bg-brand-soft text-brand-text",
            estat === "done" && "bg-success/15 text-success"
          )}
        >
          {estat === "done" ? (
            <CheckIcon className="size-3.5" />
          ) : actiu ? (
            <LoaderCircleIcon className="size-3.5 animate-spin" />
          ) : (
            <span className="font-mono text-micro">{index + 1}</span>
          )}
        </span>
        {!last && (
          <span
            className={cn(
              "my-1 w-px flex-1 transition-colors",
              estat === "done" ? "bg-success/40" : "bg-border"
            )}
          />
        )}
      </div>
      <div className={cn("min-w-0 flex-1", !last && "pb-8", estat === "pending" && "opacity-50")}>
        {estat === "pending" ? (
          <Cap titol={titol} />
        ) : (
          <Contingut id={id} titol={titol} durada={durada} actiu={actiu} />
        )}
      </div>
    </li>
  );
}

function Cap({ titol, comptador }: { titol: string; comptador?: React.ReactNode }) {
  return (
    <div className="flex min-h-6 flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <span className="text-body font-medium">{titol}</span>
      {comptador && (
        <span className="font-mono text-label text-muted-foreground tabular-nums">{comptador}</span>
      )}
    </div>
  );
}

function Cos({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mt-3 duration-300 animate-in fade-in slide-in-from-top-1", className)}>
      {children}
    </div>
  );
}

type ContingutProps = { titol: string; durada: number; actiu: boolean };

function Contingut({ id, ...props }: ContingutProps & { id: EtapaId }) {
  switch (id) {
    case "lectura":
      return <Lectura {...props} />;
    case "partides":
      return <Partides {...props} />;
    case "creuament":
      return <Creuament {...props} />;
    case "preus":
      return <Preus {...props} />;
    case "ofertes":
      return <Ofertes {...props} />;
    case "tancament":
      return <Tancament {...props} />;
  }
}

function Lectura({ titol, durada, actiu }: ContingutProps) {
  const progres = useCountUp(100, durada * 0.9, actiu);
  const fitxers = Math.round((progres / 100) * totals.fitxers);
  const pagines = Math.round((progres / 100) * totals.pagines);
  const n = exempleCanillo.carpetes.length;

  return (
    <>
      <Cap titol={titol} comptador={`${fitxers} fitxers · ${pagines} pàg.`} />
      <Cos className="flex flex-col gap-2">
        {exempleCanillo.carpetes.map((c, i) => {
          const p = Math.max(0, Math.min(100, (progres / 100) * n * 100 - i * 100));
          const paginesCarpeta = c.fitxers.reduce((s, f) => s + (f.pagines ?? 0), 0);
          return (
            <div key={c.id} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3">
              <span className="truncate text-label">{c.nom}</span>
              <Progress value={p} />
              <span className="font-mono text-caption text-muted-foreground tabular-nums">
                {c.fitxers.length}
                {paginesCarpeta > 0 && ` · ${paginesCarpeta} pàg.`}
              </span>
            </div>
          );
        })}
      </Cos>
    </>
  );
}

function Confianca({ valor }: { valor: number }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono tabular-nums",
        valor >= 90 ? "text-success" : valor >= 85 ? "text-foreground" : "text-warning"
      )}
    >
      {valor}%{valor < 85 && " · revisar"}
    </Badge>
  );
}

function Partides({ titol, durada, actiu }: ContingutProps) {
  const total = useCountUp(totalPartidesRun, durada * 0.9, actiu);
  const visibles = useCountUp(mapejos.length, durada * 0.85, actiu);
  const fraccio = total / totalPartidesRun;

  return (
    <>
      <Cap titol={titol} comptador={`${total} partides`} />
      <Cos className="flex flex-col gap-3">
        <div className="grid gap-2 sm:grid-cols-3">
          {capitolsPujal.map((c) => (
            <div key={c.nom} className="flex flex-col gap-2 rounded-tile bg-surface-inset p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-label font-medium">{c.nom}</span>
                <span className="font-mono text-label tabular-nums">
                  {Math.round(c.partides * fraccio)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.families.map((f) => (
                  <Badge key={f} variant="secondary" className="font-normal">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col divide-y divide-border rounded-tile ring-1 ring-surface-border">
          {mapejos.slice(0, visibles).map((m) => (
            <div
              key={m.codi}
              className="grid gap-x-3 gap-y-1 px-3 py-2 duration-300 animate-in fade-in sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,14rem)_auto] sm:items-center"
            >
              <span className="truncate text-label text-muted-foreground" title={m.original}>
                «{m.original}»
              </span>
              <ArrowRightIcon className="hidden size-3.5 text-faint-foreground sm:block" />
              <span className="truncate text-label">
                <span className="mr-1.5 font-mono text-muted-foreground">{m.codi}</span>
                {m.partida}
              </span>
              <div>
                <Confianca valor={m.confianca} />
              </div>
            </div>
          ))}
        </div>
      </Cos>
    </>
  );
}

function Creuament({ titol, durada, actiu }: ContingutProps) {
  const impacte = useCountUp(impacteDiscrepancies, durada * 0.9, actiu);
  const visibles = useCountUp(discrepanciesRun.length, durada * 0.8, actiu);

  return (
    <>
      <Cap titol={titol} comptador={`${eur(impacte)} detectats`} />
      <Cos className="flex flex-col gap-2">
        {discrepanciesRun.slice(0, visibles).map((d) => (
          <div
            key={d.partida}
            className="flex items-start justify-between gap-3 rounded-tile bg-surface-inset px-3 py-2 duration-300 animate-in fade-in"
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-label font-medium">{d.partida}</span>
              <span className="text-caption text-muted-foreground">{d.detall}</span>
            </div>
            <Badge variant="destructive" className="shrink-0 font-mono tabular-nums">
              {eur(d.impacte)}
            </Badge>
          </div>
        ))}
      </Cos>
    </>
  );
}

function Preus({ titol, durada, actiu }: ContingutProps) {
  const ambPreu = useCountUp(preusRun.ambPreu, durada * 0.9, actiu);
  const visibles = useCountUp(preusRun.exemples.length, durada * 0.8, actiu);

  return (
    <>
      <Cap
        titol={titol}
        comptador={`${ambPreu}/${totalPartidesRun} · ${pct((ambPreu / totalPartidesRun) * 100, 0)}`}
      />
      <Cos className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Progress value={(ambPreu / totalPartidesRun) * 100} />
          <div className="flex flex-wrap justify-between gap-2 text-caption text-muted-foreground">
            <span>Preus tancats a {preusRun.obresFont} obres de Pujal</span>
            <span className="font-mono tabular-nums">
              {totalPartidesRun - preusRun.ambPreu} a demanar
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {preusRun.exemples.slice(0, visibles).map((p) => (
            <div
              key={p.partida}
              className="flex items-baseline justify-between gap-3 duration-300 animate-in fade-in"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-label">{p.partida}</span>
                <span className="truncate text-caption text-muted-foreground">{p.font}</span>
              </div>
              <span className="shrink-0 font-mono text-label tabular-nums">
                {eurPrecise(p.preu)}/{p.unitat}
              </span>
            </div>
          ))}
        </div>
      </Cos>
    </>
  );
}

function Ofertes({ titol, durada, actiu }: ContingutProps) {
  const industrials = useCountUp(totalIndustrials, durada * 0.9, actiu);
  const visibles = useCountUp(families.length, durada * 0.7, actiu);
  const carteraPct = (industrialsCartera / totalIndustrials) * 100;

  return (
    <>
      <Cap titol={titol} comptador={`${families.length} famílies · ${industrials} industrials`} />
      <Cos className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {families.slice(0, visibles).map((f) => (
            <Badge key={f.nom} variant="outline" className="duration-200 animate-in fade-in zoom-in-95">
              {f.nom}
              <span className="font-mono text-muted-foreground">{f.industrials}</span>
            </Badge>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="bg-foreground" style={{ width: `${carteraPct}%` }} />
            <div className="bg-brand" style={{ width: `${100 - carteraPct}%` }} />
          </div>
          <div className="flex justify-between font-mono text-caption text-muted-foreground tabular-nums">
            <span>{industrialsCartera} de cartera</span>
            <span>{totalIndustrials - industrialsCartera} nous</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-tile bg-surface-inset p-3 text-label">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MailIcon className="size-3.5 shrink-0" />
            <span className="truncate">{correuExemple.per}</span>
          </div>
          <span className="font-medium">{correuExemple.assumpte}</span>
          {correuExemple.cos.map((linia) => (
            <p key={linia} className="whitespace-pre-line text-muted-foreground">
              {linia}
            </p>
          ))}
        </div>
      </Cos>
    </>
  );
}

function Tancament({ titol, durada, actiu }: ContingutProps) {
  const k = useCountUp(tancamentRun.k, durada * 0.9, actiu, 2);
  const preu = useCountUp(tancamentRun.preuOferta, durada * 0.9, actiu);
  const files = [
    { label: "Cost directe", valor: eur(tancamentRun.costDirecte) },
    {
      label: `Indirectes · ${tancamentRun.mesos} mesos · ${tancamentRun.persones} persones`,
      valor: eur(tancamentRun.indirectes),
    },
    { label: "Despeses generals · 6%", valor: eur(tancamentRun.despesesGenerals) },
  ];

  return (
    <>
      <Cap titol={titol} comptador={`K ${k.toFixed(2)}`} />
      <Cos className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-1">
          {files.map((f) => (
            <div key={f.label} className="flex items-baseline justify-between gap-3 text-label">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="font-mono tabular-nums">{f.valor}</span>
            </div>
          ))}
          <div className="mt-1 flex items-baseline justify-between gap-3 border-t pt-2 text-body font-medium">
            <span>Preu d&apos;oferta</span>
            <span className="font-mono tabular-nums">{eur(preu)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-tile bg-surface-inset px-4 py-3 sm:flex-col sm:items-end sm:justify-center">
          <div className="flex flex-col sm:items-end">
            <span className="text-caption text-muted-foreground">Benefici net</span>
            <span className="font-mono text-title font-medium tabular-nums">
              {pct(tancamentRun.net)}
            </span>
          </div>
          <Badge variant="outline" className="text-success">
            Dins objectiu 2–3%
          </Badge>
        </div>
      </Cos>
    </>
  );
}

function Resum({ elapsed }: { elapsed: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  const xifres = [
    { label: "Partides", valor: num(totalPartidesRun) },
    {
      label: "Amb preu propi",
      valor: pct((preusRun.ambPreu / totalPartidesRun) * 100, 0),
    },
    {
      label: "Discrepàncies",
      valor: `${discrepanciesRun.length} · ${eur(impacteDiscrepancies)}`,
    },
    { label: "Sol·licituds llestes", valor: num(totalIndustrials) },
    { label: "Oferta preliminar", valor: eur(tancamentRun.preuOferta) },
  ];

  return (
    <div
      ref={ref}
      className="flex flex-col gap-6 rounded-card bg-card p-5 shadow-[var(--surface-shadow)] ring-1 ring-surface-border duration-500 animate-in fade-in slide-in-from-bottom-2 md:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-caption text-muted-foreground">Estudi preparat per revisar</span>
          <div className="flex flex-wrap items-baseline gap-x-3 font-mono tabular-nums">
            <span className="text-title text-muted-foreground line-through">≈ 2 mesos</span>
            <ArrowRightIcon className="size-5 self-center text-brand" />
            <span className="text-display font-medium">{temps(elapsed)} min</span>
          </div>
        </div>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={`/pressupostos/${exempleCanillo.estudiId}`} />}
        >
          Obrir estudi
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
        {xifres.map((x) => (
          <div key={x.label} className="flex flex-col gap-0.5">
            <span className="text-caption text-muted-foreground">{x.label}</span>
            <span className="font-mono text-body font-medium tabular-nums">{x.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
