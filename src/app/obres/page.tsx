import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { EstatBadge } from "@/components/estat-badge";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
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

export default function ObresPage() {
  const actives = obres.filter((o) => o.estat === "En execució" || o.estat === "Adjudicada");
  const cartera = actives.reduce(
    (s, o) => s + o.importEstudi * (1 - o.certificat) * (o.participacio / 100),
    0
  );

  return (
    <>
      <PageHeader crumbs={[{ label: "Obres" }]} />
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Cartera pendent d&apos;executar</span>
          <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
            {eur(cartera)}
          </span>
          <span className="text-xs text-muted-foreground">
            {actives.length} obres actives · part de Pujal
          </span>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Obres" value={obres.length} />
          <Stat label="UTEs" value={obres.filter((o) => o.participacio < 100).length} />
          <Stat label="Marge previst mitjà" value={pct(obres.reduce((s, o) => s + o.margePrevist, 0) / obres.length)} />
        </div>

        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Obra</TableHead>
                <TableHead>Estat</TableHead>
                <TableHead>Cap d&apos;obra</TableHead>
                <TableHead className="w-40">Certificat</TableHead>
                <TableHead className="text-right">Marge</TableHead>
                <TableHead className="text-right">Import</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {obres.map((o) => {
                const delta = o.margePrevist - o.margeEstudi;
                return (
                  <TableRow key={o.id} className="group relative">
                    <TableCell className="pl-4">
                      <Link href={`/obres/${o.id}`} className="flex flex-col after:absolute after:inset-0">
                        <span className="font-medium">{o.nom}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {o.obs}
                          {o.participacio < 100 && ` · UTE ${o.participacio}%`}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <EstatBadge estat={o.estat} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{o.capObra}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={o.certificat * 100} className="w-24" />
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                          {Math.round(o.certificat * 100)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {pct(o.margePrevist)}
                      <Badge
                        variant={delta < 0 ? "destructive" : "outline"}
                        className="ml-2 font-mono"
                      >
                        {delta > 0 ? "+" : ""}
                        {delta.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {eur(o.importEstudi)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
