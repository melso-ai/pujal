"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { estudis, etapesEstudi } from "@/lib/data";
import { date, eur, num } from "@/lib/format";

export function EstudisBrowser() {
  const [cerca, setCerca] = useState("");
  const [etapa, setEtapa] = useState("");
  const [ordre, setOrdre] = useState("lliurament");
  const items = estudis.filter((e) =>
    `${e.nom} ${e.arquitecte} ${e.responsable}`.toLocaleLowerCase("ca").includes(cerca.trim().toLocaleLowerCase("ca")) &&
    (etapa === "" || e.etapa === Number(etapa))
  ).sort((a, b) => ordre === "import" ? b.importEstimat - a.importEstimat : ordre === "nom" ? a.nom.localeCompare(b.nom, "ca") : a.lliurament.localeCompare(b.lliurament));

  return (
    <section className="@container flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-52">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Cercar estudis" placeholder="Cerca un estudi o arquitecte…" value={cerca} onChange={(e) => setCerca(e.target.value)} className="pl-9" />
        </div>
        <select aria-label="Filtrar per etapa" value={etapa} onChange={(e) => setEtapa(e.target.value)} className="h-9 min-w-0 rounded-lg border bg-card px-3 text-label">
          <option value="">Totes les etapes</option>
          {etapesEstudi.map((e, i) => <option key={e} value={i}>{e}</option>)}
        </select>
        <select aria-label="Ordenar estudis" value={ordre} onChange={(e) => setOrdre(e.target.value)} className="h-9 rounded-lg border bg-card px-3 text-label">
          <option value="lliurament">Proper lliurament</option>
          <option value="import">Import més alt</option>
          <option value="nom">Nom A–Z</option>
        </select>
      </div>
      <span role="status" className="text-caption text-muted-foreground">{items.length} de {estudis.length} estudis</span>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card bg-surface-inset p-8 text-center">
          <span className="text-body font-medium">Cap estudi amb aquests filtres</span>
          <Button variant="outline" onClick={() => { setCerca(""); setEtapa(""); }}>Netejar filtres</Button>
        </div>
      ) : (
        <div className="grid gap-4 @4xl:grid-cols-5">
          {etapesEstudi.map((nom, i) => {
            if (etapa !== "" && Number(etapa) !== i) return null;
            const grup = items.filter((e) => e.etapa === i);
            return (
              <section key={nom} className="flex min-w-0 flex-col gap-3">
                <div className="flex items-center justify-between gap-2 px-1">
                  <h2 className="text-label font-medium"><span className="mr-2 font-mono text-muted-foreground">{i + 1}</span>{nom}</h2>
                  <Badge variant="outline" className="font-mono tabular-nums">{grup.length}</Badge>
                </div>
                <div className="grid gap-3 rounded-card bg-surface-inset p-2 @lg:grid-cols-2 @4xl:min-h-40 @4xl:grid-cols-1 @4xl:content-start">
                  {grup.map((e) => (
                    <Link key={e.id} href={`/pressupostos/${e.id}`} className="group flex min-w-0 flex-col gap-3 rounded-tile bg-card p-4 ring-1 ring-surface-border transition-colors hover:bg-surface-hover">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-body font-medium">{e.nom}</h3>
                          <span className="text-caption text-muted-foreground">{e.arquitecte}</span>
                        </div>
                        <ArrowRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      </div>
                      <span className="font-mono text-label tabular-nums">{e.importEstimat > 0 ? eur(e.importEstimat) : "Pendent de valorar"}</span>
                      <div className="flex flex-wrap items-center justify-between gap-1 border-t border-surface-border pt-3 text-caption text-muted-foreground">
                        <span>Lliurament <span className="font-mono">{date(e.lliurament)}</span></span>
                        {e.superficie > 0 && <span className="font-mono">{num(e.superficie)} m²</span>}
                        <span>{e.responsable}</span>
                      </div>
                    </Link>
                  ))}
                  {grup.length === 0 && <span className="px-3 py-5 text-caption text-muted-foreground">Cap estudi en aquesta etapa</span>}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
