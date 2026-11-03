import { ObresBrowser } from "@/components/obres/obres-browser";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { obres } from "@/lib/data";
import { eur, eurCompact, pct } from "@/lib/format";

export default function ObresPage() {
  const actives = obres.filter(
    (o) => o.estat === "En execució" || o.estat === "Adjudicada",
  );
  const cartera = actives.reduce(
    (s, o) => s + o.importEstudi * (1 - o.certificat) * (o.participacio / 100),
    0,
  );

  return (
    <>
      <PageHeader crumbs={[{ label: "Obres" }]} />
      <div className="flex min-w-0 flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <span className="text-caption text-muted-foreground">
            Cartera pendent d&apos;executar
          </span>
          <span
            title={eur(cartera)}
            className="font-mono text-5xl font-medium tracking-tight tabular-nums"
          >
            {eurCompact(cartera)}
          </span>
          <span className="text-caption text-muted-foreground">
            {actives.length} obres actives · part de Pujal
          </span>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Obres" value={obres.length} />
          <Stat
            label="UTEs"
            value={obres.filter((o) => o.participacio < 100).length}
          />
          <Stat
            label="Marge previst mitjà"
            value={pct(
              obres.reduce((s, o) => s + o.margePrevist, 0) / obres.length,
            )}
          />
        </div>
        <ObresBrowser />
      </div>
    </>
  );
}
