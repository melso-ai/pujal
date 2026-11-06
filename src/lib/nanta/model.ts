// Nanta Alta study: types and pure helpers. No imports, so scripts can load it directly.
export type Fase = "I" | "II";
export type Casa = { n: number; t: number; o: string; m2: number; oldT: string; oldM2: number; poly: number[][] };
export type Partida = {
  c: string;
  u: string;
  n: string;
  s: "phase" | "type" | "ext";
  q: Record<string, number> | number;
  f: string[];
  sp: string | null;
  p: "S" | "C" | null;
  g: "arch" | "inst" | null;
  src: "arch" | "inst" | "ext";
  ch: string;
  chn: string;
  sub: string;
};
export type Avis = { id: string; t: string; d: string; ev: string[]; a: string };
export type Complementaria = { c: string; w: string; s: string };
export type NantaData = {
  houses: Casa[];
  types: Record<string, { m2: number; arch: string; root: string; total: number }>;
  rows: Partida[];
  famNames: string[];
  avisos: Avis[];
  compl: Complementaria[];
  ch: Record<string, Record<string, number>>;
  proj: number;
  mpx: number;
  view: number[];
};
export type Linia = { r: Partida; idx: number; q: number; loc: string };
export type Seccio = { titol: string; linies: Linia[] };
export type FasePer = Record<number, Fase>;

export const TIPUS = [1, 2, 3, 4, 5];
export const FASES: Fase[] = ["I", "II"];
export const proposta = (houses: Casa[]): FasePer => Object.fromEntries(houses.map((h) => [h.n, h.n <= 13 ? "I" : "II"]));

const n2 = (x: number) => x.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const llista = (cases: Casa[]) => cases.map((h) => String(h.n).padStart(2, "0") + (h.o ? ` (${h.o})` : "")).join(", ");
const ordre = (r: Partida) => ({ arch: 0, inst: 1, ext: 2 })[r.src];

/** Sections of the phase budget, in offer order. Without a family it is the whole phase (TOTS). */
export function seccions(d: NantaData, fases: FasePer, fase: Fase, familia?: string): Seccio[] {
  const cases = d.houses.filter((h) => fases[h.n] === fase);
  if (!cases.length) return [];
  const sel = d.rows.map((r, idx) => ({ r, idx })).filter(({ r }) => !familia || r.f.includes(familia));
  const out: Seccio[] = [];
  const pre = sel.filter(({ r }) => r.s === "phase").map(({ r, idx }) => ({ r, idx, q: 1, loc: `Fase ${fase}. 1 per fase (el BC3 la repeteix a cada habitatge)` }));
  if (pre.length) out.push({ titol: `PRELIMINARS DE LA FASE ${fase}`, linies: pre });
  for (const t of TIPUS) {
    const grup = cases.filter((h) => h.t === t);
    if (!grup.length) continue;
    const linies: Linia[] = [];
    for (const { r, idx } of sel) {
      if (r.s !== "type") continue;
      const q = (r.q as Record<string, number>)[t] ?? 0;
      if (!q) continue;
      let loc = q <= 0.001 ? `Tipus ${t}. Revisar: quantitat simbòlica al BC3` : `Tipus ${t}. ${n2(q)} per habitatge x ${grup.length}`;
      if (r.g === "arch") loc += ". Revisar: també a instal·lacions";
      if (r.g === "inst") loc += ". Revisar: també a arquitectura";
      linies.push({ r, idx, q: q * grup.length, loc });
    }
    if (linies.length) {
      linies.sort((a, b) => ordre(a.r) - ordre(b.r) || a.r.ch.localeCompare(b.r.ch));
      out.push({ titol: `TIPUS ${t} · ${grup.length} ${grup.length === 1 ? "habitatge" : "habitatges"}: ${llista(grup)}`, linies });
    }
  }
  const share = cases.length / d.houses.length;
  const ext = sel.filter(({ r }) => r.s === "ext").map(({ r, idx }) => ({ r, idx, q: Math.round((r.q as number) * share * 100) / 100, loc: `Part proporcional ${cases.length}/${d.houses.length} de ${n2(r.q as number)}. Ajustar amb DG.U` }));
  if (ext.length) out.push({ titol: "EXTERIORS I URBANITZACIÓ", linies: ext });
  return out;
}

/** Smallest circle through a set of points (for crane reach). */
export function cercleMinim(pts: number[][]): { x: number; y: number; r: number } | null {
  let c: { x: number; y: number; r: number } | null = null;
  const dins = (p: number[], k: { x: number; y: number; r: number } | null) => !!k && Math.hypot(p[0] - k.x, p[1] - k.y) <= k.r + 1e-6;
  const de2 = (a: number[], b: number[]) => ({ x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, r: Math.hypot(a[0] - b[0], a[1] - b[1]) / 2 });
  const de3 = (a: number[], b: number[], k: number[]) => {
    const d = 2 * (a[0] * (b[1] - k[1]) + b[0] * (k[1] - a[1]) + k[0] * (a[1] - b[1]));
    if (Math.abs(d) < 1e-9) return de2(a, b);
    const s = (p: number[]) => p[0] * p[0] + p[1] * p[1];
    const x = (s(a) * (b[1] - k[1]) + s(b) * (k[1] - a[1]) + s(k) * (a[1] - b[1])) / d;
    const y = (s(a) * (k[0] - b[0]) + s(b) * (a[0] - k[0]) + s(k) * (b[0] - a[0])) / d;
    return { x, y, r: Math.hypot(a[0] - x, a[1] - y) };
  };
  for (let i = 0; i < pts.length; i++) {
    if (dins(pts[i], c)) continue;
    c = { x: pts[i][0], y: pts[i][1], r: 0 };
    for (let j = 0; j < i; j++) {
      if (dins(pts[j], c)) continue;
      c = de2(pts[i], pts[j]);
      for (let k = 0; k < j; k++) {
        if (dins(pts[k], c)) continue;
        c = de3(pts[i], pts[j], pts[k]);
      }
    }
  }
  return c;
}
