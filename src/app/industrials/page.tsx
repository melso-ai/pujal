import Link from "next/link";

import { AskAction } from "@/components/chat/ask-action";
import {
  IndustrialsBrowser,
  type Categoria,
  type FilaIndustrial,
} from "@/components/industrials/industrials-browser";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { eur, plural } from "@/lib/format";
import {
  codis,
  familiesCobertes,
  grupDe,
  grups,
  industrials,
  nomFamilia,
  perFamilia,
  resumIndustrial,
  SENSE_OFERTA_PEDRASSES,
  type Industrial,
} from "@/lib/industrials";
import { ofertes } from "@/lib/pedrasses";

// Pedrasses offers first by price, then the suppliers with the most history.
function ordre(ind: Industrial, codi: string) {
  const r = resumIndustrial(ind, codi);
  return r.pedrasses ? (r.millorOferta ?? 1e11) : 1e12 - r.tancats * 1e6 - r.obres;
}

function fila(ind: Industrial, codi: string): FilaIndustrial {
  const r = resumIndustrial(ind, codi);
  const linia = r.pedrasses
    ? `Oferta a Pedrasses${r.ofertes > 1 ? ` · ${r.ofertes}` : ""}`
    : r.tancats
      ? `${plural(r.tancats, "preu tancat", "preus tancats")} · ${plural(r.obres, "obra", "obres")}`
      : ind.contractat
        ? `Contracte ${eur(ind.contractat)}`
        : `${plural(r.obres, "obra", "obres")}${ind.desde ? ` · des de ${ind.desde}` : ""}`;
  return {
    id: ind.id,
    nom: ind.nom,
    linia,
    valor: r.millorOferta !== null ? eur(r.millorOferta) : null,
    pedrasses: r.pedrasses,
  };
}

export default function IndustrialsPage() {
  const categories: Categoria[] = familiesCobertes.map((codi) => ({
    codi,
    nom: nomFamilia(codi),
    grup: grupDe(codi),
    industrials: perFamilia(codi)
      .sort((a, b) => ordre(a, codi) - ordre(b, codi))
      .map((i) => fila(i, codi)),
  }));
  const buides = codis
    .filter((c) => !familiesCobertes.includes(c))
    .map((codi) => ({ codi, nom: nomFamilia(codi), grup: grupDe(codi) }));
  const ambOferta = industrials.filter((i) => i.ofertes.length > 0).length;

  return (
    <>
      <PageHeader crumbs={[{ label: "Industrials" }]} />
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <span className="text-caption text-muted-foreground">Industrials</span>
          <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">{industrials.length}</span>
          <span className="text-caption text-muted-foreground">
            {familiesCobertes.length} de {codis.length} categories cobertes
          </span>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Han ofertat a Pedrasses" value={ambOferta} hint={`${ofertes.length} ofertes`} />
          <Stat label="Amb preus tancats" value={industrials.filter((i) => i.tancats.length > 0).length} />
          <Stat label="Categories sense industrial" value={buides.length} />
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-title-sm font-semibold">Pedrasses · sense oferta</h2>
            <Link href="/pressupostos/pedrasses" className="text-label text-muted-foreground hover:text-foreground">
              Estudi
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
            {SENSE_OFERTA_PEDRASSES.map((codi) => {
              const candidats = perFamilia(codi).slice(0, 3);
              return (
                <div key={codi} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-body font-medium">
                      <span className="mr-2 font-mono text-caption text-muted-foreground">{codi}</span>
                      {nomFamilia(codi)}
                    </span>
                    <span className="truncate text-caption text-muted-foreground">
                      {candidats.length ? candidats.map((c) => c.nom).join(", ") : "Cap industrial"}
                    </span>
                  </div>
                  {candidats.length > 0 && (
                    <AskAction
                      size="sm"
                      variant="outline"
                      className="shrink-0 rounded-full"
                      prompt={`Redacta un correu a ${candidats.map((c) => c.nom).join(" i ")} per demanar oferta de ${nomFamilia(codi).toLowerCase()} per a Xalets Les Pedrasses (2 habitatges adossats a La Massana). Necessitem el preu abans del 13 de novembre.`}
                    >
                      Demanar oferta
                    </AskAction>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-title-sm font-semibold">Per categoria</h2>
          <IndustrialsBrowser categories={categories} buides={buides} grups={grups.map((g) => g.nom)} />
        </section>
      </div>
    </>
  );
}
