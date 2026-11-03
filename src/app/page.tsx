import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { TodayActions, type TodayAction } from "@/components/today-actions";
import { Progress } from "@/components/ui/progress";
import { discrepancies, estudis, etapesEstudi, factures, passosAprovacio } from "@/lib/data";
import { date, eur, eurCompact } from "@/lib/format";
import { carpetes, comparatiuElectric, ofertes } from "@/lib/pedrasses";
import { resumElement, volumLabel } from "@/lib/preus";

const pendents = factures.filter((f) => f.pas < passosAprovacio.length);
const cuina = discrepancies.find((d) => d.partida.startsWith("05.11"));
const formigo = resumElement("formigo-ha25")!;
const omeses = comparatiuElectric.omeses.reduce((t, o) => t + o.import, 0);
const efhysNormalitzat = comparatiuElectric.efhys.total + omeses - comparatiuElectric.besoli.total;

const accions: TodayAction[] = [
  {
    id: "pedrasses",
    icon: "ofertes",
    title: `Xalets Les Pedrasses · ${ofertes.length} ofertes llegides`,
    meta: `${carpetes[2].industrials} industrials · EFHYS deixa ${comparatiuElectric.omeses.length} partides sense preu`,
    value: `+${eur(efhysNormalitzat)}`,
    action: "Revisar",
    href: "/pressupostos/pedrasses#comparatiu",
    primary: true,
  },
  {
    id: "estructura",
    icon: "alerta",
    title: "Estructura de Pedrasses sense cap oferta",
    meta: "30 partides · formigó, ferro, encofrats, mà d'obra",
    value: "5 famílies",
    action: "Demanar ofertes",
    href: "/industrials",
  },
  {
    id: "cuina",
    icon: "alerta",
    title: "Electrodomèstics a la memòria, no als amidaments",
    meta: `Edifici Plaça Major · ${cuina?.partida ?? "05.11 Cuina"}`,
    value: eur(cuina?.impacte ?? 48_000),
    action: "Revisar",
    href: "/pressupostos/placa-major#documentacio",
  },
  {
    id: "formigo",
    icon: "volum",
    title: `Formigó HA-25 per a ${formigo.agrupar.nObres} obres en 4 mesos`,
    meta: `${volumLabel(formigo.agrupar.volum, formigo.unitat)} · un sol preu per volum`,
    value: `−${eur(formigo.agrupar.estalvi)}`,
    action: "Agrupar",
    href: "/preus/formigo-ha25",
  },
  {
    id: "factures",
    icon: "factures",
    title: `${pendents.length} factures pendents d'aprovar`,
    meta: pendents.map((f) => f.proveidor).join(", "),
    value: eur(pendents.reduce((s, f) => s + f.import, 0)),
    action: "Aprovar",
    href: "/obres/aixovall#factures",
  },
];

export default function AvuiPage() {
  const enCurs = [...estudis].sort((a, b) => a.lliurament.localeCompare(b.lliurament));
  const total = estudis.reduce((s, e) => s + e.importEstimat, 0);

  return (
    <>
      <PageHeader crumbs={[{ label: "Avui" }]} />
      <div className="@container mx-auto flex w-full max-w-5xl flex-col gap-10 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <span className="text-label text-muted-foreground">Dimarts, 3 de novembre</span>
          <h1 className="text-display-sm font-semibold tracking-tight">Bon dia, Marta</h1>
        </div>

        <div className="flex flex-wrap items-end gap-x-12 gap-y-6">
          <div className="flex flex-col gap-1">
            <span className="text-caption text-muted-foreground">En estudi</span>
            <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">{eurCompact(total)}</span>
          </div>
          <Stat label="Estudis" value={estudis.length} />
          <Stat label="Proper lliurament" value={date(enCurs[0].lliurament)} />
          <Stat label="Al comparatiu" value={estudis.filter((e) => e.etapa === 2).length} />
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-title-sm font-semibold">Per fer</h2>
          <TodayActions items={accions} />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-title-sm font-semibold">Lliuraments</h2>
            <Link href="/pressupostos" className="text-label text-muted-foreground hover:text-foreground">
              Tots
            </Link>
          </div>
          <div className="grid gap-3 @md:grid-cols-2 @3xl:grid-cols-4">
            {enCurs.slice(0, 4).map((e) => (
              <Link
                key={e.id}
                href={`/pressupostos/${e.id}`}
                className="group flex flex-col gap-3 rounded-card bg-card p-4 ring-1 ring-surface-border transition-colors hover:bg-surface-hover"
              >
                <div className="flex items-center justify-between text-caption text-muted-foreground">
                  <span className="font-mono tabular-nums">{date(e.lliurament)}</span>
                  <ArrowRightIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-body font-medium">{e.nom}</span>
                  <span className="truncate text-caption text-muted-foreground">{e.arquitecte}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Progress value={((e.etapa + 1) / etapesEstudi.length) * 100} />
                  <span className="text-caption text-muted-foreground">{etapesEstudi[e.etapa]}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
