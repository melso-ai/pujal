import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { estudis, etapesEstudi } from "@/lib/data";
import { date, eur, num } from "@/lib/format";

export default function PressupostosPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Pressupostos" }]}>
        <Button size="sm" nativeButton={false} render={<Link href="/pressupostos/nou" />}>
          <PlusIcon data-icon="inline-start" />
          Nou estudi
        </Button>
      </PageHeader>
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-wrap items-end gap-x-12 gap-y-4">
          <Stat label="A la cua" value={estudis.length} />
          <Stat label="Conversió" value="20%" hint="2 de cada 10 s'executen" />
          <Stat label="Temps per estudi" value="≈ 2 mesos" hint="Objectiu: 2 setmanes" />
        </div>
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="grid min-w-[960px] grid-cols-5 gap-3">
            {etapesEstudi.map((etapa, i) => {
              const items = estudis.filter((e) => e.etapa === i);
              return (
                <div key={etapa} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-sm font-medium">
                      <span className="mr-2 font-mono text-muted-foreground">
                        {i + 1}
                      </span>
                      {etapa}
                    </span>
                    <Badge variant="outline" className="font-mono">
                      {items.length}
                    </Badge>
                  </div>
                  <div className="flex min-h-40 flex-col gap-3 rounded-xl bg-muted/30 p-2">
                    {items.map((e) => (
                      <Link key={e.id} href={`/pressupostos/${e.id}`}>
                        <Card size="sm" className="transition-colors hover:bg-muted/60">
                          <CardHeader>
                            <CardTitle>{e.nom}</CardTitle>
                            <CardDescription>{e.arquitecte}</CardDescription>
                          </CardHeader>
                          <CardFooter className="justify-between border-t py-3 font-mono text-xs text-muted-foreground tabular-nums">
                            <span>{e.importEstimat > 0 ? eur(e.importEstimat) : "—"}</span>
                            <span>{e.superficie > 0 ? `${num(e.superficie)} m²` : "—"}</span>
                          </CardFooter>
                          <div className="-mt-1 px-3 pb-3 text-xs text-muted-foreground">
                            Lliurament {date(e.lliurament)}
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
