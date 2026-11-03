import { CheckIcon } from "lucide-react";

import {
  clausula,
  dataLlarga,
  EMPRESA,
  getProjecte,
  IGI,
  quan,
  retornRetencio,
  SIGNANT,
  type Contracte,
} from "@/lib/contractes";
import { eur, num } from "@/lib/format";
import { nomFamilia } from "@/lib/industrials";
import { cn } from "@/lib/utils";

// One of the three contract variables: forma de pagament, retenció, venciment.
function Var({ children, titol }: { children: React.ReactNode; titol: string }) {
  return (
    <mark
      title={titol}
      className="rounded-md bg-brand-soft px-1.5 py-0.5 font-sans text-[0.9em] font-medium text-brand-text [box-decoration-break:clone]"
    >
      {children}
    </mark>
  );
}

function Buit({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md px-1.5 py-0.5 font-sans text-[0.9em] text-muted-foreground ring-1 ring-surface-border ring-inset [box-decoration-break:clone]">
      {children}
    </span>
  );
}

function Clausula({ n, titol, children }: { n: number; titol: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-1.5">
      <h4 className="font-sans text-label font-semibold">
        <span className="mr-2 font-mono text-muted-foreground tabular-nums">{n}.</span>
        {titol}
      </h4>
      <p>{children}</p>
    </li>
  );
}

function Bloc({ titol, children }: { titol: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-sans text-micro font-medium tracking-[0.08em] text-muted-foreground uppercase">{titol}</h3>
      {children}
    </section>
  );
}

export function ContracteDoc({ c, className }: { c: Contracte; className?: string }) {
  const p = getProjecte(c.obra);
  const client = c.tipus === "client";
  const retorn = retornRetencio(c);
  const contrapart = c.contrapart ? <strong>{c.contrapart}</strong> : <Buit>Industrial</Buit>;
  const conformador = client
    ? "la direcció facultativa"
    : p?.capObra
      ? `el cap d'obra, ${p.capObra}`
      : "el cap d'obra";

  const nosaltres = { rol: "El Contractista", nom: EMPRESA, signant: `${SIGNANT} · Direcció` };
  const ells = { rol: client ? "La Propietat" : "El Subcontractista", nom: c.contrapart, signant: "Representant legal" };
  const signants = client ? [ells, nosaltres] : [nosaltres, ells];

  const pujal = (
    <>
      <strong>{EMPRESA}</strong>, amb domicili a Sant Julià de Lòria, representada per {SIGNANT}, en qualitat de director,
      en endavant el Contractista.
    </>
  );
  const altra = client ? (
    <>
      <strong>{c.contrapart}</strong>, en endavant la Propietat.
    </>
  ) : (
    <>{contrapart}, en endavant el Subcontractista.</>
  );
  const [primera, segona] = client ? [altra, pujal] : [pujal, altra];

  return (
    <div className={cn("rounded-card bg-surface-inset p-2 sm:p-6", className)}>
      <article className="mx-auto flex max-w-[680px] flex-col gap-8 rounded-xl bg-card px-5 py-8 font-serif text-[15px] leading-7 text-card-foreground shadow-[var(--surface-shadow)] ring-1 ring-surface-border sm:px-10 sm:py-12">
        <header className="flex items-start justify-between gap-4 font-sans">
          <div className="flex min-w-0 flex-col">
            <span className="text-label font-semibold">{EMPRESA}</span>
            <span className="text-caption text-muted-foreground">Sant Julià de Lòria · des de 1906</span>
          </div>
          <span className="shrink-0 font-mono text-caption text-muted-foreground tabular-nums">{c.num}</span>
        </header>

        <div className="flex flex-col gap-1 font-sans">
          <h2 className="text-title font-semibold tracking-tight">
            {client ? "Contracte d'execució d'obra" : "Contracte de subcontractació"}
          </h2>
          <span className="text-caption text-muted-foreground">
            {p?.nom} · Sant Julià de Lòria, {dataLlarga(c.creat)}
          </span>
        </div>

        <Bloc titol="Reunits">
          <p>D&apos;una part, {primera}</p>
          <p>De l&apos;altra, {segona}</p>
        </Bloc>

        <Bloc titol="Clàusules">
          <ol className="flex flex-col gap-5">
            <Clausula n={1} titol="Objecte">
              {client ? (
                <>
                  Execució de les obres de {p?.nom} ({p?.lloc}), segons el projecte de {p?.arquitecte}.
                </>
              ) : (
                <>
                  Execució dels treballs de{" "}
                  {c.familia ? nomFamilia(c.familia).toLowerCase() : <Buit>família</Buit>} de l&apos;obra {p?.nom}, segons
                  amidaments, plànols i plec de condicions del projecte de {p?.arquitecte}.
                </>
              )}
            </Clausula>
            <Clausula n={2} titol="Preu">
              El preu tancat és de{" "}
              {c.import > 0 ? (
                <strong className="font-mono text-[0.95em] tabular-nums">{eur(c.import)}</strong>
              ) : (
                <Buit>import</Buit>
              )}
              , IGI ({num(IGI * 100)}%) a part.
            </Clausula>
            <Clausula n={3} titol={`Forma de pagament · clàusula ${clausula(c.pagament)}`}>
              Les certificacions mensuals es pagaran a{" "}
              <Var titol="Forma de pagament">{c.pagament} dies</Var> data factura, per transferència bancària, un cop
              conformades per {conformador}.
            </Clausula>
            <Clausula n={4} titol="Retenció de garantia">
              {c.retencio ? (
                <>
                  De cada certificació es retindrà un <Var titol="Retenció">5%</Var> en concepte de garantia, que es
                  retornarà un any després de la recepció de l&apos;obra
                  {retorn ? `, previsiblement el ${dataLlarga(retorn)}` : ""}.
                </>
              ) : (
                <>
                  No s&apos;aplica <Var titol="Retenció">cap retenció</Var> de garantia.
                </>
              )}
            </Clausula>
            <Clausula n={5} titol="Venciment">
              Aquest contracte és vigent fins al <Var titol="Venciment">{dataLlarga(c.venciment)}</Var>.
            </Clausula>
            <Clausula n={6} titol="Signatura">
              Les parts signen electrònicament a través del Portal de signatura del Govern d&apos;Andorra, amb certificat
              digital.
            </Clausula>
          </ol>
        </Bloc>

        <Bloc titol="Signatures">
          <div className="grid gap-4 font-sans sm:grid-cols-2">
            {signants.map((s) => (
              <div key={s.rol} className="flex flex-col gap-3 rounded-lg p-3 ring-1 ring-surface-border">
                <div className="flex flex-col">
                  <span className="text-caption text-muted-foreground">{s.rol}</span>
                  <span className="truncate text-label font-medium">{s.nom || "—"}</span>
                  <span className="text-caption text-muted-foreground">{s.signant}</span>
                </div>
                <div
                  className={cn(
                    "flex min-h-9 items-end border-t border-dashed border-surface-border pt-2 text-caption",
                    c.signat ? "text-success" : "text-muted-foreground"
                  )}
                >
                  {c.signat ? (
                    <span className="flex items-center gap-1.5">
                      <CheckIcon className="size-3.5 shrink-0" />
                      Signat digitalment · {quan(c.signat)}
                    </span>
                  ) : c.enviat ? (
                    "Pendent · Portal del Govern"
                  ) : (
                    "Sense enviar"
                  )}
                </div>
              </div>
            ))}
          </div>
        </Bloc>
      </article>
    </div>
  );
}
