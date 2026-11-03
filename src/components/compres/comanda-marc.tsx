"use client";

import { CheckIcon, FilePlusIcon } from "lucide-react";
import { useState } from "react";

import { AskAction } from "@/components/chat/ask-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { eur, eurPrecise, num } from "@/lib/format";
import { cn } from "@/lib/utils";

type Industrial = { id: string; nom: string; preu: string | null };
type Mes = { mes: string; label: string; volum: number; obres: string };

const preu = (n: number) => (n < 1000 ? eurPrecise(n) : eur(n));

function arrodonir(n: number) {
  if (n < 5) return Math.round(n * 100) / 100;
  if (n < 1000) return Math.round(n * 2) / 2;
  return Math.round(n / 10) * 10;
}

export function ComandaMarc({
  codi,
  element,
  unitat,
  referencia,
  objectiu,
  industrials,
  mesos,
  children,
}: {
  codi: string;
  element: string;
  unitat: string;
  referencia: number;
  objectiu: number;
  industrials: Industrial[];
  mesos: Mes[];
  children?: React.ReactNode;
}) {
  const [fase, setFase] = useState<"tancat" | "editant" | "creada">("tancat");
  const [ind, setInd] = useState(0);
  const [valor, setValor] = useState(String(arrodonir(objectiu)));
  const [triats, setTriats] = useState(() => mesos.filter((m) => m.volum > 0).map((m) => m.mes));

  const p = Number(valor.replace(",", "."));
  const sel = mesos.filter((m) => triats.includes(m.mes));
  const volum = sel.reduce((s, m) => s + m.volum, 0);
  const valid = p > 0 && volum > 0 && industrials.length > 0;
  const estalvi = volum * (referencia - p);
  const periode = sel.length > 1 ? `${sel[0].label} – ${sel[sel.length - 1].label}` : (sel[0]?.label ?? "");
  const nomInd = industrials[ind]?.nom ?? "";

  const commuta = (mes: string) =>
    setTriats((t) => (t.includes(mes) ? t.filter((x) => x !== mes) : [...t, mes]));

  const resum = [
    { label: "Volum", value: `${num(volum)} ${unitat}` },
    { label: "Import", value: eur(volum * p) },
    { label: estalvi >= 0 ? "Estalvi" : "Sobrecost", value: eur(Math.abs(estalvi)), to: estalvi >= 0 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {children}
        {fase !== "creada" && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            aria-expanded={fase === "editant"}
            onClick={() => setFase(fase === "editant" ? "tancat" : "editant")}
          >
            <FilePlusIcon data-icon="inline-start" />
            Crear comanda marc
          </Button>
        )}
      </div>

      {fase === "editant" && (
        <form
          className="@container flex max-w-2xl flex-col gap-5 rounded-card bg-card p-4 ring-1 ring-surface-border duration-200 animate-in fade-in slide-in-from-top-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) setFase("creada");
          }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-title-sm font-semibold">Nova comanda marc</span>
            <span className="font-mono text-caption text-muted-foreground">{codi}</span>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-caption text-muted-foreground">Industrial</legend>
            <div className="grid gap-2 @md:grid-cols-3">
              {industrials.map((i, k) => (
                <button
                  key={i.id}
                  type="button"
                  aria-pressed={k === ind}
                  onClick={() => setInd(k)}
                  className={cn(
                    "flex min-w-0 flex-col gap-0.5 rounded-tile px-3 py-2 text-left ring-1 transition-colors",
                    k === ind ? "bg-surface-inset ring-foreground/25" : "ring-surface-border hover:bg-surface-hover"
                  )}
                >
                  <span className="truncate text-label font-medium">{i.nom}</span>
                  <span className="font-mono text-caption text-muted-foreground tabular-nums">
                    {i.preu ? `${i.preu} mitjà` : "Sense preus tancats"}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor="preu-comanda" className="text-caption text-muted-foreground">
              Preu
            </label>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-2">
                <Input
                  id="preu-comanda"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={objectiu < 5 ? 0.01 : objectiu < 1000 ? 0.5 : 10}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-28 font-mono tabular-nums"
                />
                <span className="font-mono text-label text-muted-foreground">€/{unitat}</span>
              </div>
              <span className="font-mono text-caption text-muted-foreground tabular-nums">
                objectiu {preu(objectiu)} · ref. {preu(referencia)}
              </span>
            </div>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-caption text-muted-foreground">Mesos</legend>
            <div className="grid grid-cols-2 gap-2 @md:grid-cols-4">
              {mesos.map((m) => (
                <button
                  key={m.mes}
                  type="button"
                  disabled={m.volum === 0}
                  aria-pressed={triats.includes(m.mes)}
                  onClick={() => commuta(m.mes)}
                  className={cn(
                    "flex flex-col gap-0.5 rounded-tile px-3 py-2 text-left ring-1 transition-colors disabled:opacity-40",
                    triats.includes(m.mes)
                      ? "bg-surface-inset ring-foreground/25"
                      : "ring-surface-border hover:bg-surface-hover"
                  )}
                >
                  <span className="text-label font-medium">{m.label}</span>
                  <span className="font-mono text-caption text-muted-foreground tabular-nums">
                    {m.volum ? `${num(m.volum)} ${unitat}` : "—"}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-3 gap-3 rounded-tile bg-surface-inset p-3">
            {resum.map((r) => (
              <div key={r.label} className="flex min-w-0 flex-col gap-0.5">
                <span className="text-caption text-muted-foreground">{r.label}</span>
                <span
                  className={`truncate font-mono text-label font-medium tabular-nums ${
                    r.to === true ? "text-brand-text" : r.to === false ? "text-warning" : ""
                  }`}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={!valid}>
              Crear comanda marc
            </Button>
            <Button type="button" variant="ghost" onClick={() => setFase("tancat")}>
              Cancel·lar
            </Button>
          </div>
        </form>
      )}

      {fase === "creada" && (
        <div className="@container flex max-w-2xl flex-col gap-4 rounded-card bg-card p-4 ring-1 ring-surface-border duration-200 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-text">
              <CheckIcon className="size-4" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-body font-medium">Comanda marc creada</span>
              <span className="truncate text-caption text-muted-foreground">
                <span className="font-mono">{codi}</span> · {nomInd}
              </span>
            </div>
            <Badge variant="outline" className="text-success">
              Activa
            </Badge>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 @md:grid-cols-4">
            {[
              { label: "Preu", value: `${preu(p)}/${unitat}` },
              { label: "Volum", value: `${num(volum)} ${unitat}` },
              { label: "Període", value: periode },
              { label: "Import", value: eur(volum * p) },
            ].map((d) => (
              <div key={d.label} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-caption text-muted-foreground">{d.label}</dt>
                <dd className="truncate font-mono text-label font-medium tabular-nums">{d.value}</dd>
              </div>
            ))}
          </dl>

          {estalvi > 0 && (
            <span className="font-mono text-label text-brand-text tabular-nums">
              {eur(estalvi)} d&apos;estalvi vs. referència
            </span>
          )}

          <div className="flex flex-wrap gap-2">
            <AskAction
              size="sm"
              className="rounded-full"
              prompt={`Redacta un correu a ${nomInd} per confirmar la comanda marc ${codi} de ${element}: ${num(volum)} ${unitat} entre ${periode} a ${preu(p)}/${unitat}. Lliuraments: ${sel
                .map((m) => `${m.label} ${num(m.volum)} ${unitat} (${m.obres})`)
                .join("; ")}. Demana que la confirmin per escrit i que facturin per obra.`}
            >
              Enviar a {nomInd}
            </AskAction>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setFase("editant")}>
              Editar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
