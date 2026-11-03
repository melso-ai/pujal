"use client";

import Link from "next/link";
import { CheckIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { AskAction } from "@/components/chat/ask-action";
import { useCountUp } from "@/components/estudi/use-count-up";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { electric } from "@/lib/estudi-run";
import { eur, eurPrecise, num, pct } from "@/lib/format";
import {
  capitols,
  domotica,
  estalvi,
  estalviPct,
  linies,
  parts,
  peticionsBesoli,
  peticionsEfhys,
  promptBesoli,
  promptEfhys,
  promptTots,
  totals,
  type Qui,
} from "@/lib/negociacio";
import { cn } from "@/lib/utils";

const PASSOS = [
  `Llegint 2 ofertes · ${num(parts.besoli.partides + parts.efhys.partides)} partides`,
  `Aparellant amb l'amidament · ${electric.partidesAmidament} partides`,
  `Detectant omissions · ${domotica.partides} partides sense preu`,
  `Comparant capítol a capítol · ${capitols.length} capítols`,
];

const PAS_MS = 650;

export function Negociador() {
  const [pas, setPas] = useState(0);
  const fet = pas >= PASSOS.length;

  useEffect(() => {
    if (fet) return;
    const t = setTimeout(() => setPas((p) => p + 1), PAS_MS);
    return () => clearTimeout(t);
  }, [pas, fet]);

  if (!fet) return <Analisi pas={pas} />;
  return <Resultat />;
}

function Analisi({ pas }: { pas: number }) {
  return (
    <div className="flex flex-col gap-6">
      <Capcalera />
      <div className="flex flex-col gap-3 rounded-card bg-card p-5 ring-1 ring-surface-border">
        <span className="flex items-center gap-2 text-label font-medium">
          <SparklesIcon className="size-4 text-brand" />
          Analitzant les ofertes
        </span>
        <ol className="flex flex-col gap-2.5">
          {PASSOS.map((p, i) => (
            <li
              key={p}
              className={cn(
                "flex items-center gap-2.5 text-body transition-opacity",
                i > pas ? "opacity-35" : "opacity-100"
              )}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                {i < pas ? (
                  <CheckIcon className="size-4 text-success" />
                ) : i === pas ? (
                  <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                )}
              </span>
              <span className="font-mono text-label tabular-nums">{p}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Capcalera() {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption text-muted-foreground">
        Instal·lació elèctrica · Habitatge 1 · {parts.besoli.nom} i {parts.efhys.nom}
      </span>
      <h1 className="text-display-sm font-semibold tracking-tight">Negociar partida per partida</h1>
    </div>
  );
}

function Resultat() {
  const xifra = useCountUp(estalvi, 1400, true);
  const [aplicat, setAplicat] = useState(false);

  return (
    <div className="flex animate-in flex-col gap-10 duration-500 fade-in slide-in-from-bottom-2">
      <div className="flex flex-col gap-6">
        <Capcalera />
        <div className="flex flex-col gap-1">
          <span className="text-caption text-muted-foreground">Estalvi negociant capítol a capítol</span>
          <span className="font-mono text-5xl font-medium tracking-tight text-brand-text tabular-nums">
            −{eur(xifra)}
          </span>
          <span className="font-mono text-caption text-muted-foreground tabular-nums">
            Objectiu {eur(totals.objectiu)} · {parts.besoli.nom} sencer {eur(totals.besoli)} · −{pct(estalviPct)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <AskAction size="sm" className="rounded-full" prompt={promptTots}>
            <SparklesIcon />
            Redactar els 2 correus
          </AskAction>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => setAplicat((a) => !a)}
            aria-pressed={aplicat}
          >
            {aplicat && <CheckIcon className="text-success" />}
            {aplicat ? `Cost objectiu ${eur(totals.objectiu)} a l'estudi` : "Aplicar a l'estudi"}
          </Button>
          {aplicat && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/pressupostos/pedrasses#tancament" />}
            >
              Full de tancament
            </Button>
          )}
        </div>
      </div>

      <Escenaris />
      <Peticions />
      <Capitols />
      <Linies />
    </div>
  );
}

function Escenaris() {
  const max = totals.efhysReal;
  const files = [
    {
      nom: `${parts.efhys.nom} tal com ve`,
      valor: totals.efhysBrut,
      extra: totals.efhysReal - totals.efhysBrut,
      nota: `omet ${domotica.partides} partides · real ${eur(totals.efhysReal)}`,
    },
    { nom: `${parts.besoli.nom} sencer`, valor: totals.besoli, nota: `${parts.besoli.partides} partides` },
    { nom: "Negociat capítol a capítol", valor: totals.objectiu, nota: `−${eur(estalvi)}`, millor: true },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title-sm font-semibold">Tres maneres d&apos;adjudicar</h2>
      <div className="flex flex-col gap-4 rounded-card bg-card p-4 ring-1 ring-surface-border md:p-5">
        {files.map((f) => (
          <div key={f.nom} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className={cn("text-label", f.millor && "font-medium")}>{f.nom}</span>
              <span className="font-mono text-label tabular-nums">{eur(f.valor)}</span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-inset">
              <div
                className={cn("h-full", f.millor ? "bg-brand" : "bg-foreground/25")}
                style={{ width: `${(f.valor / max) * 100}%` }}
              />
              {f.extra && (
                <div
                  className="h-full bg-[repeating-linear-gradient(135deg,var(--warning)_0_3px,transparent_3px_6px)] opacity-70"
                  style={{ width: `${(f.extra / max) * 100}%` }}
                />
              )}
            </div>
            <span
              className={`font-mono text-caption tabular-nums ${f.extra ? "text-warning" : f.millor ? "text-brand-text" : "text-muted-foreground"}`}
            >
              {f.nota}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Peticions() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title-sm font-semibold">Què demanem a cadascú</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        <Targeta
          qui="besoli"
          rol="Proposta d'adjudicació"
          titol={`Iguala ${peticionsBesoli.length} capítols`}
          total={totals.rebaixaBesoli}
          peticions={peticionsBesoli}
          prompt={promptBesoli}
        />
        <Targeta
          qui="efhys"
          rol="Alternativa"
          titol={`Valora la domòtica i iguala ${peticionsEfhys.length} capítols`}
          total={totals.rebaixaEfhys}
          peticions={peticionsEfhys}
          prompt={promptEfhys}
          domotica
        />
      </div>
    </section>
  );
}

function Targeta({
  qui,
  rol,
  titol,
  total,
  peticions,
  prompt,
  domotica: ambDomotica,
}: {
  qui: Qui;
  rol: string;
  titol: string;
  total: number;
  peticions: { key: string; nom: string; actual: number; objectiu: number; rebaixa: number }[];
  prompt: string;
  domotica?: boolean;
}) {
  const [totes, setTotes] = useState(false);
  const visibles = totes ? peticions : peticions.slice(0, 4);
  const p = parts[qui];

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-card bg-card p-4 ring-1 ring-surface-border md:p-5",
        qui === "besoli" && "ring-brand/40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Link href={`/industrials/${p.id}`} className="text-body font-medium hover:underline">
            {p.complet}
          </Link>
          <span className="text-caption text-muted-foreground">{titol}</span>
        </div>
        <Badge variant="outline" className={qui === "besoli" ? "border-brand/40 text-brand-text" : undefined}>
          {rol}
        </Badge>
      </div>

      <ul className="flex flex-col divide-y divide-surface-border">
        {ambDomotica && (
          <li className="flex items-baseline justify-between gap-3 py-2 text-label">
            <span className="min-w-0 truncate text-warning">Valorar {domotica.partides} partides de domòtica</span>
            <span className="shrink-0 font-mono text-caption text-muted-foreground tabular-nums">
              ref. {eur(domotica.import)}
            </span>
          </li>
        )}
        {visibles.map((x) => (
          <li key={x.key} className="flex items-center justify-between gap-3 py-2">
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-label">{x.nom}</span>
              <span className="font-mono text-caption text-muted-foreground tabular-nums">
                {eur(x.actual)} → {eur(x.objectiu)}
              </span>
            </span>
            <span className="shrink-0 font-mono text-label text-success tabular-nums">−{eur(x.rebaixa)}</span>
          </li>
        ))}
      </ul>
      {peticions.length > 4 && (
        <Button size="sm" variant="ghost" className="-mt-2 self-start" onClick={() => setTotes((t) => !t)}>
          {totes ? "Mostrar menys" : `${peticions.length - 4} capítols més`}
        </Button>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-surface-border pt-3">
        <span className="font-mono text-title-sm font-medium tabular-nums">−{eur(total)}</span>
        <AskAction size="sm" variant={qui === "besoli" ? "default" : "outline"} className="rounded-full" prompt={prompt}>
          Redactar correu
        </AskAction>
      </div>
    </article>
  );
}

function Capitols() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-title-sm font-semibold">Capítol a capítol</h2>
        <span className="text-caption text-muted-foreground">
          {parts.besoli.nom} guanya en cable i tubs · {parts.efhys.nom} en quadres i enllumenat
        </span>
      </div>
      <div className="flex flex-col overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
        <div className="hidden grid-cols-[1fr_7rem_7rem_6rem] gap-3 border-b border-surface-border px-4 py-2 text-caption text-muted-foreground sm:grid">
          <span>Capítol</span>
          <span className="text-right">{parts.besoli.nom}</span>
          <span className="text-right">{parts.efhys.nom}</span>
          <span className="text-right">Diferència</span>
        </div>
        {capitols.map((c, i) => (
          <div
            key={c.key}
            className={cn(
              "grid grid-cols-2 gap-x-3 gap-y-1 px-4 py-2.5 sm:grid-cols-[1fr_7rem_7rem_6rem] sm:items-baseline",
              i > 0 && "border-t border-surface-border"
            )}
          >
            <span className="col-span-2 min-w-0 truncate text-label sm:col-span-1">
              <span className="mr-2 font-mono text-caption text-muted-foreground">{c.codi}</span>
              {c.nom}
            </span>
            <Preu valor={c.besoli} guanya={c.guanya === "besoli"} etiqueta={parts.besoli.nom} />
            <Preu valor={c.efhys} guanya={c.guanya === "efhys"} etiqueta={parts.efhys.nom} />
            <span className="hidden text-right font-mono text-label text-muted-foreground tabular-nums sm:block">
              {eur(c.delta)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Preu({ valor, guanya, etiqueta }: { valor: number; guanya: boolean; etiqueta: string }) {
  return (
    <span
      className={`flex items-baseline justify-between gap-2 font-mono text-label tabular-nums sm:justify-end ${guanya ? "font-medium text-success" : "text-muted-foreground"}`}
    >
      <span className="text-caption font-normal text-muted-foreground sm:hidden">{etiqueta}</span>
      {eur(valor)}
    </span>
  );
}

function Linies() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title-sm font-semibold">Partida a partida</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {linies.map((l) => (
          <div key={l.n} className="flex flex-col gap-1 rounded-tile bg-surface-inset px-3.5 py-3" title={l.desc}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-label font-medium">{l.nom}</span>
              <span className="shrink-0 font-mono text-caption text-muted-foreground tabular-nums">
                {num(l.quantitat)} {l.unitat}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-caption tabular-nums">
              <span>
                <span className={l.guanya === "besoli" ? "text-success" : "text-muted-foreground"}>
                  {parts.besoli.nom} {eurPrecise(l.besoli)}
                </span>
                <span className="text-muted-foreground"> · </span>
                <span className={l.guanya === "efhys" ? "text-success" : "text-muted-foreground"}>
                  {parts.efhys.nom} {eurPrecise(l.efhys)}
                </span>
              </span>
              <span className="text-muted-foreground">{eur(l.impacte)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
