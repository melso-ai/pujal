"use client";

import { SearchIcon } from "lucide-react";
import { useRef, useState } from "react";

import { ContracteDetall } from "@/components/contractes/contracte-detall";
import { ContracteDoc } from "@/components/contractes/contracte-doc";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ara,
  AVUI,
  contractes,
  contractesDe,
  diesFins,
  familiaPer,
  generar,
  getProjecte,
  hora,
  importSuggerit,
  pagaments,
  projectes,
  sumaMesos,
  terminis,
  type Contracte,
  type Dies,
  type Tipus,
} from "@/lib/contractes";
import { date, eurCompact } from "@/lib/format";
import { getIndustrial, industrials, nomFamilia } from "@/lib/industrials";

export type Prefill = { tipus?: Tipus; obra?: string; industrial?: string };

type Form = {
  tipus: Tipus;
  obra: string;
  industrialId: string | null;
  import: string;
  pagament: Dies;
  retencio: boolean;
  mesos: number;
};

const normalitza = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

const venciment = (obra: string, mesos: number) => sumaMesos(getProjecte(obra)?.fi ?? AVUI, mesos);

// Default to the first preset still in the future: ended obres can't take "fi d'obra".
const primerTermini = (obra: string) =>
  terminis.find((t) => diesFins(venciment(obra, t.mesos)) >= 0)?.mesos ?? terminis[terminis.length - 1].mesos;

function inicial({ tipus, obra, industrial }: Prefill): Form {
  const ind = industrial ? (getIndustrial(industrial) ?? null) : null;
  const t: Tipus = ind ? "industrial" : (tipus ?? "industrial");
  const o =
    obra && getProjecte(obra)
      ? obra
      : t === "client" || ind?.ofertes.length
        ? "pedrasses"
        : "placa-major";
  const previ = ind ? contractesDe(o).find((c) => c.industrialId === ind.id) : null;
  const s = importSuggerit(t, o, ind?.id ?? null);
  return {
    tipus: t,
    obra: o,
    industrialId: ind?.id ?? null,
    import: s ? String(s.import) : "",
    pagament: previ?.pagament ?? 60,
    retencio: previ?.retencio ?? true,
    mesos: primerTermini(o),
  };
}

function suggerits(obra: string) {
  if (obra === "pedrasses") return industrials.filter((i) => i.ofertes.some((o) => o.baseImposable !== null));
  const contractats = new Set(contractes.map((c) => c.industrialId));
  return [...industrials]
    .filter((i) => contractats.has(i.id) || i.tancats.length > 0)
    .sort((a, b) => b.tancats.length - a.tancats.length);
}

export function GeneradorContracte(prefill: Prefill) {
  const [f, setF] = useState<Form>(() => inicial(prefill));
  const [generat, setGenerat] = useState<Contracte | null>(null);
  const top = useRef<HTMLDivElement>(null);

  const mostra = (c: Contracte | null) => {
    top.current?.scrollIntoView({ block: "start" });
    setGenerat(c);
  };

  const canvia = (patch: Partial<Form>) =>
    setF((prev) => {
      const n = { ...prev, ...patch };
      const s = importSuggerit(n.tipus, n.obra, n.tipus === "industrial" ? n.industrialId : null);
      const nouContrapart = "tipus" in patch || "industrialId" in patch;
      if (s) n.import = String(s.import);
      else if (nouContrapart) n.import = "";
      if ("obra" in patch) n.mesos = primerTermini(n.obra);
      return n;
    });

  const p = getProjecte(f.obra);
  const vars = {
    tipus: f.tipus,
    obra: f.obra,
    industrialId: f.tipus === "industrial" ? f.industrialId : null,
    import: Number(f.import) || 0,
    pagament: f.pagament,
    retencio: f.retencio,
    venciment: venciment(f.obra, f.mesos),
  };
  const preview = generar(vars, `${AVUI}T09:00`);
  const suggerit = importSuggerit(vars.tipus, vars.obra, vars.industrialId);
  const llest = vars.import > 0 && (f.tipus === "client" || Boolean(f.industrialId));

  if (generat)
    return (
      <div ref={top} className="scroll-mt-12">
        <ContracteDetall
          key={generat.creat}
          inicial={generat}
          avis={`${generat.num} generat · ${hora(generat.creat)}`}
          onEditar={() => mostra(null)}
        />
      </div>
    );

  return (
    <div ref={top} className="@container scroll-mt-12 p-4 md:p-8">
      <div className="grid grid-cols-1 gap-8 @3xl:grid-cols-[320px_minmax(0,1fr)] @3xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-caption text-muted-foreground">Nou contracte</span>
            <span className="font-mono text-display-sm font-medium tracking-tight tabular-nums">{preview.num}</span>
          </div>

          <Camp label="Tipus">
            <Segment
              label="Tipus"
              value={f.tipus}
              onChange={(tipus) => canvia({ tipus })}
              opcions={[
                { value: "client", label: "Client" },
                { value: "industrial", label: "Industrial" },
              ]}
            />
          </Camp>

          <Camp label="Obra" htmlFor="obra">
            <select
              id="obra"
              value={f.obra}
              onChange={(e) => canvia({ obra: e.target.value })}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 *:bg-popover *:text-popover-foreground"
            >
              {projectes.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.num} · {o.nom}
                </option>
              ))}
            </select>
          </Camp>

          {f.tipus === "client" ? (
            <Camp label="Client">
              <div className="flex min-w-0 flex-col rounded-lg px-3 py-2 ring-1 ring-surface-border">
                <span className="truncate text-label font-medium">{p?.client}</span>
                <span className="truncate text-caption text-muted-foreground">{p?.lloc}</span>
              </div>
            </Camp>
          ) : (
            <Camp label="Industrial">
              <TriaIndustrial obra={f.obra} value={f.industrialId} onChange={(industrialId) => canvia({ industrialId })} />
            </Camp>
          )}

          <Camp
            label="Import"
            htmlFor="import"
            hint={suggerit && String(suggerit.import) === f.import ? suggerit.font : "IGI a part"}
          >
            <InputGroup>
              <InputGroupInput
                id="import"
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                placeholder="0"
                value={f.import}
                onChange={(e) => setF((prev) => ({ ...prev, import: e.target.value }))}
                className="font-mono tabular-nums"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>€</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Camp>

          <Camp label="Forma de pagament" variable>
            <Segment
              label="Forma de pagament"
              value={f.pagament}
              onChange={(pagament) => setF((prev) => ({ ...prev, pagament }))}
              opcions={pagaments.map((x) => ({
                value: x.dies,
                label: (
                  <>
                    {x.dies} dies <span className="font-mono text-muted-foreground">{x.clausula}</span>
                  </>
                ),
              }))}
            />
          </Camp>

          <Camp label="Retenció" variable hint={f.retencio ? "Es retorna 1 any després de l'obra" : undefined}>
            <Segment
              label="Retenció"
              value={f.retencio ? "si" : "no"}
              onChange={(v) => setF((prev) => ({ ...prev, retencio: v === "si" }))}
              opcions={[
                { value: "si", label: "5%" },
                { value: "no", label: "Sense" },
              ]}
            />
          </Camp>

          <Camp label="Venciment" variable hint={date(vars.venciment)}>
            <Segment
              label="Venciment"
              value={f.mesos}
              onChange={(mesos) => setF((prev) => ({ ...prev, mesos }))}
              opcions={terminis.map((t) => ({
                value: t.mesos,
                label: t.label,
                disabled: diesFins(venciment(f.obra, t.mesos)) < 0,
              }))}
            />
          </Camp>

          <Button
            size="lg"
            className="w-full rounded-full"
            disabled={!llest}
            onClick={() => mostra(generar(vars, ara()))}
          >
            Generar contracte
          </Button>
        </div>

        <ContracteDoc c={preview} className="min-w-0" />
      </div>
    </div>
  );
}

function Camp({
  label,
  htmlFor,
  hint,
  variable,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  variable?: boolean;
  children: React.ReactNode;
}) {
  const Etiqueta = htmlFor ? "label" : "span";
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Etiqueta htmlFor={htmlFor} className="flex items-center gap-1.5 text-caption text-muted-foreground">
        {variable && <span className="size-1.5 shrink-0 rounded-full bg-brand" />}
        {label}
      </Etiqueta>
      {children}
      {hint && <span className="text-caption text-muted-foreground">{hint}</span>}
    </div>
  );
}

function Segment<T extends string | number>({
  label,
  value,
  opcions,
  onChange,
}: {
  label: string;
  value: T;
  opcions: { value: T; label: React.ReactNode; disabled?: boolean }[];
  onChange: (v: T) => void;
}) {
  return (
    <Tabs
      value={String(value)}
      onValueChange={(v) => {
        const o = opcions.find((x) => String(x.value) === String(v));
        if (o) onChange(o.value);
      }}
    >
      <TabsList className="w-full pointer-coarse:h-auto!" aria-label={label}>
        {opcions.map((o) => (
          <TabsTrigger key={String(o.value)} value={String(o.value)} disabled={o.disabled} className="px-2">
            {o.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function TriaIndustrial({
  obra,
  value,
  onChange,
}: {
  obra: string;
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [cerca, setCerca] = useState("");
  const ind = value ? getIndustrial(value) : null;

  if (ind) {
    const familia = familiaPer(ind.id, obra);
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg py-2 pr-2 pl-3 ring-1 ring-surface-border">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-label font-medium">{ind.nom}</span>
          <span className="truncate text-caption text-muted-foreground">
            {familia ? `${familia} · ${nomFamilia(familia)}` : "Sense família"}
          </span>
        </div>
        <Button size="xs" variant="ghost" onClick={() => onChange(null)}>
          Canviar
        </Button>
      </div>
    );
  }

  const q = normalitza(cerca.trim());
  const llista = (
    q
      ? industrials.filter((i) => normalitza(`${i.nom} ${i.families.map(nomFamilia).join(" ")}`).includes(q))
      : suggerits(obra)
  ).slice(0, 6);

  return (
    <div className="flex flex-col gap-1.5">
      <InputGroup>
        <InputGroupInput
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
          placeholder="Industrial o família"
          aria-label="Cercar industrial"
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      <ul className="flex flex-col rounded-lg p-1 ring-1 ring-surface-border">
        {llista.map((i) => {
          const s = importSuggerit("industrial", obra, i.id);
          const familia = familiaPer(i.id, obra);
          return (
            <li key={i.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(i.id);
                  setCerca("");
                }}
                className="flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-surface-hover"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-label">{i.nom}</span>
                  <span className="truncate text-caption text-muted-foreground">
                    {familia ? nomFamilia(familia) : ""}
                  </span>
                </span>
                {s && (
                  <span className="shrink-0 font-mono text-caption text-muted-foreground tabular-nums">
                    {eurCompact(s.import)}
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {llista.length === 0 && <li className="px-2.5 py-1.5 text-caption text-muted-foreground">Cap industrial</li>}
      </ul>
    </div>
  );
}
