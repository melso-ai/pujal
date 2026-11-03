import Link from "next/link";
import { notFound } from "next/navigation";
import { FileTextIcon } from "lucide-react";
import { Suspense } from "react";

import { AskAction } from "@/components/chat/ask-action";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { date, eur } from "@/lib/format";
import { getIndustrial, industrials, nomFamilia } from "@/lib/industrials";
import { preu, volumLabel } from "@/lib/preus";

export function generateStaticParams() {
  return industrials.map((i) => ({ id: i.id }));
}

const TANCATS_VISIBLES = 12;

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

      <div className="flex flex-col gap-8 p-4 md:p-8">
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

        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Ofertes a Pedrasses" value={ind.ofertes.length} />
          <Stat label="Preus tancats" value={ind.tancats.length} />
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
            <div className="grid gap-3 lg:grid-cols-2">
              {ind.ofertes.map((o) => (
                <article key={o.id} className="flex flex-col gap-3 rounded-card bg-card p-4 ring-1 ring-surface-border">
                  <div className="flex items-start justify-between gap-4">
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
                  <div className="mt-auto flex items-center gap-1.5 text-caption text-muted-foreground">
                    <FileTextIcon className="size-3.5 shrink-0" />
                    <span className="truncate">{o.fitxer}</span>
                    {o.data && <span className="ml-auto shrink-0">{date(o.data)}</span>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {ind.tancats.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-title-sm font-semibold">Preus tancats</h2>
            <div className="overflow-x-auto rounded-xl ring-1 ring-surface-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Data</TableHead>
                    <TableHead>Element</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead className="text-right">Volum</TableHead>
                    <TableHead className="pr-4 text-right">Preu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ind.tancats.slice(0, TANCATS_VISIBLES).map((t, i) => (
                    <TableRow key={`${t.elementId}-${t.data}-${i}`}>
                      <TableCell className="pl-4 font-mono text-muted-foreground tabular-nums">{date(t.data)}</TableCell>
                      <TableCell>
                        <Link href={`/preus/${t.elementId}`} className="hover:underline">
                          {t.element}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{t.obra}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{volumLabel(t.volum, t.unitat)}</TableCell>
                      <TableCell className="pr-4 text-right font-mono tabular-nums">
                        {preu(t.preu)}/{t.unitat}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {ind.tancats.length > TANCATS_VISIBLES && (
              <span className="text-caption text-muted-foreground">
                {ind.tancats.length - TANCATS_VISIBLES} més · {ind.obres.join(", ")}
              </span>
            )}
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
