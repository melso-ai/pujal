"use client";

import Link from "next/link";
import { ArrowRightIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { Sparkline } from "@/components/preus/sparkline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Values arrive preformatted from the server so hydration never depends on the browser's ICU.
export type FilaPreu = {
  id: string;
  nom: string;
  unitat: string;
  capitol: string;
  ultim: string;
  ultimaData: string;
  mediana: string;
  tendencia: number | null;
  tendenciaLabel: string;
  millor: string;
  millorPreu: string;
  nObres: number;
  estalvi: string | null;
  serie: (number | null)[];
  ultimValor?: number;
  estalviValor?: number;
};

const normalitza = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function TendenciaBadge({ valor, label }: { valor: number | null; label: string }) {
  if (valor === null) return <span className="text-caption text-muted-foreground">—</span>;
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono tabular-nums",
        valor > 1 && "text-warning",
        valor < -1 && "text-success"
      )}
    >
      {label}
    </Badge>
  );
}

export function PreusTable({ files, capitols }: { files: FilaPreu[]; capitols: string[] }) {
  const [capitol, setCapitol] = useState("Tots");
  const [cerca, setCerca] = useState("");
  const [ordre, setOrdre] = useState("nom");

  const q = normalitza(cerca.trim());
  const visibles = files.filter(
    (f) =>
      (capitol === "Tots" || f.capitol === capitol) &&
      (!q || normalitza(`${f.nom} ${f.capitol} ${f.millor}`).includes(q))
  ).sort((a, b) => ordre === "estalvi" ? (b.estalviValor ?? 0) - (a.estalviValor ?? 0) : ordre === "preu" ? (b.ultimValor ?? 0) - (a.ultimValor ?? 0) : a.nom.localeCompare(b.nom, "ca"));

  function netejar() {
    setCerca("");
    setCapitol("Tots");
  }

  return (
    <div className="@container flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between">
        <Tabs className="min-w-0 max-w-full" value={capitol} onValueChange={(v) => setCapitol(String(v))}>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <TabsList>
              {["Tots", ...capitols].map((c) => (
                <TabsTrigger key={c} value={c} className="px-2.5">
                  {c}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
        <InputGroup className="sm:w-64">
          <InputGroupInput
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Element o industrial"
            aria-label="Cercar"
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span role="status" className="text-caption text-muted-foreground">{visibles.length} de {files.length} elements</span>
        <select aria-label="Ordenar elements" value={ordre} onChange={(e) => setOrdre(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-2 text-label outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option value="nom">Nom de l&apos;element</option><option value="estalvi">Més estalvi agrupant</option><option value="preu">Preu més alt</option>
        </select>
      </div>
      <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card ring-1 ring-surface-border @3xl:hidden">
        {visibles.map((f) => <Link key={f.id} href={`/preus/${f.id}`} className="flex flex-col gap-3 bg-card p-4 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-ring">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className="text-body font-medium">{f.nom}</span><p className="text-caption text-muted-foreground">{f.capitol} · {f.unitat}</p></div><ArrowRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /></div>
          <div className="flex items-center justify-between gap-2"><div><span className="font-mono text-title-sm tabular-nums">{f.ultim}<span className="text-caption text-muted-foreground">/{f.unitat}</span></span><p className="text-caption text-muted-foreground">Últim · {f.ultimaData}</p></div><TendenciaBadge valor={f.tendencia} label={f.tendenciaLabel} /></div>
          <div className="flex flex-wrap justify-between gap-2 text-caption text-muted-foreground"><span>{f.millor}</span>{f.estalvi && <span className="font-mono text-brand-text tabular-nums">{f.estalvi} d&apos;estalvi</span>}</div>
        </Link>)}
      </div>
      {visibles.length === 0 && <div className="flex flex-col items-center gap-3 rounded-card bg-surface-inset px-4 py-10 @3xl:hidden"><span className="text-body text-muted-foreground">Cap element amb aquests filtres</span><Button variant="outline" onClick={netejar}>Netejar filtres</Button></div>}
      <div className="hidden min-w-0 overflow-x-auto rounded-card ring-1 ring-surface-border @3xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Element</TableHead>
              <TableHead>Tendència</TableHead>
              <TableHead className="text-right">Últim tancat</TableHead>
              <TableHead className="text-right">Mediana 12m</TableHead>
              <TableHead>Millor industrial</TableHead>
              <TableHead className="text-right">Obres</TableHead>
              <TableHead className="text-right">Agrupant volum</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.map((f) => (
              <TableRow key={f.id} className="group relative focus-within:bg-surface-hover">
                <TableCell className="pl-4">
                  <Link href={`/preus/${f.id}`} className="flex flex-col after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-ring">
                    <span className="font-medium">{f.nom}</span>
                    <span className="text-caption text-muted-foreground">
                      {f.capitol} · {f.unitat}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Sparkline serie={f.serie} />
                    <TendenciaBadge valor={f.tendencia} label={f.tendenciaLabel} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-mono tabular-nums">{f.ultim}</span>
                    <span className="text-caption text-muted-foreground">{f.ultimaData}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">{f.mediana}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{f.millor}</span>
                    <span className="font-mono text-caption text-muted-foreground tabular-nums">
                      {f.millorPreu} mitjà
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">{f.nObres}</TableCell>
                <TableCell className="text-right font-mono text-brand-text tabular-nums">
                  {f.estalvi ?? <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="pr-4">
                  <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </TableCell>
              </TableRow>
            ))}
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3"><span>Cap element amb aquests filtres</span><Button variant="outline" onClick={netejar}>Netejar filtres</Button></div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
