import { PageHeader } from "@/components/page-header";
import { PreusTable, type FilaPreu } from "@/components/preus/preus-table";
import { Stat } from "@/components/stat";
import { date, eur } from "@/lib/format";
import {
  capitolsPreu,
  estalviAgrupantTotal,
  pctSigne,
  preu,
  PREVISIO,
  resumPreus,
  serieMensual,
  sobrecostTotal12,
  totalIndustrials,
  totalTancaments,
} from "@/lib/preus";

export default function PreusPage() {
  const files: FilaPreu[] = resumPreus.map((r) => ({
    id: r.id,
    nom: r.nom,
    unitat: r.unitat,
    capitol: r.capitol,
    ultim: preu(r.ultimPreu),
    ultimValor: r.ultimPreu,
    estalviValor: r.agrupar.estalvi,
    ultimaData: date(r.ultimaData),
    mediana: preu(r.mediana12),
    tendencia: r.tendencia,
    tendenciaLabel: r.tendencia === null ? "" : pctSigne(r.tendencia),
    millor: r.millorIndustrial,
    millorPreu: preu(r.millorPreu),
    nObres: r.nObres,
    estalvi: r.agrupar.estalvi > 0 ? eur(r.agrupar.estalvi) : null,
    serie: serieMensual(r.id),
  }));
  const obresAmbVolum = new Set(resumPreus.flatMap((r) => r.agrupar.files.map((f) => f.obraId))).size;

  return (
    <>
      <PageHeader crumbs={[{ label: "Preus" }]} />
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-caption text-muted-foreground">
            Estalvi agrupant volum · pròxims {PREVISIO.length} mesos
          </h1>
          <span className="font-mono text-5xl font-medium tracking-tight text-brand-text tabular-nums">
            {eur(estalviAgrupantTotal)}
          </span>
          <span className="text-caption text-muted-foreground">
            {resumPreus.length} elements · {obresAmbVolum} obres amb volum previst
          </span>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Pagat de més · 12 mesos" value={eur(sobrecostTotal12)} hint="vs. millor industrial" />
          <Stat label="Preus tancats" value={totalTancaments} hint="22 mesos · 4 obres" />
          <Stat label="Industrials" value={totalIndustrials} />
        </div>

        <PreusTable files={files} capitols={capitolsPreu} />
      </div>
    </>
  );
}
