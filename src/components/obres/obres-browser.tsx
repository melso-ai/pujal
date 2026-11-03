"use client";

import Link from "next/link";
import { ArrowRightIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { EstatBadge } from "@/components/estat-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { obres } from "@/lib/data";
import { eur, pct } from "@/lib/format";

export function ObresBrowser() {
  const [cerca, setCerca] = useState("");
  const [estat, setEstat] = useState("");
  const [ordre, setOrdre] = useState("nom");
  const text = cerca.trim().toLocaleLowerCase("ca");
  const files = obres
    .filter(
      (o) =>
        (!estat || o.estat === estat) &&
        `${o.nom} ${o.obs} ${o.capObra} ${o.client}`
          .toLocaleLowerCase("ca")
          .includes(text),
    )
    .sort((a, b) =>
      ordre === "import"
        ? b.importEstudi - a.importEstudi
        : ordre === "marge"
          ? a.margePrevist - b.margePrevist
          : a.nom.localeCompare(b.nom, "ca"),
    );
  const select =
    "h-9 min-w-0 rounded-lg border border-input bg-card px-3 text-label outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <section className="@container flex min-w-0 flex-col gap-3">
      <h1 className="text-title-sm font-semibold">Obres</h1>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1 basis-52">
          <SearchIcon className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            aria-label="Cercar obres"
            placeholder="Obra, cap d'obra o client…"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <select
          aria-label="Filtrar per estat"
          value={estat}
          onChange={(e) => setEstat(e.target.value)}
          className={select}
        >
          <option value="">Tots els estats</option>
          {[...new Set(obres.map((o) => o.estat))].map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
        <select
          aria-label="Ordenar obres"
          value={ordre}
          onChange={(e) => setOrdre(e.target.value)}
          className={select}
        >
          <option value="nom">Nom A–Z</option>
          <option value="import">Import més alt</option>
          <option value="marge">Marge més baix</option>
        </select>
      </div>
      <span role="status" className="text-caption text-muted-foreground">
        {files.length} de {obres.length} obres
      </span>
      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card bg-surface-inset p-8 text-center">
          <p className="text-body font-medium">Cap obra amb aquests filtres</p>
          <Button
            variant="outline"
            onClick={() => {
              setCerca("");
              setEstat("");
            }}
          >
            Netejar filtres
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border @3xl:hidden">
            {files.map((o) => (
              <Link
                key={o.id}
                href={`/obres/${o.id}`}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-body font-medium">{o.nom}</span>
                    <p className="text-caption text-muted-foreground">
                      {o.obs} · {o.capObra}
                    </p>
                  </div>
                  <ArrowRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <EstatBadge estat={o.estat} />
                  <span className="font-mono text-label tabular-nums">
                    {eur(o.importEstudi)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={o.certificat * 100} className="flex-1" />
                  <span className="font-mono text-caption text-muted-foreground tabular-nums">
                    {Math.round(o.certificat * 100)}% certificat
                  </span>
                </div>
                <span className="text-caption text-muted-foreground">
                  Marge{" "}
                  <span className="font-mono tabular-nums">
                    {pct(o.margePrevist)}
                  </span>
                  {o.participacio < 100 && ` · UTE ${o.participacio}%`}
                </span>
              </Link>
            ))}
          </div>
          <div className="hidden min-w-0 overflow-hidden rounded-card bg-card ring-1 ring-surface-border @3xl:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Obra</TableHead>
                  <TableHead>Estat</TableHead>
                  <TableHead>Cap d&apos;obra</TableHead>
                  <TableHead>Certificat</TableHead>
                  <TableHead className="text-right">Marge</TableHead>
                  <TableHead className="pr-4 text-right">Import</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((o) => (
                  <TableRow
                    key={o.id}
                    className="relative focus-within:bg-surface-hover"
                  >
                    <TableCell className="pl-4">
                      <Link
                        href={`/obres/${o.id}`}
                        className="flex flex-col outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
                      >
                        <span className="font-medium">{o.nom}</span>
                        <span className="font-mono text-caption text-muted-foreground">
                          {o.obs}
                          {o.participacio < 100 && ` · UTE ${o.participacio}%`}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <EstatBadge estat={o.estat} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.capObra}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={o.certificat * 100} className="w-20" />
                        <span className="font-mono text-caption tabular-nums">
                          {Math.round(o.certificat * 100)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono tabular-nums ${o.margePrevist < o.margeEstudi ? "text-warning" : ""}`}
                    >
                      {pct(o.margePrevist)}
                    </TableCell>
                    <TableCell className="pr-4 text-right font-mono tabular-nums">
                      {eur(o.importEstudi)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}
