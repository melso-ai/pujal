import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AskAction } from "@/components/chat/ask-action";
import { PageHeader } from "@/components/page-header";
import { TancamentsBrowser } from "@/components/preus/tancaments-browser";
import { OfertaResum } from "@/components/industrials/oferta-resum";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { date, eur } from "@/lib/format";
import { getIndustrial, industrials, nomFamilia } from "@/lib/industrials";
import { preu, volumLabel } from "@/lib/preus";

export function generateStaticParams() {
  return industrials.map((i) => ({ id: i.id }));
}

export default function IndustrialPage(props: PageProps<"/industrials/[id]">) {
  return (
    <Suspense fallback={null}>
      <Fitxa params={props.params} />
    </Suspense>
  );
}

async function Fitxa({ params }: { params: PageProps<"/industrials/[id]">["params"] }) {
  const { id } = await params;
  const ind = getIndustrial(id);
  if (!ind) notFound();

  const categories = ind.families.map((f) => nomFamilia(f).toLowerCase()).join(", ");
  const oferta = ind.ofertes.find((o) => o.baseImposable);
  const demanar = oferta
    ? `Redacta un correu a ${ind.nom} per negociar la seva oferta de ${oferta.familiaNom.toLowerCase()} de Xalets Les Pedrasses (${eur(oferta.baseImposable!)})${oferta.exclusions[0] ? ` i demanar que aclareixi si inclou: ${oferta.exclusions[0]}` : ""}.`
    : `Redacta un correu a ${ind.nom} per demanar oferta de ${categories} per a Xalets Les Pedrasses (2 habitatges adossats a La Massana). Necessitem el preu abans del 13 de novembre.`;

  return (
    <>
      <PageHeader crumbs={[{ label: "Industrials", href: "/industrials" }, { label: ind.nom }]} />

      <div className="@container flex min-w-0 flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {ind.families.map((f) => (
              <Badge key={f} variant="outline">
                <span className="font-mono text-muted-foreground">{f}</span>
                {nomFamilia(f)}
              </Badge>
            ))}
          </div>
          <h1 className="text-display-sm font-semibold tracking-tight">{ind.nom}</h1>
          <div className="flex flex-wrap gap-2">
            <AskAction size="sm" className="rounded-full" prompt={demanar}>
              {oferta ? "Negociar oferta" : "Demanar oferta"}
            </AskAction>
            <AskAction
              size="sm"
              variant="outline"
              className="rounded-full"
              prompt={`Què hem de saber de ${ind.nom}? Ofertes, preus tancats i obres on ha treballat amb nosaltres.`}
            >
              Preguntar
            </AskAction>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-caption text-muted-foreground">
            {ind.ofertes.length > 0 ? "Ofertes a Pedrasses" : "Preus tancats"}
          </span>
          <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
            {ind.ofertes.length > 0 ? ind.ofertes.length : ind.tancats.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-4">
          {ind.ofertes.length > 0 && <Stat label="Preus tancats" value={ind.tancats.length} />}
          <Stat
            label="Obres amb Pujal"
            value={ind.obresHistoric || "—"}
            hint={ind.desde ? `des de ${ind.desde}` : undefined}
          />
          <Stat label="Contractat" value={ind.contractat ? eur(ind.contractat) : "—"} />
          <Stat label="Últim contacte" value={ind.ultimContacte ? date(ind.ultimContacte) : "—"} />
        </div>

        {ind.ofertes.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-title-sm font-semibold">Ofertes · Xalets Les Pedrasses</h2>
              <Link href="/pressupostos/pedrasses" className="text-label text-muted-foreground hover:text-foreground">
                Comparatiu
              </Link>
            </div>
            <div className="grid gap-3 @3xl:grid-cols-2">
              {ind.ofertes.map((o) => (
                <article key={o.id} className="flex flex-col gap-3 rounded-card bg-card p-4 ring-1 ring-surface-border">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-caption text-muted-foreground">
                        <span className="font-mono">{o.familia}</span> {o.familiaNom} · {o.habitatges}
                      </span>
                      <h3 className="text-body font-medium">{o.abast}</h3>
                    </div>
                    <span className="shrink-0 font-mono text-body font-medium tabular-nums">
                      {o.baseImposable ? eur(o.baseImposable) : "sense import"}
                    </span>
                  </div>
                  {o.exclusions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {o.exclusions.slice(0, 4).map((x) => (
                        <Badge key={x} variant="outline" className="h-auto max-w-full text-warning whitespace-normal">
                          No inclou: {x}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {o.condicions.length > 0 && (
                    <ul className="flex flex-col gap-0.5 text-caption text-muted-foreground">
                      {o.condicions.slice(0, 3).map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  )}
                  <OfertaResum oferta={o} />
                </article>
              ))}
            </div>
          </section>
        )}

        {ind.tancats.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-title-sm font-semibold">Preus tancats</h2>
            <TancamentsBrowser files={ind.tancats.map((t, i) => ({
              id: `${t.elementId}-${t.data}-${i}`,
              data: t.data,
              dataLabel: date(t.data),
              element: t.element,
              elementHref: `/preus/${t.elementId}`,
              obra: t.obra,
              obraHref: `/obres/${t.obraId}`,
              capObra: t.capObra,
              volum: volumLabel(t.volum, t.unitat),
              preu: `${preu(t.preu)}/${t.unitat}`,
              valor: t.preu,
            }))} />
          </section>
        )}

        {ind.ofertes.length === 0 && ind.tancats.length === 0 && (
          <div className="rounded-card bg-surface-inset px-5 py-6 text-body text-muted-foreground">
            Encara no hi ha ofertes ni preus tancats al sistema.
            {ind.obresHistoric > 0 && ` ${ind.obresHistoric} obres amb Pujal${ind.desde ? ` des de ${ind.desde}` : ""}.`}
          </div>
        )}
      </div>
    </>
  );
}
