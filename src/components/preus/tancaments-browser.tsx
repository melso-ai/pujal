"use client";

import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type FilaTancament = {
  id: string;
  data: string;
  dataLabel: string;
  element?: string;
  elementHref?: string;
  industrial?: string;
  industrialHref?: string;
  obra: string;
  obraHref: string;
  capObra: string;
  volum: string;
  preu: string;
  valor: number;
  delta?: number;
  deltaLabel?: string;
};

const normalitza = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
const enllac = "rounded-sm hover:text-brand-text hover:underline focus-visible:outline-2 focus-visible:outline-ring";

export function TancamentsBrowser({ files }: { files: FilaTancament[] }) {
  const [cerca, setCerca] = useState("");
  const [ordre, setOrdre] = useState("recent");
  const [limit, setLimit] = useState(12);
  const q = normalitza(cerca.trim());
  const filtrades = files.filter((f) => normalitza(`${f.obra} ${f.element ?? ""} ${f.industrial ?? ""} ${f.capObra}`).includes(q));
  const ordenades = [...filtrades].sort((a, b) => ordre === "preu-asc" ? a.valor - b.valor : ordre === "preu-desc" ? b.valor - a.valor : b.data.localeCompare(a.data));
  const visibles = ordenades.slice(0, limit);
  const ambElement = files.some((f) => f.element);

  function reinicia() {
    setCerca("");
    setOrdre("recent");
    setLimit(12);
  }

  function preu(f: FilaTancament) {
    return (
      <div className="flex items-center justify-end gap-2">
        {f.deltaLabel && <span className={cn("font-mono text-caption tabular-nums", (f.delta ?? 0) > 2 ? "text-warning" : (f.delta ?? 0) < -2 ? "text-success" : "text-muted-foreground")}>{f.deltaLabel}</span>}
        <span className="font-mono font-medium tabular-nums">{f.preu}</span>
      </div>
    );
  }

  return (
    <div className="@container flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="min-w-0 flex-1 sm:max-w-80">
          <InputGroupInput aria-label="Cercar preus tancats" placeholder={ambElement ? "Element, obra o cap d'obra" : "Obra, industrial o cap d'obra"} value={cerca} onChange={(e) => { setCerca(e.target.value); setLimit(12); }} />
          <InputGroupAddon><SearchIcon /></InputGroupAddon>
        </InputGroup>
        <select aria-label="Ordenar preus tancats" className="h-9 rounded-lg border border-input bg-background px-2 text-label outline-none focus-visible:ring-2 focus-visible:ring-ring" value={ordre} onChange={(e) => { setOrdre(e.target.value); setLimit(12); }}>
          <option value="recent">Més recents</option>
          <option value="preu-asc">Preu més baix</option>
          <option value="preu-desc">Preu més alt</option>
        </select>
      </div>
      <span role="status" className="text-caption text-muted-foreground">{visibles.length} de {filtrades.length} preus tancats</span>
      {visibles.length > 0 ? <>
        <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border @3xl:hidden">
          {visibles.map((f) => <article key={f.id} className="flex flex-col gap-2 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-caption text-muted-foreground">{f.dataLabel}</span>{preu(f)}</div>
            {f.element && <Link href={f.elementHref!} className={cn(enllac, "text-body font-medium")}>{f.element}</Link>}
            {f.industrial && <Link href={f.industrialHref!} className={cn(enllac, "text-body font-medium")}>{f.industrial}</Link>}
            <Link href={f.obraHref} className={cn(enllac, "text-label")}>{f.obra}</Link>
            <div className="flex flex-wrap justify-between gap-2 text-caption text-muted-foreground"><span>{f.capObra}</span><span className="font-mono tabular-nums">{f.volum}</span></div>
          </article>)}
        </div>
        <div className="hidden min-w-0 overflow-hidden rounded-card ring-1 ring-surface-border @3xl:block">
          <Table><TableHeader><TableRow><TableHead className="pl-4">Data</TableHead><TableHead>{ambElement ? "Element" : "Industrial"}</TableHead><TableHead>Obra</TableHead><TableHead>Cap d&apos;obra</TableHead><TableHead className="text-right">Volum</TableHead><TableHead className="pr-4 text-right">Preu</TableHead></TableRow></TableHeader>
            <TableBody>{visibles.map((f) => <TableRow key={f.id}><TableCell className="pl-4 text-muted-foreground">{f.dataLabel}</TableCell><TableCell><Link href={(ambElement ? f.elementHref : f.industrialHref)!} className={enllac}>{ambElement ? f.element : f.industrial}</Link></TableCell><TableCell><Link href={f.obraHref} className={enllac}>{f.obra}</Link></TableCell><TableCell className="text-muted-foreground">{f.capObra}</TableCell><TableCell className="text-right font-mono tabular-nums">{f.volum}</TableCell><TableCell className="pr-4">{preu(f)}</TableCell></TableRow>)}</TableBody>
          </Table>
        </div>
      </> : <div className="flex flex-col items-center gap-3 rounded-card bg-surface-inset px-4 py-10"><span className="text-body text-muted-foreground">Cap preu amb aquesta cerca</span><Button variant="outline" onClick={reinicia}>Netejar cerca</Button></div>}
      {ordenades.length > limit && <Button variant="outline" className="self-center" onClick={() => setLimit((n) => n + 12)}>Mostrar més · {ordenades.length - limit} pendents</Button>}
    </div>
  );
}
