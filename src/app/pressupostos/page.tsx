import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { EstudisBrowser } from "@/components/pressupostos/estudis-browser";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { estudis } from "@/lib/data";
import { date, eurCompact } from "@/lib/format";

export default function PressupostosPage() {
  const total = estudis.reduce((s, e) => s + e.importEstimat, 0);
  const proper = [...estudis].sort((a, b) => a.lliurament.localeCompare(b.lliurament))[0];

  return (
    <>
      <PageHeader crumbs={[{ label: "Pressupostos" }]}>
        <Button size="sm" nativeButton={false} render={<Link href="/pressupostos/nou" />}>
          <PlusIcon data-icon="inline-start" />Nou estudi
        </Button>
      </PageHeader>
      <div className="flex min-w-0 flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-caption text-muted-foreground">Pressupostos en estudi</h1>
          <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">{eurCompact(total)}</span>
          <span className="text-caption text-muted-foreground">{estudis.length} estudis · Pedrasses pendent de valorar</span>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Proper lliurament" value={date(proper.lliurament)} hint={proper.nom} />
          <Stat label="Al comparatiu" value={estudis.filter((e) => e.etapa === 2).length} />
          <Stat label="En tancament" value={estudis.filter((e) => e.etapa === 3).length} />
        </div>
        <EstudisBrowser />
      </div>
    </>
  );
}
