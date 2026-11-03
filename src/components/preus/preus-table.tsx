"use client";

import Link from "next/link";
import { ArrowRightIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { Sparkline } from "@/components/preus/sparkline";
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

  const q = normalitza(cerca.trim());
  const visibles = files.filter(
    (f) =>
      (capitol === "Tots" || f.capitol === capitol) &&
      (!q || normalitza(`${f.nom} ${f.millor}`).includes(q))
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={capitol} onValueChange={(v) => setCapitol(String(v))}>
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

      <div className="overflow-x-auto rounded-xl ring-1 ring-surface-border">
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
              <TableRow key={f.id} className="group relative">
                <TableCell className="pl-4">
                  <Link href={`/preus/${f.id}`} className="flex flex-col after:absolute after:inset-0">
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
                  Cap element
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
