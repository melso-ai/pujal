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
import { dadesNecessaries } from "@/lib/data";

export default function DadesPage() {
  const pendents = dadesNecessaries.filter((d) => d.estat === "Pendent").length;

  return (
    <>
      <PageHeader crumbs={[{ label: "Dades" }, { label: "Pressupostos" }]} />
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dades per a l&apos;MVP 1</h1>
          <p className="text-sm text-muted-foreground">Estudis i pressupostos</p>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Entitats" value={dadesNecessaries.length} />
          <Stat label="Pendents" value={pendents} />
          <Stat label="Bloquejant" value="Accés SQL" />
        </div>
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Entitat</TableHead>
                <TableHead>Camps</TableHead>
                <TableHead>Font</TableHead>
                <TableHead>Què cal</TableHead>
                <TableHead className="pr-4">Estat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadesNecessaries.map((d) => (
                <TableRow key={d.entitat}>
                  <TableCell className="pl-4 font-medium">{d.entitat}</TableCell>
                  <TableCell className="text-muted-foreground">{d.camps}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.font}</Badge>
                  </TableCell>
                  <TableCell>{d.accio}</TableCell>
                  <TableCell className="pr-4">
                    <Badge variant={d.estat === "Pendent" ? "destructive" : "secondary"}>
                      {d.estat}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
