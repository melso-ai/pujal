import Link from "next/link";
import { LandmarkIcon, PlusIcon, SendIcon, TriangleAlertIcon, type LucideIcon } from "lucide-react";

import { AskAction } from "@/components/chat/ask-action";
import {
  ContractesBrowser,
  type FilaContracte,
  type GrupContractes,
} from "@/components/contractes/contractes-browser";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import {
  contractes,
  contractesDe,
  DIES_PROPER,
  diesFins,
  estatDe,
  getProjecte,
  hrefRegenerar,
  nomEstat,
  projectes,
  resum,
  retingut,
  retornRetencio,
  venceAviat,
  type Contracte,
} from "@/lib/contractes";
import { date, eur, eurCompact, plural } from "@/lib/format";
import { nomFamilia } from "@/lib/industrials";
import { cn } from "@/lib/utils";

function fila(c: Contracte): FilaContracte {
  const estat = estatDe(c);
  const linia = `${c.tipus === "client" ? "Client" : c.familia ? nomFamilia(c.familia) : "Industrial"} · ${c.pagament} dies${c.retencio ? " · 5%" : ""}`;
  const avis =
    estat === "caducat"
      ? `Venciment ${date(c.venciment)}`
      : venceAviat(c)
        ? `Venç en ${diesFins(c.venciment)} dies`
        : null;
  return {
    id: c.id,
    sufix: c.num.slice(c.num.indexOf(".")),
    contrapart: c.contrapart,
    linia,
    import: eur(c.import),
    tipus: c.tipus,
    estat,
    avis,
    cerca: `${c.num} ${c.contrapart} ${linia} ${nomEstat[estat]}`,
  };
}

type Accio = {
  id: string;
  icon: LucideIcon;
  titol: string;
  meta: string;
  valor: string;
  accio: React.ReactNode;
  primary?: boolean;
};

function accions(): Accio[] {
  const out: Accio[] = [];
  for (const c of contractes.filter((c) => estatDe(c) === "caducat")) {
    const p = getProjecte(c.obra);
    out.push({
      id: c.id,
      icon: TriangleAlertIcon,
      titol: `${c.contrapart} sense contracte signat`,
      meta: `${p?.nom} · caducat el ${date(c.venciment)} · ${eur(c.executat)} executat`,
      valor: eur(c.import),
      primary: true,
      accio: (
        <Button size="sm" className="shrink-0 rounded-full" nativeButton={false} render={<Link href={hrefRegenerar(c)} />}>
          Regenerar
        </Button>
      ),
    });
  }

  const esborrany = contractes
    .filter((c) => estatDe(c) === "esborrany")
    .sort((a, b) => b.creat.localeCompare(a.creat))[0];
  if (esborrany) {
    const p = getProjecte(esborrany.obra);
    out.push({
      id: esborrany.id,
      icon: SendIcon,
      titol: `${p?.nom} · ${esborrany.tipus === "client" ? "contracte de client" : esborrany.contrapart}`,
      meta: `Esborrany ${esborrany.num} · ${esborrany.autor}`,
      valor: eur(esborrany.import),
      accio: (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 rounded-full"
          nativeButton={false}
          render={<Link href={`/contractes/${esborrany.id}`} />}
        >
          Enviar a signar
        </Button>
      ),
    });
  }

  for (const c of contractes.filter((c) => c.tipus === "client" && c.executat > 0)) {
    const retorn = retornRetencio(c);
    const dies = retorn ? diesFins(retorn) : -1;
    if (!retorn || dies < 0 || dies > DIES_PROPER) continue;
    const p = getProjecte(c.obra);
    const industrials = contractesDe(c.obra).filter((x) => x.tipus === "industrial" && retingut(x) > 0);
    const aRetornar = industrials.reduce((s, x) => s + retingut(x), 0);
    out.push({
      id: `retencio-${c.id}`,
      icon: LandmarkIcon,
      titol: `Retenció de ${p?.nom} · ${date(retorn)}`,
      meta: `${c.contrapart} ens retorna el 5%${aRetornar ? ` · retornem ${eur(aRetornar)} a ${plural(industrials.length, "industrial", "industrials")}` : ""}`,
      valor: eur(retingut(c)),
      accio: (
        <AskAction
          size="sm"
          variant="outline"
          className="shrink-0 rounded-full"
          prompt={`Redacta un correu a ${c.contrapart} per reclamar la devolució de la retenció del 5% de ${p?.nom} (${eur(retingut(c))}), que venç el ${date(retorn)}, i prepara els dos assentaments: cobrament de la retenció i devolució de ${eur(aRetornar)} als industrials.`}
        >
          Reclamar
        </AskAction>
      ),
    });
  }
  return out;
}

export default function ContractesPage() {
  const r = resum();
  const grups: GrupContractes[] = projectes
    .map((p) => {
      const llista = contractesDe(p.id).sort((a, b) => a.seq - b.seq);
      return {
        id: p.id,
        num: p.num,
        nom: p.nom,
        total: eurCompact(llista.reduce((s, c) => s + c.import, 0)),
        files: llista.map(fila),
      };
    })
    .filter((g) => g.files.length > 0);
  const perFer = accions();

  return (
    <>
      <PageHeader crumbs={[{ label: "Contractes" }]}>
        <Button size="sm" nativeButton={false} render={<Link href="/contractes/nou" />}>
          <PlusIcon data-icon="inline-start" />
          Nou contracte
        </Button>
      </PageHeader>
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <span className="text-caption text-muted-foreground">Sense signar</span>
          <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
            {eurCompact(r.importSenseSignar)}
          </span>
          <span className="text-caption text-muted-foreground">
            {plural(r.senseSignar, "contracte", "contractes")} · {r.pendents} al Portal del Govern ·{" "}
            {plural(r.caducats, "caducat", "caducats")}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Signats" value={r.signats} hint={eurCompact(r.importSignat)} />
          <Stat label="Pendents de signatura" value={r.pendents} hint="Portal del Govern" />
          <Stat
            label="Retencions retingudes"
            value={eur(r.retingut)}
            hint={`${eurCompact(r.retingutClients)} retingut pels clients`}
          />
          <Stat label="Vencen aviat" value={r.vencenAviat} hint={`${DIES_PROPER} dies`} />
        </div>

        {perFer.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-title-sm font-semibold">Per fer</h2>
            <div className="@container flex flex-col overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
              {perFer.map((a, i) => (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 sm:px-5",
                    i > 0 && "border-t border-surface-border"
                  )}
                >
                  <span
                    className={cn(
                      "hidden size-9 shrink-0 items-center justify-center rounded-tile bg-surface-inset text-muted-foreground @md:flex",
                      a.primary && "bg-brand-soft text-brand-text"
                    )}
                  >
                    <a.icon className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="line-clamp-2 text-body font-medium">{a.titol}</span>
                    <span className="truncate text-caption text-muted-foreground">{a.meta}</span>
                  </div>
                  <span className="hidden shrink-0 font-mono text-label tabular-nums @xl:block">{a.valor}</span>
                  {a.accio}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-title-sm font-semibold">Per obra</h2>
          <ContractesBrowser grups={grups} />
        </section>
      </div>
    </>
  );
}
