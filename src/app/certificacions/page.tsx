import { Cicle, type Tram } from "@/components/certificacions/cicle";
import { fila } from "@/components/certificacions/fila";
import { MesosAnteriors, type Mes } from "@/components/certificacions/mesos-anteriors";
import { AskAction } from "@/components/chat/ask-action";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import {
  AVUI,
  CICLE,
  de,
  deMes,
  dia,
  getObraCert,
  mesLabel,
  mesosAnteriors,
  resumCicle,
  retencions,
  totals,
  type Certificacio,
} from "@/lib/certificacions";
import { date, eur, eurCompact, plural } from "@/lib/format";

const DIA = 86_400_000;
const obraDe = (c: Certificacio) => getObraCert(c.obraId)!;
const suma = (cs: Certificacio[]) => cs.reduce((s, c) => s + totals(c).pujal, 0);

export default function CertificacionsPage() {
  const r = resumCicle();
  const llestes = r.certs.filter((c) => c.estat === "Certificació");
  const produccio = r.certs.filter((c) => c.estat === "Producció");
  const ret = retencions();
  const acabades = ret.filter((x) => x.acabada);
  const enCurs = ret.filter((x) => !x.acabada);

  const trams: Tram[] = r.perEstat.map((e) => ({
    estat: e.estat,
    n: e.n,
    import: eur(e.import),
    pes: r.total ? (e.import / r.total) * 100 : 0,
    nota: e.signades ? plural(e.signades, "signada", "signades") : undefined,
  }));

  const mesos: Mes[] = mesosAnteriors().map(({ mes, certs }) => {
    const perCobrar = certs.filter((c) => c.estat === "Facturada").length;
    return {
      mes,
      label: mesLabel(mes),
      total: eur(suma(certs)),
      resum: plural(certs.length, "certificació", "certificacions"),
      pendent: perCobrar ? `${perCobrar} per cobrar` : undefined,
      files: certs.map(fila),
    };
  });

  const enviar = `Redacta els correus per enviar a signar les certificacions ${deMes(CICLE)} que estan llestes: ${llestes
    .map((c) => `${obraDe(c).nom} a ${obraDe(c).signant} (${obraDe(c).arquitecte}), ${eur(totals(c).pujal)}`)
    .join("; ")}.`;
  const demanar = `Redacta un missatge a ${[...new Set(produccio.map((c) => obraDe(c).capObra))].join(" i ")} perquè tanquin la producció ${deMes(CICLE)} ${de(
    produccio.map((c) => obraDe(c).nom).join(" i ")
  )} i la passin al programa de certificacions.`;

  return (
    <>
      <PageHeader crumbs={[{ label: "Certificacions" }]} />
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-caption text-muted-foreground">Per certificar {deMes(CICLE)}</span>
            <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
              {eur(r.perCertificar.import)}
            </span>
            <span className="text-caption text-muted-foreground">
              {r.perCertificar.n} de {plural(r.certs.length, "obra", "obres")} · {eurCompact(r.total)} al cicle
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {llestes.length > 0 && (
              <AskAction size="sm" className="rounded-full" prompt={enviar}>
                Enviar {llestes.length} a l&apos;arquitecte
              </AskAction>
            )}
            {produccio.length > 0 && (
              <AskAction size="sm" variant="outline" className="rounded-full" prompt={demanar}>
                Demanar producció
              </AskAction>
            )}
            <AskAction
              size="sm"
              variant="outline"
              className="rounded-full"
              prompt={`Quines certificacions ${deMes(CICLE)} tenen capítols desviats de la planificació o per sobre del pressupost?`}
            >
              Revisar desviacions
            </AskAction>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Pendents de l'arquitecte" value={r.arquitecte.n} hint={eur(r.arquitecte.import)} />
          <Stat
            label="Facturat aquest mes"
            value={eur(r.facturat.import)}
            hint={plural(r.facturat.n, "factura", "factures")}
          />
          <Stat
            label="Retencions a cobrar"
            value={eur(r.retencions.import)}
            hint={
              r.retencions.propera
                ? `${eurCompact(r.retencions.propera.import)} el ${dia(r.retencions.propera.venciment)}`
                : undefined
            }
          />
          <Stat
            label="UTEs"
            value={r.utes.length}
            hint={r.utes
              .map((u) => u.participacio)
              .sort((a, b) => a - b)
              .map((p) => `${p}%`)
              .join(" · ")}
          />
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-title-sm font-semibold">{mesLabel(CICLE)}</h2>
            <span className="text-label text-muted-foreground">Cicle actual</span>
          </div>
          <Cicle trams={trams} files={r.certs.map(fila)} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-title-sm font-semibold">Retencions</h2>
          <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
            {acabades.map((x) => {
              const dies = Math.round((new Date(x.venciment).getTime() - new Date(AVUI).getTime()) / DIA);
              return (
                <div key={x.obra.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-body font-medium">{x.obra.nom}</span>
                    <span className={dies <= 30 ? "truncate text-caption text-brand-text" : "truncate text-caption text-muted-foreground"}>
                      {dies <= 30 ? `${dia(x.venciment)} · ${dies} dies` : `Cobrable el ${date(x.venciment)}`}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono text-label tabular-nums">{eur(x.import)}</span>
                  {dies <= 30 && (
                    <AskAction
                      size="sm"
                      className="shrink-0 rounded-full"
                      prompt={`Redacta la carta a ${x.obra.client} per reclamar la retenció de garantia del 5% ${de(x.obra.nom)} (${eur(x.import)}). L'obra es va acabar el ${date(x.obra.fi)} i la retenció es pot cobrar a partir del ${date(x.venciment)}.`}
                    >
                      Reclamar
                    </AskAction>
                  )}
                </div>
              );
            })}
            {enCurs.length > 0 && (
              <div className="flex items-center gap-4 px-4 py-3">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body text-muted-foreground">
                    {plural(enCurs.length, "obra", "obres")} en curs
                  </span>
                  <span className="truncate text-caption text-muted-foreground">
                    {enCurs.map((x) => x.obra.nom).join(", ")}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-label text-muted-foreground tabular-nums">
                  {eur(enCurs.reduce((s, x) => s + x.import, 0))}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-title-sm font-semibold">Mesos anteriors</h2>
          <MesosAnteriors mesos={mesos} />
        </section>
      </div>
    </>
  );
}
