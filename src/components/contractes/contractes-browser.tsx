"use client";

import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

import { EstatContracte } from "@/components/contractes/estat-contracte";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EstatVisible, Tipus } from "@/lib/contractes";

// Preformatted on the server so hydration never depends on the browser's ICU.
export type FilaContracte = {
  id: string;
  sufix: string;
  contrapart: string;
  linia: string;
  import: string;
  tipus: Tipus;
  estat: EstatVisible;
  avis: string | null;
  cerca: string;
};

export type GrupContractes = {
  id: string;
  num: string;
  nom: string;
  total: string;
  files: FilaContracte[];
};

const tipusOpcions = [
  { value: "tots", label: "Tots" },
  { value: "client", label: "Clients" },
  { value: "industrial", label: "Industrials" },
];

const estatOpcions = [
  { value: "tots", label: "Tots" },
  { value: "esborrany", label: "Esborrany" },
  { value: "enviat", label: "Pendent" },
  { value: "signat", label: "Signat" },
  { value: "caducat", label: "Caducat" },
];

const normalitza = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function ContractesBrowser({ grups }: { grups: GrupContractes[] }) {
  const [tipus, setTipus] = useState("tots");
  const [estat, setEstat] = useState("tots");
  const [cerca, setCerca] = useState("");

  const q = normalitza(cerca.trim());
  const visibles = grups
    .map((g) => ({
      ...g,
      files: g.files.filter(
        (f) =>
          (tipus === "tots" || f.tipus === tipus) &&
          (estat === "tots" || f.estat === estat) &&
          (!q || normalitza(`${g.num} ${g.nom} ${f.cerca}`).includes(q))
      ),
    }))
    .filter((g) => g.files.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Filtre opcions={tipusOpcions} value={tipus} onChange={setTipus} />
        <Filtre opcions={estatOpcions} value={estat} onChange={setEstat} />
        <InputGroup className="min-w-48 flex-1 lg:ml-auto lg:max-w-64">
          <InputGroupInput
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Contracte, industrial o obra"
            aria-label="Cercar"
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="@container">
        <div className="grid grid-cols-1 items-start gap-3 @4xl:grid-cols-2">
          {visibles.map((g) => (
            <section key={g.id} aria-label={g.nom} className="flex flex-col rounded-card bg-card ring-1 ring-surface-border">
              <div className="flex items-baseline justify-between gap-3 px-4 pt-3.5 pb-1.5">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="font-mono text-caption text-muted-foreground tabular-nums">{g.num}</span>
                  <h3 className="truncate text-body font-medium">{g.nom}</h3>
                </div>
                <span className="shrink-0 font-mono text-caption text-muted-foreground tabular-nums">{g.total}</span>
              </div>
              <ul className="flex flex-col p-1.5 pt-0">
                {g.files.map((f) => (
                  <li key={f.id}>
                    <Link
                      href={`/contractes/${f.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-surface-hover"
                    >
                      <div className="flex min-w-0 flex-col">
                        <span className="flex min-w-0 items-baseline gap-2 text-label">
                          <span className="shrink-0 font-mono text-caption text-muted-foreground tabular-nums">{f.sufix}</span>
                          <span className="truncate">{f.contrapart}</span>
                        </span>
                        <span className="truncate text-caption text-muted-foreground">
                          {f.linia}
                          {f.avis && <span className="text-warning"> · {f.avis}</span>}
                        </span>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-mono text-label tabular-nums">{f.import}</span>
                        <EstatContracte estat={f.estat} curt />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {visibles.length === 0 && (
        <div className="rounded-card bg-surface-inset px-5 py-10 text-center text-body text-muted-foreground">
          Cap contracte
        </div>
      )}
    </div>
  );
}

function Filtre({
  opcions,
  value,
  onChange,
}: {
  opcions: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(String(v))} className="max-w-full">
      <div className="-mx-4 overflow-x-auto overflow-y-hidden px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <TabsList className="pointer-coarse:h-auto!">
          {opcions.map((o) => (
            <TabsTrigger key={o.value} value={o.value} className="px-2.5">
              {o.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
