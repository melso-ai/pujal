"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  FolderCheckIcon,
  FolderIcon,
  LoaderCircleIcon,
  MailIcon,
  PaperclipIcon,
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
  alertaInstallacions,
  alertaPladur,
  alertes,
  correuExemple,
  electric,
  ESCALA_TEMPS,
  etapesRun,
  exemplePedrasses,
  familiesSenseOferta,
  grupsPartides,
  mapejos,
  ofertesMostra,
  partides,
  resumOfertes,
  totals,
  zones,
  type EtapaId,
  type OfertaPedrasses,
} from "@/lib/estudi-run";
import { date, eur, num } from "@/lib/format";
import { cn } from "@/lib/utils";

type Fase = "idle" | "running" | "done";
type Estat = "pending" | "active" | "done";
type Contingut = { fitxers: number; noms: string[] };

const DURADA_TOTAL = etapesRun.reduce((s, e) => s + e.durada, 0);

function temps(ms: number) {
  const s = Math.round((ms / 1000) * ESCALA_TEMPS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const importOferta = (o: OfertaPedrasses) =>
  o.baseImposable === null ? "sense import" : eur(o.baseImposable);

export function NouEstudi() {
  const [carpetes, setCarpetes] = useState<Record<string, Contingut>>({});
  const [exemple, setExemple] = useState(false);
  const [fase, setFase] = useState<Fase>("idle");
  const [actual, setActual] = useState(0);
  const [execucio, setExecucio] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const llestes = zones.every((z) => (carpetes[z.id]?.fitxers ?? 0) > 0);

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
    setCarpetes(
      Object.fromEntries(zones.map((z) => [z.id, { fitxers: z.fitxers, noms: z.exemples }]))
    );
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
              ? `${exemplePedrasses.nom} · ${exemplePedrasses.descripcio}`
              : "Deixa les 3 carpetes de l'estudi"}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {zones.map((z) => (
            <DropCarpeta
              key={z.id}
              nom={z.nom}
              carpeta={z.carpeta}
              format={z.format}
              contingut={carpetes[z.id]}
              onContingut={(c) => setCarpetes((prev) => ({ ...prev, [z.id]: c }))}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="lg" onClick={iniciar} disabled={!llestes}>
            <PlayIcon data-icon="inline-start" />
            Començar estudi
          </Button>
          <Button size="lg" variant="outline" onClick={carregarExemple}>
            Carregar {exemplePedrasses.nom}
          </Button>
          <span className="text-caption text-muted-foreground">Avui: ≈ 2 mesos per estudi</span>
        </div>
      </div>
    );
  }

  const progres = fase === "done" ? 100 : Math.min(99, (elapsed / DURADA_TOTAL) * 100);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-display-sm font-semibold tracking-tight">{exemplePedrasses.nom}</h1>
          <p className="text-body text-muted-foreground">
            {exemplePedrasses.arquitecte} · {exemplePedrasses.enginyeria} · lliurament{" "}
            {date(exemplePedrasses.lliurament)}
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
  carpeta,
  format,
  contingut,
  onContingut,
}: {
  nom: string;
  carpeta: string;
  format: string;
  contingut?: Contingut;
  onContingut: (c: Contingut) => void;
}) {
  const [sobre, setSobre] = useState(false);
  const plena = (contingut?.fitxers ?? 0) > 0;
  const llegir = (list: FileList | null) => {
    if (!list?.length) return;
    onContingut({ fitxers: list.length, noms: Array.from(list, (f) => f.name) });
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
        "flex min-h-44 min-w-0 cursor-pointer flex-col gap-3 rounded-card p-4 transition-colors",
        plena
          ? "bg-card shadow-[var(--surface-shadow)] ring-1 ring-surface-border"
          : "border-2 border-dashed border-border hover:border-ring hover:bg-surface-hover",
        sobre && "border-brand bg-brand-soft"
      )}
    >
      <input type="file" multiple className="sr-only" onChange={(e) => llegir(e.target.files)} />
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-body font-medium">
          {plena ? (
            <FolderCheckIcon className="size-4 shrink-0 text-success" />
          ) : (
            <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{nom}</span>
        </span>
        <Badge variant="outline" className="shrink-0 font-mono">
          {format}
        </Badge>
      </div>
      {plena && contingut ? (
        <div className="flex min-w-0 flex-col gap-1 animate-in fade-in">
          <span className="font-mono text-label tabular-nums">
            {carpeta} · {contingut.fitxers} fitxers
          </span>
          {contingut.noms.slice(0, 3).map((f) => (
            <span key={f} className="truncate text-caption text-muted-foreground" title={f}>
              {f}
            </span>
          ))}
          {contingut.fitxers > 3 && (
            <span className="text-caption text-faint-foreground">+{contingut.fitxers - 3} més</span>
          )}
        </div>
      ) : (
        <span className="mt-auto text-caption text-muted-foreground">
          {carpeta} · arrossega o tria fitxers
        </span>
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
          <ContingutPas id={id} titol={titol} durada={durada} actiu={actiu} />
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

type PasProps = { titol: string; durada: number; actiu: boolean };

function ContingutPas({ id, ...props }: PasProps & { id: EtapaId }) {
  switch (id) {
    case "lectura":
      return <Lectura {...props} />;
    case "partides":
      return <Partides {...props} />;
    case "ofertes":
      return <Ofertes {...props} />;
    case "alertes":
      return <Alertes {...props} />;
    case "sollicituds":
      return <Sollicituds {...props} />;
  }
}

function Lectura({ titol, durada, actiu }: PasProps) {
  const progres = useCountUp(100, durada * 0.9, actiu);
  const n = zones.length;

  return (
    <>
      <Cap titol={titol} comptador={`${Math.round((progres / 100) * totals.fitxers)} fitxers`} />
      <Cos className="flex flex-col gap-2">
        {zones.map((z, i) => {
          const p = Math.max(0, Math.min(100, (progres / 100) * n * 100 - i * 100));
          return (
            <div key={z.id} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3">
              <span className="truncate text-label">{z.nom}</span>
              <Progress value={p} />
              <span className="font-mono text-caption text-muted-foreground tabular-nums">
                {Math.round((p / 100) * z.fitxers)}
                {z.industrials && ` · ${z.industrials} industrials`}
              </span>
            </div>
          );
        })}
      </Cos>
    </>
  );
}

function Partides({ titol, durada, actiu }: PasProps) {
  const total = useCountUp(partides.total, durada * 0.9, actiu);
  const visibles = useCountUp(mapejos.length, durada * 0.85, actiu);
  const fraccio = total / partides.total;

  return (
    <>
      <Cap titol={titol} comptador={`${num(total)} partides`} />
      <Cos className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {grupsPartides.map((g) => (
            <div key={g.nom} className="flex flex-col gap-1 rounded-tile bg-surface-inset p-3">
              <span className="truncate text-label font-medium">{g.nom}</span>
              <span className="font-mono text-title-sm tabular-nums">
                {num(Math.round(g.partides * fraccio))}
              </span>
              <span className="truncate text-caption text-muted-foreground">{g.detall}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col divide-y divide-border rounded-tile ring-1 ring-surface-border">
          {mapejos.slice(0, visibles).map((m) => (
            <div
              key={m.original}
              className="grid gap-x-3 gap-y-1 px-3 py-2 duration-300 animate-in fade-in sm:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,13rem)] sm:items-center"
            >
              <Badge variant="secondary" className="w-fit font-normal">
                {m.origen}
              </Badge>
              <span className="truncate text-label text-muted-foreground" title={m.original}>
                «{m.original}»
              </span>
              <ArrowRightIcon className="hidden size-3.5 text-faint-foreground sm:block" />
              <span className="truncate text-label">
                <span className="mr-1.5 font-mono text-muted-foreground">{m.codi}</span>
                {m.partida}
              </span>
            </div>
          ))}
        </div>
      </Cos>
    </>
  );
}

function Ofertes({ titol, durada, actiu }: PasProps) {
  const llegides = useCountUp(resumOfertes.total, durada * 0.9, actiu);
  const visibles = useCountUp(ofertesMostra.length, durada * 0.8, actiu);

  return (
    <>
      <Cap titol={titol} comptador={`${llegides} ofertes · ${resumOfertes.families} famílies`} />
      <Cos className="flex flex-col gap-2">
        <div className="flex flex-col divide-y divide-border rounded-tile ring-1 ring-surface-border">
          {ofertesMostra.slice(0, visibles).map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between gap-3 px-3 py-2 duration-300 animate-in fade-in"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-label font-medium">{o.industrial}</span>
                <span className="truncate text-caption text-muted-foreground">
                  <span className="font-mono">{o.familia}</span> {o.familiaNom} · {o.habitatges}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-label tabular-nums">{importOferta(o)}</span>
                <Badge variant="outline" className="font-mono">
                  {o.format}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-2 font-mono text-caption text-muted-foreground tabular-nums">
          <span>+{resumOfertes.total - ofertesMostra.length} més</span>
          <span>
            {resumOfertes.pdf} PDF · {resumOfertes.excel} Excel ·{" "}
            {resumOfertes.total - resumOfertes.ambImport} sense import
          </span>
        </div>
      </Cos>
    </>
  );
}

function Fila({ esquerra, dreta, className }: { esquerra: React.ReactNode; dreta: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3 text-label", className)}>
      <span className="min-w-0 truncate">{esquerra}</span>
      <span className="shrink-0 font-mono tabular-nums">{dreta}</span>
    </div>
  );
}

function Alerta({ titol, valor, children }: { titol: string; valor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-tile bg-surface-inset p-3 duration-300 animate-in fade-in">
      <div className="flex items-start justify-between gap-3">
        <span className="text-label font-medium">{titol}</span>
        <Badge variant="outline" className="shrink-0 font-mono text-warning tabular-nums">
          {valor}
        </Badge>
      </div>
      {children}
    </div>
  );
}

function Alertes({ titol, durada, actiu }: PasProps) {
  const visibles = useCountUp(alertes.length, durada * 0.85, actiu);
  const [elec, pladur, inst, est] = alertes;
  const amplada = Math.max(electric.efhysNormalitzat, electric.besoli.total);

  const blocs = [
    <Alerta key={elec.id} titol={elec.titol} valor={elec.valor}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-caption text-muted-foreground">EFHYS</span>
          <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="bg-foreground" style={{ width: `${(electric.efhys.total / amplada) * 100}%` }} />
            <div className="bg-warning" style={{ width: `${(electric.omesesImport / amplada) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-caption text-muted-foreground">Besolí</span>
          <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="bg-foreground" style={{ width: `${(electric.besoli.total / amplada) * 100}%` }} />
          </div>
        </div>
      </div>
      <Fila esquerra="EFHYS en brut" dreta={eur(electric.efhys.total)} />
      <Fila
        esquerra={`+ ${electric.omeses.length} partides omeses (preus Besolí)`}
        dreta={eur(electric.omesesImport)}
        className="text-warning"
      />
      <Fila esquerra="EFHYS normalitzat" dreta={eur(electric.efhysNormalitzat)} className="font-medium" />
      <Fila esquerra="Besolí" dreta={eur(electric.besoli.total)} />
    </Alerta>,
    <Alerta key={pladur.id} titol={pladur.titol} valor={pladur.valor}>
      {alertaPladur.ofertes.map((o) => (
        <Fila
          key={o.id}
          esquerra={
            <>
              {o.industrial} <span className="text-muted-foreground">· {o.habitatges}</span>
            </>
          }
          dreta={importOferta(o)}
        />
      ))}
    </Alerta>,
    <Alerta key={inst.id} titol={inst.titol} valor={inst.valor}>
      <span className="text-caption text-muted-foreground">Paquet</span>
      {alertaInstallacions.paquets.map((o) => (
        <Fila key={o.id} esquerra={`${o.industrial} · ${o.habitatges}`} dreta={importOferta(o)} />
      ))}
      <span className="text-caption text-muted-foreground">Per ofici</span>
      {alertaInstallacions.perOfici.map((o) => (
        <Fila key={o.id} esquerra={`${o.industrial} · ${o.familiaNom} · ${o.habitatges}`} dreta={importOferta(o)} />
      ))}
    </Alerta>,
    <Alerta key={est.id} titol={est.titol} valor={est.valor}>
      <div className="flex flex-wrap gap-1.5">
        {familiesSenseOferta.map((f) => (
          <Badge key={f.codi} variant="outline">
            <span className="font-mono text-muted-foreground">{f.codi}</span>
            {f.nom}
          </Badge>
        ))}
      </div>
    </Alerta>,
  ];

  return (
    <>
      <Cap titol={titol} comptador={`${visibles} alertes`} />
      <Cos className="grid gap-2 lg:grid-cols-2">{blocs.slice(0, visibles)}</Cos>
    </>
  );
}

function Sollicituds({ titol, durada, actiu }: PasProps) {
  const visibles = useCountUp(familiesSenseOferta.length, durada * 0.7, actiu);

  return (
    <>
      <Cap titol={titol} comptador={`${familiesSenseOferta.length} famílies sense oferta`} />
      <Cos className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {familiesSenseOferta.slice(0, visibles).map((f) => (
            <Badge key={f.codi} variant="outline" className="duration-200 animate-in fade-in zoom-in-95">
              <span className="font-mono text-muted-foreground">{f.codi}</span>
              {f.nom}
            </Badge>
          ))}
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
          {correuExemple.adjunt && (
            <span className="flex min-w-0 items-center gap-1.5 text-caption text-muted-foreground">
              <PaperclipIcon className="size-3 shrink-0" />
              <span className="truncate">{correuExemple.adjunt}</span>
            </span>
          )}
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
    { label: "Fitxers", valor: num(totals.fitxers) },
    { label: "Partides", valor: num(partides.total) },
    { label: "Ofertes", valor: `${resumOfertes.total} · ${resumOfertes.families} famílies` },
    { label: "Alertes", valor: `${alertes.length} · ${alertes[0].valor} elèctric` },
    { label: "Sol·licituds llestes", valor: `${familiesSenseOferta.length} famílies` },
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
          render={<Link href={`/pressupostos/${exemplePedrasses.estudiId}`} />}
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
