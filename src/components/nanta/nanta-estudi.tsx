"use client";

import { Fragment, useMemo, useState, useSyncExternalStore } from "react";
import { ChevronDownIcon, ChevronRightIcon, DownloadIcon, SearchIcon } from "lucide-react";

import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eur, num } from "@/lib/format";
import data from "@/lib/nanta/data.json";
import { cercleMinim, FASES, proposta, seccions, TIPUS, type Casa, type Fase, type FasePer, type NantaData } from "@/lib/nanta/model";

const D = data as unknown as NantaData;
const BASE = proposta(D.houses);
const CLAU = "nanta-fases";
const COLOR_TIPUS: Record<number, string> = { 1: "#6f97cf", 2: "#5f8a78", 3: "#a5634f", 4: "#c583b9", 5: "#f0a56f" };
const COLOR_FASE: Record<Fase, string> = { I: "var(--brand)", II: "var(--nanta-f2)" };
const m2 = (x: number, d = 2) => x.toLocaleString("ca-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
const nn = (n: number) => String(n).padStart(2, "0");

// Phases are a per-viewer draft: kept in memory and, when the browser allows it, in localStorage.
let estat: FasePer = BASE;
let carregat = false;
const subs = new Set<() => void>();
function llegirFases() {
  if (!carregat) {
    carregat = true;
    try {
      const v = JSON.parse(localStorage.getItem(CLAU) ?? "null");
      if (v && Object.keys(v).length === D.houses.length) estat = v;
    } catch {}
  }
  return estat;
}
function desarFases(v: FasePer) {
  estat = v;
  try { localStorage.setItem(CLAU, JSON.stringify(v)); } catch {}
  subs.forEach((f) => f());
}
const subscriure = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const useFases = () => useSyncExternalStore(subscriure, llegirFases, () => BASE);

const CLAUS = ["conjunt", "avisos", "adequacio", "invitacions"];
const ETIQUETES = ["Conjunt", "Avisos", "Adequació", "Invitacions"];
const subscriureHash = (f: () => void) => { window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); };

const casesDe = (f: FasePer, fase: Fase) => D.houses.filter((h) => f[h.n] === fase);
const compte = (f: FasePer, fase: Fase, t: number) => casesDe(f, fase).filter((h) => h.t === t).length;
const grua = (f: FasePer, fase: Fase) => cercleMinim(casesDe(f, fase).flatMap((h) => h.poly));

function Interruptor<T extends string>({ valor, opcions, onChange, etiqueta }: { valor: T; opcions: [T, string][]; onChange: (v: T) => void; etiqueta: string }) {
  return (
    <Tabs value={valor} onValueChange={(v) => onChange(v as T)} aria-label={etiqueta}>
      <TabsList>{opcions.map(([k, l]) => <TabsTrigger key={k} value={k} className="px-3">{l}</TabsTrigger>)}</TabsList>
    </Tabs>
  );
}

function Planol({ fases, sel, onSel, mode, ambGrua }: { fases: FasePer; sel: number | null; onSel: (n: number) => void; mode: "tipus" | "fase"; ambGrua: boolean }) {
  const [vx, vy, vw, vh] = D.view;
  return (
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} role="group" aria-label="Plànol de conjunt amb les 25 cases" className="block h-auto w-full rounded-tile bg-white dark:bg-[#111] dark:[&_image]:[filter:invert(1)_hue-rotate(180deg)_brightness(.82)]">
      <image href="/nanta/planol-a10.jpg" x={vx} y={vy} width={vw} height={vh} />
      {D.houses.map((h) => {
        const cx = h.poly.reduce((s, p) => s + p[0], 0) / 4;
        const cy = h.poly.reduce((s, p) => s + p[1], 0) / 4;
        const on = sel === h.n;
        return (
          <Fragment key={h.n}>
            <polygon
              points={h.poly.map((p) => p.join(",")).join(" ")}
              tabIndex={0}
              role="button"
              aria-label={`Habitatge ${h.n}, tipus ${h.t}, fase ${fases[h.n]}`}
              aria-pressed={on}
              onClick={() => onSel(h.n)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSel(h.n); } }}
              className="cursor-pointer outline-none transition-[fill-opacity] hover:fill-opacity-85 focus-visible:fill-opacity-85"
              style={{ fill: mode === "tipus" ? COLOR_TIPUS[h.t] : COLOR_FASE[fases[h.n]], fillOpacity: on ? 0.9 : 0.62, stroke: on ? "var(--foreground)" : "rgba(0,0,0,.35)", strokeWidth: on ? 14 : 4 }}
            />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="pointer-events-none select-none" style={{ font: "600 64px var(--font-sans, sans-serif)", fill: "#fff", paintOrder: "stroke", stroke: "rgba(0,0,0,.55)", strokeWidth: 10 }}>{nn(h.n)}</text>
          </Fragment>
        );
      })}
      {ambGrua && FASES.map((f) => {
        const c = grua(fases, f);
        if (!c) return null;
        return (
          <g key={f}>
            <circle cx={c.x} cy={c.y} r={c.r} fill="none" strokeWidth={9} strokeDasharray="34 26" style={{ stroke: COLOR_FASE[f] }} />
            <circle cx={c.x} cy={c.y} r={16} style={{ fill: COLOR_FASE[f] }} />
            <text x={c.x} y={c.y - 36} textAnchor="middle" style={{ font: "600 58px var(--font-sans, sans-serif)", fill: COLOR_FASE[f], paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 14 }}>Fase {f}: {m2(c.r * D.mpx, 0)} m</text>
          </g>
        );
      })}
    </svg>
  );
}

function Fila({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1 text-label">
      <span className="text-muted-foreground">{k}</span>
      <span className={`text-right font-medium whitespace-nowrap ${mono ? "font-mono text-caption" : ""}`}>{v}</span>
    </div>
  );
}

function Conjunt({ fases }: { fases: FasePer }) {
  const [mode, setMode] = useState<"tipus" | "fase">("tipus");
  const [ambGrua, setGrua] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const casa: Casa | null = sel ? D.houses.find((h) => h.n === sel) ?? null : null;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)] @4xl:items-start">
        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Interruptor etiqueta="Color del plànol" valor={mode} opcions={[["tipus", "Tipus"], ["fase", "Fase"]]} onChange={setMode} />
              <Button variant="outline" size="sm" aria-pressed={ambGrua} onClick={() => setGrua(!ambGrua)}>{ambGrua ? "Amagar grues" : "Veure abast de grua"}</Button>
            </div>
            <Planol fases={fases} sel={sel} onSel={setSel} mode={mode} ambGrua={ambGrua} />
            <div className="flex flex-wrap gap-3 text-caption text-muted-foreground">
              {mode === "tipus"
                ? TIPUS.map((t) => <span key={t} className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px]" style={{ background: COLOR_TIPUS[t] }} />Tipus {t}</span>)
                : FASES.map((f) => <span key={f} className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px]" style={{ background: COLOR_FASE[f] }} />Fase {f}</span>)}
            </div>
            {ambGrua && <p className="text-caption text-muted-foreground">Cercle mínim que arriba a totes les cases de cada fase. L&apos;escala surt de la planta tipus, és aproximada. Falta comprovar accessos, pesos i obstacles.</p>}
          </CardContent>
        </Card>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
            {FASES.map((f) => {
              const cs = casesDe(fases, f);
              const c = grua(fases, f);
              return (
                <Card key={f} size="sm">
                  <CardHeader><CardTitle className="flex items-center gap-2"><i className="size-2.5 rounded-[3px]" style={{ background: COLOR_FASE[f] }} />Fase {f}</CardTitle></CardHeader>
                  <CardContent>
                    <Fila k="Cases" v={cs.length} />
                    <Fila k="Construït" v={`${m2(cs.reduce((s, h) => s + h.m2, 0), 0)} m²`} />
                    <Fila k="Instal·lacions*" v={eur(cs.reduce((s, h) => s + D.types[h.t].total, 0))} />
                    <Fila k="Abast de grua" v={c ? `${m2(c.r * D.mpx, 0)} m` : "-"} />
                    <div className="mt-2 flex flex-wrap gap-1">
                      {TIPUS.filter((t) => compte(fases, f, t)).map((t) => <span key={t} className="rounded-full px-2 py-px text-micro font-medium text-white" style={{ background: COLOR_TIPUS[t] }}>T{t} × {compte(fases, f, t)}</span>)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card size="sm">
            <CardHeader>
              <CardTitle>{casa ? `Habitatge ${nn(casa.n)}` : "Cap casa seleccionada"}</CardTitle>
              {!casa && <CardDescription>Clica una casa al plànol per veure&apos;n les dades o canviar-la de fase.</CardDescription>}
            </CardHeader>
            {casa && (
              <CardContent>
                <Fila k="Tipus al plànol" v={`Tipus ${casa.t}${casa.o}`} />
                <Fila k="Construït" v={`${m2(casa.m2)} m²`} />
                <Fila k="A l'Excel de ràtios" v={`Tipo ${casa.oldT}, ${m2(casa.oldM2)} m²`} />
                <Fila k="Arquitectura" v={D.types[casa.t].arch} mono />
                <Fila k="Instal·lacions*" v={`Habitatge ${casa.t}, ${eur(D.types[casa.t].total)}`} />
                <div className="mt-3">
                  <Interruptor etiqueta="Fase de la casa" valor={fases[casa.n]} opcions={[["I", "Fase I"], ["II", "Fase II"]]} onChange={(v) => desarFases({ ...fases, [casa.n]: v })} />
                </div>
              </CardContent>
            )}
          </Card>
          <p className="text-caption text-muted-foreground">* BC3 de l&apos;enginyer, a preus de l&apos;enginyer. Els BC3 d&apos;arquitectura no porten preus.</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Quina arquitectura va amb quina instal·lació</CardTitle><CardDescription>Pendent de confirmar amb l&apos;arquitecte. Evidència a Avisos.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Tipus</TableHead><TableHead className="text-right">Cases</TableHead><TableHead className="text-right">m² per casa</TableHead><TableHead>Arquitectura</TableHead><TableHead>Codi intern</TableHead><TableHead>Instal·lacions</TableHead><TableHead className="text-right">Instal. per casa*</TableHead></TableRow></TableHeader>
            <TableBody>
              {TIPUS.map((t) => {
                const x = D.types[t];
                return <TableRow key={t}><TableCell>Tipus {t}</TableCell><TableCell className="text-right tabular-nums">{D.houses.filter((h) => h.t === t).length}</TableCell><TableCell className="text-right tabular-nums">{m2(x.m2)}</TableCell><TableCell className="font-mono text-caption">{x.arch}</TableCell><TableCell className="font-mono text-caption">{x.root}</TableCell><TableCell>Habitatge {t}</TableCell><TableCell className="text-right tabular-nums">{eur(x.total)}</TableCell></TableRow>;
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Avisos() {
  return (
    <div className="flex flex-col gap-3">
      {D.avisos.map((a) => (
        <Card key={a.id}>
          <CardHeader><CardTitle>{a.t}</CardTitle></CardHeader>
          <CardContent className="grid gap-x-8 gap-y-3 @3xl:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">{a.d}</p>
              <p className="font-medium">{a.a}</p>
            </div>
            <ul className="flex list-disc flex-col gap-1 pl-4">{a.ev.map((e) => <li key={e}>{e}</li>)}</ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Adequacio({ fases }: { fases: FasePer }) {
  const sep: Record<string, { s: string[]; c: string[]; n: number }> = {};
  for (const r of D.rows) {
    if (!r.sp || !r.p) continue;
    const g = (sep[r.sp] ??= { s: [], c: [], n: 0 });
    if (r.p === "S") g.n++;
    const l = r.p === "S" ? g.s : g.c;
    for (const f of r.f) if (!l.includes(f)) l.push(f);
  }
  const total = Object.values(sep).reduce((s, g) => s + g.n, 0);
  const abast = (f: Fase) => { const c = grua(fases, f); return c ? m2(c.r * D.mpx, 0) : "-"; };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" nativeButton={false} render={<a href="/nanta/adequacio.xlsx" download="Nanta Alta - Adequació del pressupost.xlsx" />}><DownloadIcon data-icon="inline-start" />Excel d&apos;adequació</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Ordre proposat de l&apos;oferta</CardTitle></CardHeader>
        <CardContent>
          <ol className="flex list-decimal flex-col gap-1 pl-5">
            {FASES.flatMap((f) => [
              <li key={`p${f}`}>Preliminars de la Fase {f}</li>,
              <li key={`t${f}`}>Fase {f}: {TIPUS.filter((t) => compte(fases, f, t)).map((t) => `Tipus ${t}`).join(", ")}, cada un amb arquitectura i instal·lacions</li>,
            ])}
            <li>Exteriors i urbanització, repartits per fase</li>
            <li>Partides complementàries, un cop validades</li>
          </ol>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Partides complementàries a validar</CardTitle><CardDescription>No són al BC3 i no van a les invitacions fins que les valideu.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Partida</TableHead><TableHead>Per què</TableHead><TableHead>Estat</TableHead></TableRow></TableHeader>
            <TableBody>
              {D.compl.map((c) => (
                <TableRow key={c.c}>
                  <TableCell className="min-w-56 align-top whitespace-normal">{c.c}</TableCell>
                  <TableCell className="min-w-72 align-top whitespace-normal text-muted-foreground">{c.w.replace("{I}", abast("I")).replace("{II}", abast("II"))}</TableCell>
                  <TableCell className="align-top"><Badge variant={c.s === "Falta" ? "destructive" : "secondary"}>{c.s}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Subministrament i col·locació</CardTitle><CardDescription>{total} partides separades en dues, amb el codi acabat en C per a la col·locació, com a Pedrasses.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Grup</TableHead><TableHead className="text-right">Partides</TableHead><TableHead>Subministrament</TableHead><TableHead>Col·locació</TableHead></TableRow></TableHeader>
            <TableBody>{Object.entries(sep).map(([k, g]) => <TableRow key={k}><TableCell>{k}</TableCell><TableCell className="text-right tabular-nums">{g.n}</TableCell><TableCell className="text-muted-foreground">{g.s.join(", ")}</TableCell><TableCell className="text-muted-foreground">{g.c.join(", ")}</TableCell></TableRow>)}</TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Instal·lacions per capítol</CardTitle><CardDescription>Imports dels BC3 de l&apos;enginyer, en euros. No són ofertes d&apos;industrials.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Capítol</TableHead>{TIPUS.map((t) => <TableHead key={t} className="text-right">Tipus {t}</TableHead>)}<TableHead className="text-right">25 cases</TableHead></TableRow></TableHeader>
            <TableBody>
              {Object.entries(D.ch).map(([k, v]) => (
                <TableRow key={k}><TableCell>{k.charAt(0) + k.slice(1).toLowerCase()}</TableCell>{TIPUS.map((t) => <TableCell key={t} className="text-right tabular-nums">{num(Math.round(v[t]))}</TableCell>)}<TableCell className="text-right tabular-nums">{num(Math.round(TIPUS.reduce((s, t) => s + v[t] * D.houses.filter((h) => h.t === t).length, 0)))}</TableCell></TableRow>
              ))}
            </TableBody>
            <TableFooter><TableRow><TableCell>Total</TableCell>{TIPUS.map((t) => <TableCell key={t} className="text-right tabular-nums">{num(Math.round(D.types[t].total))}</TableCell>)}<TableCell className="text-right tabular-nums">{num(Math.round(D.proj))}</TableCell></TableRow></TableFooter>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Superfícies casa per casa</CardTitle><CardDescription>Excel de ràtios de juliol i plànols actuals.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Casa</TableHead><TableHead>A l&apos;Excel</TableHead><TableHead className="text-right">m² Excel</TableHead><TableHead>Al plànol</TableHead><TableHead className="text-right">m² plànol</TableHead><TableHead className="text-right">Diferència</TableHead></TableRow></TableHeader>
            <TableBody>{D.houses.map((h) => <TableRow key={h.n}><TableCell>{nn(h.n)}</TableCell><TableCell>Tipo {h.oldT}</TableCell><TableCell className="text-right tabular-nums">{m2(h.oldM2)}</TableCell><TableCell>Tipus {h.t}{h.o}</TableCell><TableCell className="text-right tabular-nums">{m2(h.m2)}</TableCell><TableCell className="text-right tabular-nums">+{m2(h.m2 - h.oldM2)}</TableCell></TableRow>)}</TableBody>
            <TableFooter><TableRow><TableCell colSpan={2}>Total</TableCell><TableCell className="text-right tabular-nums">{m2(D.houses.reduce((s, h) => s + h.oldM2, 0))}</TableCell><TableCell /><TableCell className="text-right tabular-nums">{m2(D.houses.reduce((s, h) => s + h.m2, 0))}</TableCell><TableCell className="text-right tabular-nums">+{m2(D.houses.reduce((s, h) => s + h.m2 - h.oldM2, 0))}</TableCell></TableRow></TableFooter>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Ràtios: encara no</CardTitle><CardDescription>Els BC3 d&apos;arquitectura no porten preus. La versió nova s&apos;ha de fer amb els preus dels quatre pressupostos que heu passat, i ha de passar per la revisió de la Jennifer.</CardDescription></CardHeader>
      </Card>
    </div>
  );
}

async function descarregar(fases: FasePer, fase: Fase, familia?: string) {
  const [ExcelMod, textsMod, { llibre, nomFitxer }] = await Promise.all([import("exceljs"), import("@/lib/nanta/texts.json"), import("@/lib/nanta/excel")]);
  const ExcelJS = ((ExcelMod as { default?: unknown }).default ?? ExcelMod) as Parameters<typeof llibre>[0];
  const texts = textsMod.default as string[];
  const canviades = D.houses.some((h) => fases[h.n] !== BASE[h.n]);
  const nota = `Esborrany Melso per a revisió d'estudis. ${canviades ? "Fases editades a l'estudi" : "Fases proposades: 01-13 i 14-25"}, pendents de validar.`;
  const noms = familia ? [familia] : D.famNames;
  const fulls = noms.map((f) => ({ familia: f, secs: seccions(D, fases, fase, f) })).filter((x) => x.secs.length);
  const buf = await llibre(ExcelJS, fase, seccions(D, fases, fase), fulls, texts, nota);
  const url = URL.createObjectURL(new Blob([buf as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFitxer(fase, familia);
  a.click();
  URL.revokeObjectURL(url);
}

function Invitacions({ fases }: { fases: FasePer }) {
  const [fase, setFase] = useState<Fase>("I");
  const [cerca, setCerca] = useState("");
  const [obert, setObert] = useState<string | null>(null);
  const [fent, setFent] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const q = cerca.trim().toLocaleLowerCase("ca");
  const families = useMemo(() => D.famNames.map((f) => ({ f, secs: seccions(D, fases, fase, f) })).filter(({ f, secs }) => secs.length && (!q || f.toLocaleLowerCase("ca").includes(q) || secs.some((s) => s.linies.some((l) => `${l.r.n} ${l.r.c}`.toLocaleLowerCase("ca").includes(q))))), [fases, fase, q]);
  const baixa = async (familia?: string) => {
    setFent(familia ?? "*");
    setError(false);
    try { await descarregar(fases, fase, familia); } catch { setError(true); } finally { setFent(null); }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitacions als industrials</CardTitle>
        <CardDescription>Un Excel per família i fase, amb la pestanya TOTS i la de la família, ordenat per tipologia i amb els preus en blanc. Surten amb les fases que tens ara. L&apos;assignació a famílies és una primera versió apresa d&apos;Agudes i Pedrasses.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Interruptor etiqueta="Fase" valor={fase} opcions={[["I", "Fase I"], ["II", "Fase II"]]} onChange={(v) => { setFase(v); setObert(null); }} />
          <div className="relative min-w-0 flex-1 basis-48">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Cerca família o partida" placeholder="Cerca família o partida…" value={cerca} onChange={(e) => setCerca(e.target.value)} className="pl-9" />
          </div>
          <Button size="sm" disabled={!!fent} onClick={() => baixa()}><DownloadIcon data-icon="inline-start" />{fent === "*" ? "Generant…" : `Excel complet de la Fase ${fase}`}</Button>
        </div>
        {error && <p role="alert" className="text-caption text-destructive">No s&apos;ha pogut generar l&apos;Excel. Torna-ho a provar.</p>}
        {families.length === 0 && <p className="py-4 text-center text-muted-foreground">Cap família coincideix amb la cerca.</p>}
        <div className="flex flex-col divide-y divide-border">
          {families.map(({ f, secs }) => {
            const n = secs.reduce((s, x) => s + x.linies.length, 0);
            const obre = obert === f;
            return (
              <div key={f}>
                <div className="flex items-center gap-2 py-1.5">
                  <button type="button" aria-expanded={obre} onClick={() => setObert(obre ? null : f)} className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                    {obre ? <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" /> : <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />}
                    <span className="truncate font-medium">{f}</span>
                    <span className="ml-auto shrink-0 text-caption text-muted-foreground tabular-nums">{num(n)} {n === 1 ? "línia" : "línies"}</span>
                  </button>
                  <Button variant="outline" size="sm" disabled={!!fent} aria-label={`Descarregar Excel de ${f}, Fase ${fase}`} onClick={() => baixa(f)}><DownloadIcon data-icon="inline-start" />{fent === f ? "Generant…" : "Excel"}</Button>
                </div>
                {obre && (
                  <div className="pb-3">
                    <Table>
                      <TableHeader><TableRow><TableHead>Codi</TableHead><TableHead>Ut</TableHead><TableHead>Partida</TableHead><TableHead className="text-right">Quantitat</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {secs.map((s) => (
                          <Fragment key={s.titol}>
                            <TableRow className="bg-surface-inset hover:bg-surface-inset"><TableCell colSpan={4} className="text-caption font-medium whitespace-normal">{s.titol}</TableCell></TableRow>
                            {s.linies.map((l) => (
                              <TableRow key={l.idx}>
                                <TableCell className="align-top font-mono text-caption">{l.r.c}</TableCell>
                                <TableCell className="align-top">{l.r.u}</TableCell>
                                <TableCell className="min-w-64 align-top whitespace-normal">{l.r.n}{l.r.g && <Badge variant="outline" className="ml-2">També a {l.r.g === "arch" ? "instal·lacions" : "arquitectura"}</Badge>}</TableCell>
                                <TableCell className="text-right align-top tabular-nums">{m2(l.q)}</TableCell>
                              </TableRow>
                            ))}
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function NantaEstudi() {
  const fases = useFases();
  const hash = useSyncExternalStore(subscriureHash, () => window.location.hash.slice(1), () => "");
  const idx = Math.max(0, CLAUS.indexOf(hash));
  const canviades = D.houses.some((h) => fases[h.n] !== BASE[h.n]);
  return (
    <div className="@container flex min-w-0 flex-col gap-8 p-4 [--nanta-f2:#3b0d11] md:p-8 dark:[--nanta-f2:#fdf8df]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-display-sm font-semibold tracking-tight">Nanta Alta</h1>
            <Badge variant="secondary">Esborrany per a estudis</Badge>
          </div>
          <p className="text-sm text-muted-foreground">25 habitatges · Encamp · DATA Arquitectura · Jennifer</p>
        </div>
        <div className="flex flex-wrap items-end gap-x-12 gap-y-4">
          <Stat label="Construït" value={`${m2(D.houses.reduce((s, h) => s + h.m2, 0), 0)} m²`} hint="Plànols actuals" />
          <Stat label="Partides" value={num(D.rows.length)} hint="Arquitectura, instal·lacions i exteriors" />
          <Stat label="Famílies" value={D.famNames.length} hint="Per a les invitacions" />
          <Stat label="Avisos" value={D.avisos.length} hint="Per revisar" />
        </div>
        {canviades && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-tile bg-surface-inset px-4 py-3 text-label">
            <span>Has canviat les fases respecte a la proposta 01-13 i 14-25. Els totals i els Excels ja ho tenen en compte.</span>
            <Button variant="outline" size="sm" onClick={() => desarFases(BASE)}>Tornar a la proposta</Button>
          </div>
        )}
      </div>
      <Tabs className="min-w-0" value={ETIQUETES[idx]} onValueChange={(v) => { const i = ETIQUETES.indexOf(v as string); if (i < 0) return; window.history.replaceState(null, "", `#${CLAUS[i]}`); window.dispatchEvent(new HashChangeEvent("hashchange")); }}>
        <TabsList variant="line" className="min-h-11 w-full min-w-0 justify-start overflow-x-auto">
          {ETIQUETES.map((e) => <TabsTrigger key={e} value={e} className="min-h-10 flex-none px-3">{e}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="Conjunt" className="pt-4"><Conjunt fases={fases} /></TabsContent>
        <TabsContent value="Avisos" className="pt-4"><Avisos /></TabsContent>
        <TabsContent value="Adequació" className="pt-4"><Adequacio fases={fases} /></TabsContent>
        <TabsContent value="Invitacions" className="pt-4"><Invitacions fases={fases} /></TabsContent>
      </Tabs>
    </div>
  );
}
