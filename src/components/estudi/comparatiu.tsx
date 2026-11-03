"use client";

import {
  ArrowRightIcon,
  CheckIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  SendIcon,
} from "lucide-react";
import { useState } from "react";

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
import { comparatiuNormalitzat } from "@/lib/estudi-run";
import { eurPrecise, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

type Partida = (typeof comparatiuNormalitzat)[number];
type Oferta = Partida["ofertes"][number];

const diaMes = (iso: string) =>
  new Date(iso).toLocaleDateString("ca-AD", { day: "numeric", month: "short" });

export function Comparatiu() {
  const [triat, setTriat] = useState<Record<string, string>>(() =>
    Object.fromEntries(comparatiuNormalitzat.map((c) => [c.partida, c.millor]))
  );
  const [demanades, setDemanades] = useState(false);
  const [adjudicat, setAdjudicat] = useState<Record<string, string>>({});

  const ofertes = comparatiuNormalitzat.reduce((s, c) => s + c.ofertes.length, 0);
  const formats = new Set(comparatiuNormalitzat.flatMap((c) => c.ofertes.map((o) => o.format)));
  const canvis = comparatiuNormalitzat.filter((c) => c.millor !== c.mesBarataBrut).length;

  return (
    <div className="@container flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          <Stat label="Ofertes llegides" value={ofertes} hint={[...formats].join(" · ")} />
          <Stat label="Guanyador canvia en normalitzar" value={canvis} hint="Bombeig, vidre, col·locació" />
          <Stat
            label="Adjudicades"
            value={`${Object.keys(adjudicat).length}/${comparatiuNormalitzat.length}`}
          />
        </div>
        <Button size="sm" variant="outline" disabled={demanades} onClick={() => setDemanades(true)}>
          <SendIcon data-icon="inline-start" />
          {demanades ? "Sol·licituds preparades · Jennifer" : "Demanar ofertes"}
        </Button>
      </div>
      {comparatiuNormalitzat.map((c) => (
        <PartidaCard
          key={c.partida}
          partida={c}
          triat={triat[c.partida]}
          adjudicat={adjudicat[c.partida]}
          onTria={(industrial) => setTriat((t) => ({ ...t, [c.partida]: industrial }))}
          onAdjudica={() => setAdjudicat((a) => ({ ...a, [c.partida]: triat[c.partida] }))}
          onDesfes={() =>
            setAdjudicat((a) => {
              const rest = { ...a };
              delete rest[c.partida];
              return rest;
            })
          }
        />
      ))}
    </div>
  );
}

function PartidaCard({
  partida: c,
  triat,
  adjudicat,
  onTria,
  onAdjudica,
  onDesfes,
}: {
  partida: Partida;
  triat: string;
  adjudicat?: string;
  onTria: (industrial: string) => void;
  onAdjudica: () => void;
  onDesfes: () => void;
}) {
  const ordenades = [...c.ofertes].sort((a, b) => a.normalitzat - b.normalitzat);
  const seleccio = c.ofertes.find((o) => o.industrial === (adjudicat ?? triat));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="mr-2 font-mono text-muted-foreground">{c.partida}</span>
          {c.nom}
        </CardTitle>
        <CardDescription>
          Referència Pujal {eurPrecise(c.preuRef)}/{c.unitat} · {c.ofertes.length} ofertes
        </CardDescription>
        {adjudicat && (
          <CardAction>
            <Badge className="bg-success/15 text-success">
              <CheckIcon data-icon="inline-start" />
              Adjudicat
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {ordenades.map((o) => (
          <OfertaFila
            key={o.industrial}
            oferta={o}
            unitat={c.unitat}
            codi={c.partida}
            millor={o.industrial === c.millor}
            mesBarataBrut={o.industrial === c.mesBarataBrut && c.millor !== c.mesBarataBrut}
            seleccionada={o.industrial === (adjudicat ?? triat)}
            bloquejada={!!adjudicat}
            onTria={() => onTria(o.industrial)}
          />
        ))}
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-2 border-t">
        {adjudicat && seleccio ? (
          <>
            <span className="text-label">
              {seleccio.industrial} ·{" "}
              <span className="font-mono tabular-nums">
                {eurPrecise(seleccio.normalitzat)}/{c.unitat}
              </span>
            </span>
            <Button size="sm" variant="ghost" onClick={onDesfes}>
              Desfer
            </Button>
          </>
        ) : (
          <>
            <span className="text-caption text-muted-foreground">
              {c.millor !== c.mesBarataBrut ? "La més barata en brut no és la millor" : " "}
            </span>
            <Button size="sm" onClick={onAdjudica}>
              Adjudicar a {triat}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

function OfertaFila({
  oferta: o,
  unitat,
  codi,
  millor,
  mesBarataBrut,
  seleccionada,
  bloquejada,
  onTria,
}: {
  oferta: Oferta;
  unitat: string;
  codi: string;
  millor: boolean;
  mesBarataBrut: boolean;
  seleccionada: boolean;
  bloquejada: boolean;
  onTria: () => void;
}) {
  const Icona = o.format === "Excel" ? FileSpreadsheetIcon : FileTextIcon;

  return (
    <button
      type="button"
      onClick={onTria}
      disabled={bloquejada}
      aria-pressed={seleccionada}
      className={cn(
        "grid w-full gap-x-6 gap-y-3 rounded-tile p-3 text-left ring-1 transition-colors disabled:cursor-default @2xl:grid-cols-[minmax(0,1fr)_auto] @2xl:items-center",
        seleccionada
          ? "bg-surface-inset ring-foreground/25"
          : "ring-surface-border hover:bg-surface-hover",
        bloquejada && !seleccionada && "opacity-50"
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            <Icona data-icon="inline-start" />
            {o.format}
          </Badge>
          <span className="text-body font-medium">{o.industrial}</span>
          {o.rebut && <span className="text-caption text-muted-foreground">{diaMes(o.rebut)}</span>}
          {millor && <Badge className="bg-brand-soft text-brand-text">Millor</Badge>}
          {mesBarataBrut && (
            <Badge variant="outline" className="text-muted-foreground">
              Més barata en brut
            </Badge>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-2 text-label">
          <span className="min-w-0 truncate text-muted-foreground" title={o.original}>
            «{o.original}»
          </span>
          <ArrowRightIcon className="size-3 shrink-0 text-faint-foreground" />
          <span className="shrink-0 font-mono">{codi}</span>
          {o.confianca && (
            <span className="shrink-0 font-mono text-caption text-success tabular-nums">
              {o.confianca}%
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 @2xl:flex-col @2xl:items-end">
        <div className="flex items-baseline gap-1.5 font-mono text-caption tabular-nums">
          <span className="text-muted-foreground">{eurPrecise(o.preu)}</span>
          {o.ajust ? (
            <span className="text-warning">
              +{eurPrecise(o.ajust.import)} {o.ajust.concepte.toLowerCase()}
            </span>
          ) : (
            o.nota && <span className="font-sans text-success">{o.nota.toLowerCase()}</span>
          )}
        </div>
        <span className="font-mono text-title-sm font-medium tabular-nums">
          {eurPrecise(o.normalitzat)}/{unitat}
        </span>
        <span
          className={cn(
            "font-mono text-caption tabular-nums",
            o.delta > 3 ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {o.delta > 0 ? "+" : ""}
          {pct(o.delta)} vs ref.
        </span>
      </div>
    </button>
  );
}
