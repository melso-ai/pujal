"use client";

import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Preformatted on the server so hydration never depends on the browser's ICU.
export type FilaIndustrial = {
  id: string;
  nom: string;
  linia: string;
  valor: string | null;
  pedrasses: boolean;
};

export type Categoria = {
  codi: string;
  nom: string;
  grup: string;
  industrials: FilaIndustrial[];
};

const normalitza = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function IndustrialsBrowser({
  categories,
  buides,
  grups,
}: {
  categories: Categoria[];
  buides: Omit<Categoria, "industrials">[];
  grups: string[];
}) {
  const [grup, setGrup] = useState("Totes");
  const [cerca, setCerca] = useState("");

  const q = normalitza(cerca.trim());
  const delGrup = <T extends { grup: string }>(c: T) => grup === "Totes" || c.grup === grup;
  const visibles = categories.filter(
    (c) =>
      delGrup(c) &&
      (!q || normalitza(`${c.codi} ${c.nom} ${c.industrials.map((i) => i.nom).join(" ")}`).includes(q))
  );
  const senseIndustrial = buides.filter((c) => delGrup(c) && (!q || normalitza(`${c.codi} ${c.nom}`).includes(q)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={grup} onValueChange={(v) => setGrup(String(v))} className="max-w-full">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <TabsList>
              {["Totes", ...grups].map((g) => (
                <TabsTrigger key={g} value={g} className="px-2.5">
                  {g}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
        <InputGroup className="min-w-48 flex-1 sm:max-w-64">
          <InputGroupInput
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Categoria o industrial"
            aria-label="Cercar"
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {visibles.map((c) => (
          <section
            key={c.codi}
            aria-label={c.nom}
            className="flex flex-col rounded-card bg-card ring-1 ring-surface-border"
          >
            <div className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-1.5">
              <div className="flex min-w-0 flex-col">
                <span className="font-mono text-caption text-muted-foreground">{c.codi}</span>
                <h3 className="truncate text-body font-medium">{c.nom}</h3>
              </div>
              <span className="font-mono text-caption text-muted-foreground tabular-nums">
                {c.industrials.length}
              </span>
            </div>
            <ul className="flex flex-col p-1.5 pt-0">
              {c.industrials.map((i) => (
                <li key={i.id}>
                  <Link
                    href={`/industrials/${i.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-surface-hover"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1.5 truncate text-label">
                        {i.pedrasses && (
                          <span className="size-1.5 shrink-0 rounded-full bg-brand" title="Oferta a Pedrasses" />
                        )}
                        <span className="truncate">{i.nom}</span>
                      </span>
                      <span className="truncate text-caption text-muted-foreground">{i.linia}</span>
                    </div>
                    {i.valor && (
                      <span className="shrink-0 font-mono text-label tabular-nums">{i.valor}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {visibles.length === 0 && (
        <div className="rounded-card bg-surface-inset px-5 py-10 text-center text-body text-muted-foreground">
          Cap industrial
        </div>
      )}

      {senseIndustrial.length > 0 && (
        <p className="text-caption text-muted-foreground">
          <span className="font-medium text-foreground">Sense industrial · {senseIndustrial.length}</span>
          {"  "}
          {senseIndustrial.map((c) => c.nom).join(" · ")}
        </p>
      )}
    </div>
  );
}
