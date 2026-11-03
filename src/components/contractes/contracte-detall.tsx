"use client";

import Link from "next/link";
import {
  CheckIcon,
  DownloadIcon,
  PencilIcon,
  RotateCcwIcon,
  SendIcon,
  SignatureIcon,
  SparklesIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AskAction } from "@/components/chat/ask-action";
import { ContracteDoc } from "@/components/contractes/contracte-doc";
import { EstatContracte } from "@/components/contractes/estat-contracte";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ara,
  clausula,
  diesFins,
  estatDe,
  getProjecte,
  hora,
  hrefRegenerar,
  quan,
  retingut,
  retornRetencio,
  SIGNANT,
  venceAviat,
  type Contracte,
} from "@/lib/contractes";
import { date, eur } from "@/lib/format";
import { nomFamilia } from "@/lib/industrials";
import { cn } from "@/lib/utils";

export function ContracteDetall({
  inicial,
  avis: avisInicial,
  onEditar,
}: {
  inicial: Contracte;
  avis?: string;
  onEditar?: () => void;
}) {
  const [c, setC] = useState(inicial);
  const [avis, setAvis] = useState<string | null>(avisInicial ?? null);
  const [pdf, setPdf] = useState(false);

  useEffect(() => {
    if (!pdf) return;
    const t = setTimeout(() => setPdf(false), 3500);
    return () => clearTimeout(t);
  }, [pdf]);

  const p = getProjecte(c.obra);
  const estat = estatDe(c);
  const dies = diesFins(c.venciment);
  const retorn = retornRetencio(c);

  const enviar = () => {
    const t = ara();
    setC({ ...c, estat: "enviat", enviat: t });
    setAvis(`Enviat al Portal del Govern · ${hora(t)}`);
  };
  const signar = () => {
    const t = ara();
    setC({ ...c, estat: "signat", signat: t });
    setAvis(`Signat per ${SIGNANT} i ${c.contrapart} · ${hora(t)}`);
  };

  const revisar = `Revisa el contracte ${c.num} amb ${c.contrapart} (${p?.nom}): ${eur(c.import)}, pagament clàusula ${clausula(c.pagament)} a ${c.pagament} dies, ${c.retencio ? "retenció del 5%" : "sense retenció"}, venç el ${date(c.venciment)}. Hi ha cap risc o clàusula que hauríem de canviar abans de signar-lo?`;

  const passos = [
    { titol: "Esborrany", detall: `${c.autor} · ${quan(c.creat)}`, fet: true },
    {
      titol: "Enviat a signar",
      detall: c.enviat ? `Portal del Govern · ${quan(c.enviat)}` : "Portal del Govern",
      fet: Boolean(c.enviat),
    },
    {
      titol: estat === "caducat" ? "Caducat" : "Signat",
      detall: c.signat
        ? `${SIGNANT} i ${c.contrapart} · ${quan(c.signat)}`
        : estat === "caducat"
          ? `Venciment ${date(c.venciment)}`
          : "Certificat digital de l'empresa",
      fet: Boolean(c.signat),
    },
  ];
  const actual = passos.findIndex((s) => !s.fet);

  return (
    <div className="@container flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {c.num}
          </Badge>
          <Badge variant="secondary">{c.tipus === "client" ? "Client" : c.familia ? nomFamilia(c.familia) : "Industrial"}</Badge>
          <EstatContracte estat={estat} />
          {venceAviat(c) && (
            <Badge variant="outline" className="text-warning">
              Venç en {dies} dies
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-display-sm font-semibold tracking-tight break-words">{c.contrapart}</h1>
          {p && (
            <Link href={p.href} className="w-fit text-label text-muted-foreground hover:text-foreground">
              <span className="font-mono">{p.num}</span> · {p.nom}
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-x-12 gap-y-4">
        <div className="flex flex-col gap-1">
          <span className="text-caption text-muted-foreground">Import</span>
          <span className="font-mono text-4xl font-medium tracking-tight tabular-nums sm:text-5xl">{eur(c.import)}</span>
          <span className="text-caption text-muted-foreground">IGI a part</span>
        </div>
        <Stat label="Pagament" value={`${c.pagament} dies`} hint={`Clàusula ${clausula(c.pagament)}`} />
        <Stat
          label="Retenció"
          value={c.retencio ? "5%" : "—"}
          hint={c.retencio ? (c.executat ? `${eur(retingut(c))} retingut` : "De cada certificació") : "Sense retenció"}
        />
        <Stat
          label="Venciment"
          value={date(c.venciment)}
          hint={dies < 0 ? `Fa ${-dies} dies` : `En ${dies} dies`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {estat === "esborrany" && (
            <Button size="sm" className="rounded-full" onClick={enviar}>
              <SendIcon data-icon="inline-start" />
              Enviar a signar
            </Button>
          )}
          {estat === "enviat" && (
            <Button size="sm" className="rounded-full" onClick={signar}>
              <SignatureIcon data-icon="inline-start" />
              Simular signatura
            </Button>
          )}
          {estat === "caducat" && (
            <Button size="sm" className="rounded-full" nativeButton={false} render={<Link href={hrefRegenerar(c)} />}>
              <RotateCcwIcon data-icon="inline-start" />
              Regenerar
            </Button>
          )}
          <Button
            size="sm"
            variant={estat === "signat" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setPdf(true)}
          >
            <DownloadIcon data-icon="inline-start" />
            Descarregar PDF
          </Button>
          <AskAction size="sm" variant="outline" className="rounded-full" prompt={revisar}>
            <SparklesIcon data-icon="inline-start" />
            Revisar amb IA
          </AskAction>
          {onEditar && estat === "esborrany" && (
            <Button size="sm" variant="ghost" className="rounded-full" onClick={onEditar}>
              <PencilIcon data-icon="inline-start" />
              Editar
            </Button>
          )}
        </div>
        {(avis || pdf) && (
          <div className="flex flex-col gap-1 text-caption text-success" role="status">
            {avis && (
              <span className="flex items-center gap-1.5">
                <CheckIcon className="size-3.5 shrink-0" />
                {avis}
              </span>
            )}
            {pdf && (
              <span className="flex items-center gap-1.5">
                <CheckIcon className="size-3.5 shrink-0" />
                {c.num}.pdf descarregat
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 @4xl:grid-cols-[minmax(0,1fr)_300px] @4xl:items-start">
        <ContracteDoc c={c} className="@4xl:col-start-1 @4xl:row-start-1" />

        <aside className="row-start-1 flex flex-col gap-8 @4xl:col-start-2">
          <section className="flex flex-col gap-3">
            <h2 className="text-title-sm font-semibold">Signatura</h2>
            <ol className="flex flex-col rounded-card bg-card p-4 ring-1 ring-surface-border">
              {passos.map((s, i) => (
                <li key={s.titol} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < passos.length - 1 && (
                    <span
                      className={cn(
                        "absolute top-6 bottom-1 left-[9px] w-px",
                        passos[i + 1].fet ? "bg-foreground/40" : "bg-surface-border"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative mt-0.5 flex size-[19px] shrink-0 items-center justify-center rounded-full ring-1",
                      s.fet
                        ? "bg-foreground text-background ring-foreground"
                        : i === actual && estat !== "caducat"
                          ? "bg-brand-soft ring-brand"
                          : i === actual
                            ? "bg-destructive/10 ring-destructive"
                            : "bg-card ring-surface-border"
                    )}
                  >
                    {s.fet && <CheckIcon className="size-3" />}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className={cn("text-label font-medium", !s.fet && i !== actual && "text-muted-foreground")}>
                      {s.titol}
                    </span>
                    <span className="text-caption text-muted-foreground">{s.detall}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {c.retencio && retorn && (
            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm font-semibold">Retenció 5%</h2>
              <div className="flex flex-col divide-y divide-surface-border rounded-card bg-card ring-1 ring-surface-border">
                {c.executat > 0 && (
                  <Fila
                    label={c.tipus === "client" ? "Ens han retingut" : "Hem retingut"}
                    valor={eur(retingut(c))}
                    hint={`5% de ${eur(c.executat)} executat`}
                  />
                )}
                <Fila
                  label="Retorn"
                  valor={date(retorn)}
                  hint={diesFins(retorn) >= 0 ? `En ${diesFins(retorn)} dies · 1 any després de l'obra` : "Retornada"}
                />
                <Fila label="Assentament 1" valor="5% a retencions" hint="A cada certificació" />
                <Fila label="Assentament 2" valor="Devolució" hint={date(retorn)} />
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Fila({ label, valor, hint }: { label: string; valor: string; hint: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-col">
        <span className="text-label">{label}</span>
        <span className="text-caption text-muted-foreground">{hint}</span>
      </div>
      <span className="shrink-0 text-right font-mono text-label tabular-nums">{valor}</span>
    </div>
  );
}
