import { obres } from "@/lib/data";
import { eur, eurPrecise, num, pct } from "@/lib/format";

export type CapitolPreu = "Estructura" | "Tancaments" | "Instal·lacions" | "Acabats";

export const capitolsPreu: CapitolPreu[] = ["Estructura", "Tancaments", "Instal·lacions", "Acabats"];

export type Element = {
  id: string;
  nom: string;
  unitat: string;
  capitol: CapitolPreu;
  industrials: string[];
};

export type PreuTancat = {
  data: string;
  obraId: string;
  obra: string;
  industrial: string;
  capObra: string;
  preu: number;
  volum: number;
};

type Def = {
  id: string;
  nom: string;
  unitat: string;
  capitol: CapitolPreu;
  industrials: { nom: string; factor: number }[];
  obres: string[];
  base: number;
  deriva: number;
  dispersio: number;
  volum: [number, number];
  descompte: number;
  previst: { obraId: string; mes: string; volum: number }[];
};

const defs: Def[] = [
  {
    id: "formigo-ha25",
    nom: "Formigó HA-25",
    unitat: "m³",
    capitol: "Estructura",
    industrials: [
      { nom: "Formigons Andorra", factor: 0.97 },
      { nom: "Prefabricats Valira", factor: 1.02 },
      { nom: "Ciments del Pirineu", factor: 1.06 },
    ],
    obres: ["escola-escaldes", "hotel-pas", "nau-santa-coloma", "aixovall"],
    base: 90,
    deriva: 0.002,
    dispersio: 0.025,
    volum: [40, 260],
    descompte: 0.045,
    previst: [
      { obraId: "aixovall", mes: "2026-11", volum: 140 },
      { obraId: "nau-santa-coloma", mes: "2026-11", volum: 60 },
      { obraId: "placa-major", mes: "2026-12", volum: 420 },
      { obraId: "placa-major", mes: "2027-01", volum: 560 },
      { obraId: "placa-major", mes: "2027-02", volum: 480 },
    ],
  },
  {
    id: "acer-b500s",
    nom: "Acer B500S",
    unitat: "kg",
    capitol: "Estructura",
    industrials: [
      { nom: "Ferros Lòria", factor: 0.98 },
      { nom: "Armadures Segre", factor: 1.05 },
    ],
    obres: ["escola-escaldes", "hotel-pas", "nau-santa-coloma", "aixovall"],
    base: 1.17,
    deriva: -0.001,
    dispersio: 0.03,
    volum: [8_000, 45_000],
    descompte: 0.03,
    previst: [
      { obraId: "aixovall", mes: "2026-11", volum: 9_000 },
      { obraId: "placa-major", mes: "2026-12", volum: 38_000 },
      { obraId: "placa-major", mes: "2027-01", volum: 52_000 },
      { obraId: "placa-major", mes: "2027-02", volum: 44_000 },
    ],
  },
  {
    id: "encofrat",
    nom: "Encofrat de forjat",
    unitat: "m²",
    capitol: "Estructura",
    industrials: [
      { nom: "Encofrats Pirineu", factor: 0.96 },
      { nom: "Auxiliars Valira", factor: 1.05 },
    ],
    obres: ["escola-escaldes", "nau-santa-coloma", "aixovall"],
    base: 27,
    deriva: 0.0015,
    dispersio: 0.035,
    volum: [300, 1_800],
    descompte: 0.04,
    previst: [
      { obraId: "aixovall", mes: "2026-11", volum: 600 },
      { obraId: "placa-major", mes: "2026-12", volum: 2_200 },
      { obraId: "placa-major", mes: "2027-01", volum: 2_600 },
      { obraId: "placa-major", mes: "2027-02", volum: 2_100 },
    ],
  },
  {
    id: "bloc-formigo",
    nom: "Bloc de formigó 20 cm",
    unitat: "m²",
    capitol: "Tancaments",
    industrials: [
      { nom: "Prefabricats Valira", factor: 0.97 },
      { nom: "Materials Sant Julià", factor: 1.04 },
    ],
    obres: ["escola-escaldes", "hotel-pas", "nau-santa-coloma", "aixovall"],
    base: 31,
    deriva: 0.0015,
    dispersio: 0.03,
    volum: [200, 900],
    descompte: 0.035,
    previst: [
      { obraId: "aixovall", mes: "2026-11", volum: 420 },
      { obraId: "nau-santa-coloma", mes: "2026-11", volum: 160 },
      { obraId: "aixovall", mes: "2026-12", volum: 380 },
      { obraId: "placa-major", mes: "2027-02", volum: 300 },
    ],
  },
  {
    id: "fusteria-alumini",
    nom: "Fusteria exterior d'alumini",
    unitat: "m²",
    capitol: "Tancaments",
    industrials: [
      { nom: "Tancaments Pirineus", factor: 0.97 },
      { nom: "Aluminis Ordino", factor: 1.0 },
      { nom: "Fusteria Escaldes", factor: 1.05 },
    ],
    obres: ["escola-escaldes", "hotel-pas", "nau-santa-coloma", "aixovall"],
    base: 398,
    deriva: 0.002,
    dispersio: 0.03,
    volum: [80, 420],
    descompte: 0.04,
    previst: [
      { obraId: "aixovall", mes: "2026-12", volum: 260 },
      { obraId: "aixovall", mes: "2027-01", volum: 180 },
    ],
  },
  {
    id: "electrica-habitatge",
    nom: "Instal·lació elèctrica habitatge",
    unitat: "u",
    capitol: "Instal·lacions",
    industrials: [
      { nom: "Instal·lacions Gil", factor: 0.98 },
      { nom: "Electricitat Massana", factor: 1.05 },
    ],
    obres: ["hotel-pas", "aixovall"],
    base: 6_700,
    deriva: 0.0015,
    dispersio: 0.025,
    volum: [4, 24],
    descompte: 0.03,
    previst: [
      { obraId: "aixovall", mes: "2027-01", volum: 12 },
      { obraId: "aixovall", mes: "2027-02", volum: 12 },
    ],
  },
  {
    id: "fontaneria-habitatge",
    nom: "Fontaneria habitatge",
    unitat: "u",
    capitol: "Instal·lacions",
    industrials: [
      { nom: "Fontaneria La Massana", factor: 0.98 },
      { nom: "Instal·lacions Gil", factor: 1.03 },
    ],
    obres: ["hotel-pas", "aixovall"],
    base: 4_800,
    deriva: 0.0015,
    dispersio: 0.025,
    volum: [4, 24],
    descompte: 0.03,
    previst: [
      { obraId: "aixovall", mes: "2026-12", volum: 12 },
      { obraId: "aixovall", mes: "2027-01", volum: 12 },
    ],
  },
  {
    id: "clima-aerotermia",
    nom: "Clima per aerotèrmia",
    unitat: "u",
    capitol: "Instal·lacions",
    industrials: [
      { nom: "Clima Valira", factor: 0.97 },
      { nom: "Climatització Canillo", factor: 1.06 },
    ],
    obres: ["escola-escaldes", "hotel-pas", "aixovall"],
    base: 9_300,
    deriva: 0.002,
    dispersio: 0.03,
    volum: [4, 24],
    descompte: 0.05,
    previst: [{ obraId: "aixovall", mes: "2027-01", volum: 24 }],
  },
  {
    id: "rajola-porcellanica",
    nom: "Rajola porcellànica",
    unitat: "m²",
    capitol: "Acabats",
    industrials: [
      { nom: "Ceràmiques Encamp", factor: 0.96 },
      { nom: "Revestiments Andorra", factor: 1.04 },
      { nom: "Importacions Rossell", factor: 1.1 },
    ],
    obres: ["escola-escaldes", "hotel-pas", "aixovall"],
    base: 41,
    deriva: 0.0015,
    dispersio: 0.04,
    volum: [300, 1_400],
    descompte: 0.06,
    previst: [
      { obraId: "aixovall", mes: "2026-12", volum: 900 },
      { obraId: "aixovall", mes: "2027-01", volum: 1_100 },
      { obraId: "aixovall", mes: "2027-02", volum: 700 },
    ],
  },
  {
    id: "cuina-equipada",
    nom: "Cuina equipada",
    unitat: "u",
    capitol: "Acabats",
    industrials: [
      { nom: "Cuines Andorra", factor: 0.96 },
      { nom: "Mobles Encamp", factor: 1.06 },
    ],
    obres: ["hotel-pas", "aixovall"],
    base: 11_400,
    deriva: 0.002,
    dispersio: 0.03,
    volum: [4, 24],
    descompte: 0.07,
    previst: [{ obraId: "aixovall", mes: "2027-02", volum: 24 }],
  },
];

function mesos(inici: string, n: number) {
  const [y, m] = inici.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const t = y * 12 + (m - 1) + i;
    return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
  });
}

export const HISTORIC = mesos("2025-01", 22);
export const PREVISIO = mesos("2026-11", 4);
const INICI_6M = "2026-05";
const INICI_12M = "2025-11";

const MESOS_CA = ["gen", "febr", "març", "abr", "maig", "juny", "jul", "ag", "set", "oct", "nov", "des"];

// Manual labels keep server and client renders identical (no ICU differences).
export function mesLabel(ym: string) {
  const [y, m] = ym.split("-");
  return `${MESOS_CA[Number(m) - 1]} ${y.slice(2)}`;
}

const fases: Record<CapitolPreu, [number, number]> = {
  Estructura: [0, 0.6],
  Tancaments: [0.3, 0.8],
  "Instal·lacions": [0.35, 0.9],
  Acabats: [0.55, 1],
};

// Each cap d'obra negotiates alone, so who closes the deal moves the price.
const capFactor: Record<string, number> = { "Jordi Vidal": 1.035, "Anna Puig": 0.985 };
const capPesos: Record<string, number[]> = {
  "Anna Puig": [0.6, 0.3, 0.1],
  "Jordi Vidal": [0.2, 0.35, 0.45],
};

function rng(seed: string) {
  let a = [...seed].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const absMes = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + m - 1;
};

function arrodonirPreu(p: number, base: number) {
  if (base < 5) return Math.round(p * 100) / 100;
  if (base < 1000) return Math.round(p * 2) / 2;
  return Math.round(p / 10) * 10;
}

function arrodonirVolum(v: number, unitat: string) {
  if (unitat === "kg") return Math.round(v / 100) * 100;
  if (unitat === "m³") return Math.round(v / 5) * 5;
  if (unitat === "m²") return Math.round(v / 10) * 10;
  return Math.round(v);
}

function generar(def: Def): PreuTancat[] {
  const rand = rng(def.id);
  const industrials = [...def.industrials].sort((a, b) => a.factor - b.factor);
  const [lo, hi] = fases[def.capitol];
  const out: PreuTancat[] = [];

  HISTORIC.forEach((mes, i) => {
    for (const obraId of def.obres) {
      const obra = obres.find((o) => o.id === obraId);
      if (!obra) continue;
      const inici = absMes(obra.inici.slice(0, 7));
      const fi = absMes(obra.fi.slice(0, 7));
      const f = (absMes(mes) - inici) / Math.max(1, fi - inici);
      if (f < lo || f > hi) continue;

      let n = rand() < 0.62 ? 1 : 0;
      if (def.capitol === "Estructura" && rand() < 0.3) n++;
      for (let k = 0; k < n; k++) {
        const pesos = (capPesos[obra.capObra] ?? [0.45, 0.35, 0.2]).slice(0, industrials.length);
        const total = pesos.reduce((s, w) => s + w, 0);
        let r = rand() * total;
        const idx = Math.max(0, pesos.findIndex((w) => (r -= w) < 0));
        const ind = industrials[idx];
        const soroll = 1 + (rand() * 2 - 1) * def.dispersio;
        const preu =
          def.base * (1 + def.deriva * i) * ind.factor * (capFactor[obra.capObra] ?? 1) * soroll;
        const volum = def.volum[0] + rand() * (def.volum[1] - def.volum[0]);
        const dia = String(3 + Math.floor(rand() * 24)).padStart(2, "0");
        out.push({
          data: `${mes}-${dia}`,
          obraId,
          obra: obra.nom,
          industrial: ind.nom,
          capObra: obra.capObra,
          preu: arrodonirPreu(preu, def.base),
          volum: arrodonirVolum(volum, def.unitat),
        });
      }
    }
  });

  return out.sort((a, b) => b.data.localeCompare(a.data));
}

const tancats = new Map(defs.map((d) => [d.id, generar(d)]));

function mediana(xs: number[]) {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const mitjana = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);

export const elements: Element[] = defs.map((d) => ({
  id: d.id,
  nom: d.nom,
  unitat: d.unitat,
  capitol: d.capitol,
  industrials: d.industrials.map((i) => i.nom),
}));

export function getElement(id: string) {
  return elements.find((e) => e.id === id);
}

export function preusTancats(id: string): PreuTancat[] {
  return tancats.get(id) ?? [];
}

export type RankingIndustrial = {
  industrial: string;
  preuMitja: number;
  ultimPreu: number;
  ultimaData: string;
  nObres: number;
  tancaments: number;
};

/** Industrials ranked by average closed price over the last 12 months, cheapest first. */
export function rankingIndustrials(id: string): RankingIndustrial[] {
  const recents = preusTancats(id).filter((p) => p.data >= INICI_12M);
  const per = new Map<string, PreuTancat[]>();
  for (const p of recents) per.set(p.industrial, [...(per.get(p.industrial) ?? []), p]);
  return [...per.entries()]
    .map(([industrial, ps]) => ({
      industrial,
      preuMitja: mitjana(ps.map((p) => p.preu)),
      ultimPreu: ps[0].preu,
      ultimaData: ps[0].data,
      nObres: new Set(ps.map((p) => p.obraId)).size,
      tancaments: ps.length,
    }))
    .sort((a, b) => a.preuMitja - b.preuMitja);
}

export type ResumElement = Element & {
  ultimPreu: number;
  ultimaData: string;
  ultimIndustrial: string;
  mediana12: number;
  referencia: number;
  rang: [number, number];
  tancaments6: number;
  tendencia: number | null;
  millorIndustrial: string;
  millorPreu: number;
  nObres: number;
  sobrecost12: number;
  agrupar: {
    volum: number;
    nObres: number;
    descompte: number;
    preuObjectiu: number;
    estalvi: number;
    files: { obraId: string; obra: string; mesos: string[]; volum: number }[];
  };
};

function resumir(def: Def): ResumElement {
  const ps = preusTancats(def.id);
  const ult6 = ps.filter((p) => p.data >= INICI_6M);
  const ant6 = ps.filter((p) => p.data >= INICI_12M && p.data < INICI_6M);
  const ult12 = ps.filter((p) => p.data >= INICI_12M);
  const base6 = ult6.length ? ult6 : ult12;
  const referencia = mediana(base6.map((p) => p.preu));
  const anterior = mediana(ant6.map((p) => p.preu));
  const ranking = rankingIndustrials(def.id);
  const millor = ranking[0];

  const perObra = new Map<string, { mesos: string[]; volum: number }>();
  for (const v of def.previst) {
    const r = perObra.get(v.obraId) ?? { mesos: [], volum: 0 };
    perObra.set(v.obraId, { mesos: [...r.mesos, v.mes], volum: r.volum + v.volum });
  }
  const files = [...perObra.entries()].map(([obraId, r]) => ({
    obraId,
    obra: obres.find((o) => o.id === obraId)?.nom ?? obraId,
    ...r,
  }));
  const volum = files.reduce((s, f) => s + f.volum, 0);

  return {
    id: def.id,
    nom: def.nom,
    unitat: def.unitat,
    capitol: def.capitol,
    industrials: def.industrials.map((i) => i.nom),
    ultimPreu: ps[0]?.preu ?? 0,
    ultimaData: ps[0]?.data ?? "",
    ultimIndustrial: ps[0]?.industrial ?? "",
    mediana12: mediana(ult12.map((p) => p.preu)),
    referencia,
    rang: [Math.min(...base6.map((p) => p.preu)), Math.max(...base6.map((p) => p.preu))],
    tancaments6: base6.length,
    tendencia: ult6.length && ant6.length ? ((referencia - anterior) / anterior) * 100 : null,
    millorIndustrial: millor?.industrial ?? "",
    millorPreu: millor?.preuMitja ?? 0,
    nObres: new Set(ult12.map((p) => p.obraId)).size,
    sobrecost12: millor
      ? ult12.reduce((s, p) => s + Math.max(0, p.preu - millor.preuMitja) * p.volum, 0)
      : 0,
    agrupar: {
      volum,
      nObres: files.length,
      descompte: def.descompte,
      preuObjectiu: referencia * (1 - def.descompte),
      estalvi: volum * referencia * def.descompte,
      files,
    },
  };
}

export const resumPreus: ResumElement[] = defs.map(resumir);

export function resumElement(id: string) {
  return resumPreus.find((r) => r.id === id);
}

export const estalviAgrupantTotal = resumPreus.reduce((s, r) => s + r.agrupar.estalvi, 0);
export const sobrecostTotal12 = resumPreus.reduce((s, r) => s + r.sobrecost12, 0);
export const totalTancaments = defs.reduce((s, d) => s + preusTancats(d.id).length, 0);
export const totalIndustrials = new Set(defs.flatMap((d) => d.industrials.map((i) => i.nom))).size;

/** Median closed price per month, for sparklines. */
export function serieMensual(id: string): (number | null)[] {
  const ps = preusTancats(id);
  return HISTORIC.map((mes) => {
    const xs = ps.filter((p) => p.data.startsWith(mes)).map((p) => p.preu);
    return xs.length ? mediana(xs) : null;
  });
}

/** Average closed price per month and industrial; keys are `ind0..n` in ranking order. */
export function seriePerIndustrial(id: string) {
  const ps = preusTancats(id);
  const industrials = rankingIndustrials(id).map((r, i) => ({ key: `ind${i}`, nom: r.industrial }));
  const resta = [...new Set(ps.map((p) => p.industrial))].filter(
    (nom) => !industrials.some((i) => i.nom === nom)
  );
  for (const nom of resta) industrials.push({ key: `ind${industrials.length}`, nom });
  const rows = HISTORIC.map((mes) => {
    const row: Record<string, string | number | null> = { mes, label: mesLabel(mes) };
    for (const ind of industrials) {
      const xs = ps.filter((p) => p.data.startsWith(mes) && p.industrial === ind.nom).map((p) => p.preu);
      row[ind.key] = xs.length ? Math.round(mitjana(xs) * 100) / 100 : null;
    }
    return row;
  });
  return { rows, industrials };
}

export const preu = (n: number) => (n < 1000 ? eurPrecise(n) : eur(n));
export const volumLabel = (n: number, unitat: string) => `${num(n)} ${unitat}`;
export const pctSigne = (n: number) => `${n > 0 ? "+" : ""}${pct(n)}`;

export function mesosLabel(ms: string[]) {
  if (ms.length === 0) return "";
  const s = [...ms].sort();
  return s.length === 1 ? mesLabel(s[0]) : `${mesLabel(s[0])} – ${mesLabel(s[s.length - 1])}`;
}
