import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { AskAction } from "@/components/chat/ask-action";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Progress } from "@/components/ui/progress";
import {
  agrupables,
  comandesMarc,
  estalviTotal,
  estalviSiAdjudica,
  MESOS,
  obresImplicades,
  oportunitats,
  PERIODE,
  promptNegociar,
  volumFormigo,
  type Oportunitat,
} from "@/lib/compres";
import { eur, num, pct } from "@/lib/format";
import { mesLabel, mesosLabel, preu, volumLabel } from "@/lib/preus";

function ObraChip({ nom, siAdjudica }: { nom: string; siAdjudica?: boolean }) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded-full px-2 text-caption whitespace-nowrap ${
        siAdjudica ? "border border-dashed border-muted-foreground/40 text-muted-foreground" : "bg-surface-inset"
      }`}
    >
      {siAdjudica ? `${nom} · si s'adjudica` : nom}
    </span>
  );
}

function Fila({ o, rank }: { o: Oportunitat; rank: number }) {
  const mesos = MESOS.filter((_, i) => o.perMes[i] > 0);
  return (
    <article className="group relative flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-surface-hover @2xl:flex-row @2xl:items-center @2xl:gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="w-4 shrink-0 font-mono text-caption text-muted-foreground tabular-nums">{rank}</span>
          <Link
            href={`/compres/${o.id}`}
            className="truncate text-body font-medium after:absolute after:inset-0"
          >
            {o.nom}
          </Link>
        </div>
        <span className="pl-6 font-mono text-caption text-muted-foreground tabular-nums">
          {volumLabel(o.volum, o.unitat)} · {mesosLabel(mesos)}
        </span>
        <div className="flex flex-wrap gap-1.5 pl-6">
          {o.demanda.map((d) => (
            <ObraChip key={d.obra.id} nom={d.obra.curt} siAdjudica={d.siAdjudica} />
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 pl-6 @2xl:w-44 @2xl:flex-col @2xl:items-end @2xl:gap-0.5 @2xl:pl-0">
        <span className="font-mono text-caption text-muted-foreground tabular-nums @2xl:order-2">
          {preu(o.referencia)} → {preu(o.preuObjectiu)}/{o.unitat}
        </span>
        <span className="font-mono text-title-sm font-medium text-brand-text tabular-nums @2xl:order-1">
          {eur(o.estalvi)}
        </span>
      </div>

      <div className="flex items-center gap-2 pl-6 @2xl:pl-0">
        <AskAction size="sm" variant="outline" className="relative z-10 rounded-full" prompt={promptNegociar(o)}>
          Negociar volum
        </AskAction>
        <ArrowRightIcon className="hidden size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 @2xl:block" />
      </div>
    </article>
  );
}

export default function CompresPage() {
  const soles = oportunitats.filter((o) => !o.agrupable && o.volum > 0);

  return (
    <>
      <PageHeader crumbs={[{ label: "Compres" }]} />
      <div className="@container flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <span className="text-caption text-muted-foreground">Estalvi agrupant compres · {PERIODE}</span>
          <span className="font-mono text-5xl font-medium tracking-tight text-brand-text tabular-nums">
            {eur(estalviTotal)}
          </span>
          <span className="text-caption text-muted-foreground">
            {agrupables.length} elements · {obresImplicades} obres
            {estalviSiAdjudica > 0 && ` · +${eur(estalviSiAdjudica)} si s'adjudica Pedrasses`}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Elements agrupables" value={agrupables.length} hint={`de ${oportunitats.length}`} />
          <Stat label="Obres implicades" value={obresImplicades} hint="+ Pedrasses si s'adjudica" />
          <Stat label="Volum formigó" value={`${num(volumFormigo)} m³`} hint={PERIODE} />
          <Stat label="Comandes marc actives" value={comandesMarc.length} />
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-title-sm font-semibold">Oportunitats</h2>
            <span className="text-caption text-muted-foreground">per estalvi</span>
          </div>
          <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
            {agrupables.map((o, i) => (
              <Fila key={o.id} o={o} rank={i + 1} />
            ))}
          </div>
          {soles.length > 0 && (
            <span className="text-caption text-muted-foreground">
              Una sola obra:{" "}
              {soles.map((o, i) => (
                <span key={o.id}>
                  {i > 0 && ", "}
                  <Link href={`/compres/${o.id}`} className="hover:text-foreground hover:underline">
                    {o.nom}
                  </Link>
                </span>
              ))}
            </span>
          )}
        </section>

        <section id="comandes-marc" className="flex flex-col gap-3">
          <h2 className="text-title-sm font-semibold">Comandes marc actives</h2>
          <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
            {comandesMarc.map((c) => {
              const usat = (c.consumit / c.volum) * 100;
              return (
                <div key={c.codi} className="flex flex-col gap-3 px-4 py-3 @2xl:flex-row @2xl:items-center @2xl:gap-6">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-body font-medium">{c.concepte}</span>
                    <span className="truncate text-caption text-muted-foreground">
                      <span className="font-mono">{c.codi}</span> ·{" "}
                      {c.industrialId ? (
                        <Link href={`/industrials/${c.industrialId}`} className="hover:text-foreground hover:underline">
                          {c.industrial}
                        </Link>
                      ) : (
                        c.industrial
                      )}{" "}
                      · {c.obres.length} obres
                    </span>
                  </div>
                  <span className="font-mono text-label tabular-nums @2xl:w-24 @2xl:text-right">
                    {preu(c.preu)}/{c.unitat}
                  </span>
                  <div className="flex flex-col gap-1.5 @2xl:w-56">
                    <Progress value={usat} aria-label={`${c.codi} consumit`} />
                    <div className="flex justify-between gap-2 font-mono text-caption text-muted-foreground tabular-nums">
                      <span>
                        {num(c.consumit)} / {num(c.volum)} {c.unitat} · {pct(usat, 0)}
                      </span>
                      <span>fins {mesLabel(c.fi)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
