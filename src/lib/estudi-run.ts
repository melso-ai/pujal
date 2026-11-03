import {
  comparatiu,
  costPersonaMes,
  despesesGenerals,
  discrepancies,
  indirectesMensuals,
} from "@/lib/data";

export type Fitxer = { nom: string; mida: string; pagines?: number };
export type Carpeta = { id: string; nom: string; format: string; fitxers: Fitxer[] };

const planols: Fitxer[] = [
  ...Array.from({ length: 24 }, (_, i) => ({
    nom: `PL-${String(i + 1).padStart(2, "0")}_${["Emplaçament", "Fonaments", "Estructura", "Planta", "Alçats", "Seccions", "Instal·lacions", "Fusteria"][i % 8]}.pdf`,
    mida: `${(1.2 + ((i * 7) % 18) / 10).toFixed(1)} MB`,
    pagines: [4, 6, 5, 7, 4, 5, 6, 5][i % 8],
  })),
  { nom: "Canillo_planta_tipus.dwg", mida: "8,4 MB" },
  { nom: "Canillo_estructura.dwg", mida: "6,1 MB" },
];

export const exempleCanillo = {
  estudiId: "residencial-canillo",
  nom: "Residencial Canillo",
  arquitecte: "Estudi Riba Arquitectes",
  superficie: 5_200,
  lliurament: "2026-12-11",
  carpetes: [
    {
      id: "memoria",
      nom: "Memòria de qualitats",
      format: "PDF",
      fitxers: [
        { nom: "Memoria_qualitats_Canillo.pdf", mida: "4,2 MB", pagines: 38 },
        { nom: "Annex_acabats_i_cuines.pdf", mida: "2,8 MB", pagines: 12 },
        { nom: "Fitxes_tecniques_fusteria.pdf", mida: "1,6 MB", pagines: 8 },
      ],
    },
    {
      id: "amidaments",
      nom: "Amidaments",
      format: "Excel · BC3",
      fitxers: [
        { nom: "Amidaments_Canillo_v3.xlsx", mida: "1,1 MB" },
        { nom: "Pressupost_referencia.bc3", mida: "0,4 MB" },
      ],
    },
    { id: "planols", nom: "Plànols", format: "PDF · DWG", fitxers: planols },
  ] satisfies Carpeta[],
};

export const totals = {
  carpetes: exempleCanillo.carpetes.length,
  fitxers: exempleCanillo.carpetes.reduce((s, c) => s + c.fitxers.length, 0),
  pagines: exempleCanillo.carpetes.reduce(
    (s, c) => s + c.fitxers.reduce((p, f) => p + (f.pagines ?? 0), 0),
    0
  ),
};

export const etapesRun = [
  { id: "lectura", titol: "Llegint documentació", durada: 1800 },
  { id: "partides", titol: "Estructurant partides", durada: 2600 },
  { id: "creuament", titol: "Creuant amidaments amb plànols", durada: 1900 },
  { id: "preus", titol: "Preus de referència", durada: 2200 },
  { id: "ofertes", titol: "Sol·licituds d'ofertes", durada: 2100 },
  { id: "tancament", titol: "Full de tancament preliminar", durada: 1700 },
] as const;

export type EtapaId = (typeof etapesRun)[number]["id"];

// Each demo second stands for 20 s of real processing.
export const ESCALA_TEMPS = 20;

export const capitolsPujal = [
  { nom: "Estructura", partides: 58, families: ["Formigó", "Ferro", "Encofrat"] },
  { nom: "Instal·lacions", partides: 71, families: ["Elèctrica", "Fontaneria", "Clima"] },
  { nom: "Acabats", partides: 85, families: ["Fusteria", "Rajola", "Cuina", "Electrodomèstics"] },
];

export const totalPartidesRun = capitolsPujal.reduce((s, c) => s + c.partides, 0);

export const mapejos = [
  {
    original: "Formigó per a fonaments HA-25/B/20/IIa, abocat amb bomba",
    codi: "02.03",
    partida: "Formigó HA-25",
    confianca: 98,
  },
  {
    original: "Acer corrugat B 500 S en barres, inclòs tall i doblegat",
    codi: "02.07",
    partida: "Acer B500S",
    confianca: 97,
  },
  {
    original: "Encofrat recuperable de fusta per a mur de contenció",
    codi: "02.05",
    partida: "Encofrat murs",
    confianca: 94,
  },
  {
    original: "Fusteria exterior d'alumini RPT amb doble vidre",
    codi: "05.02",
    partida: "Fusteria exterior",
    confianca: 96,
  },
  {
    original: "Instal·lació elèctrica completa habitatge tipus (partida alçada)",
    codi: "04.01–04.03",
    partida: "Elèctrica · 3 partides",
    confianca: 84,
  },
  {
    original: "Cuina equipada segons memòria",
    codi: "05.11–05.12",
    partida: "Cuina + electrodomèstics",
    confianca: 76,
  },
];

export const discrepanciesRun = discrepancies;
export const impacteDiscrepancies = discrepancies.reduce((s, d) => s + d.impacte, 0);

export const preusRun = {
  ambPreu: 186,
  obresFont: 14,
  exemples: comparatiu.map((c) => ({
    partida: `${c.partida} ${c.descripcio}`,
    preu: c.preuRef,
    unitat: c.unitat,
    font: {
      "02.03": "Aixovall · oct. 2026 · Formigons Andorra",
      "02.07": "Santa Coloma · set. 2026 · Ferros Lòria",
      "05.02": "Escola Escaldes · maig 2026 · Aluminis Ordino",
    }[c.partida],
  })),
};

export const families = [
  { nom: "Formigó", industrials: 3 },
  { nom: "Ferro", industrials: 2 },
  { nom: "Encofrat", industrials: 2 },
  { nom: "Elèctrica", industrials: 3 },
  { nom: "Fontaneria", industrials: 2 },
  { nom: "Clima", industrials: 3 },
  { nom: "Fusteria", industrials: 3 },
  { nom: "Rajola", industrials: 2 },
  { nom: "Cuina", industrials: 3 },
];

export const totalIndustrials = families.reduce((s, f) => s + f.industrials, 0);
export const industrialsCartera = 16;

export const correuExemple = {
  per: "comercial@formigonsandorra.ad",
  assumpte: "Sol·licitud d'oferta · Residencial Canillo · Formigó",
  cos: [
    "Bon dia,",
    "Us adjuntem els amidaments de formigó de Residencial Canillo (5.200 m²): 1.840 m³ d'HA-25 i 310 m³ d'HA-30, bombejat.",
    "Ens podeu enviar preu i termini abans del 20 de novembre?",
    "Gràcies,\nJennifer · Construccions Pujal",
  ],
};

const MESOS = 18;
const PERSONES = 4;
const NET_OBJECTIU = 0.025;
const costDirecte = 5_240_000;
const indirectes =
  MESOS * indirectesMensuals.reduce((s, i) => s + i.import, 0) + PERSONES * MESOS * costPersonaMes;
const preuOferta = (costDirecte + indirectes) / (1 - despesesGenerals - NET_OBJECTIU);

export const tancamentRun = {
  mesos: MESOS,
  persones: PERSONES,
  costDirecte,
  indirectes,
  despesesGenerals: preuOferta * despesesGenerals,
  preuOferta,
  k: preuOferta / costDirecte,
  net: NET_OBJECTIU * 100,
};

type Ajust = { concepte: string; import: number };

export type OfertaRebuda = {
  industrial: string;
  format: string;
  rebut: string;
  original: string;
  confianca: number;
  preu: number;
  nota?: string;
  ajust?: Ajust;
};

// Pujal's partides price the complete unit (pumped concrete, placed steel, glazed window).
const lectures: Record<string, Omit<OfertaRebuda, "industrial" | "format" | "preu" | "nota">> = {
  "Formigons Andorra": {
    rebut: "2026-10-24",
    original: "HA-25/B/20/IIa · m3 · servit a obra",
    confianca: 98,
    ajust: { concepte: "Bombeig", import: 6 },
  },
  "Ciments del Pirineu": {
    rebut: "2026-10-27",
    original: "Hormigón HA-25 blanda árido 20 – m³",
    confianca: 95,
    ajust: { concepte: "Bombeig", import: 6 },
  },
  "Prefabricats Valira": {
    rebut: "2026-10-29",
    original: "Formigó estructural 25 N/mm² amb bomba",
    confianca: 91,
  },
  "Ferros Lòria": {
    rebut: "2026-10-25",
    original: "B500S Ø8–Ø25 · kg · tallat i doblegat",
    confianca: 97,
    ajust: { concepte: "Col·locació", import: 0.05 },
  },
  "Armadures Segre": {
    rebut: "2026-10-30",
    original: "Armadura elaborada i col·locada, acer B 500 S",
    confianca: 96,
  },
  "Aluminis Ordino": {
    rebut: "2026-10-28",
    original: "Tancament COR-70 RPT + vidre 4/16/4 baix emissiu",
    confianca: 94,
  },
  "Tancaments Pirineus": {
    rebut: "2026-10-31",
    original: "Finestra alumini RPT sèrie 70 (sense vidre)",
    confianca: 92,
    ajust: { concepte: "Vidre 4/16/4", import: 38 },
  },
  "Fusteria Escaldes": {
    rebut: "2026-10-26",
    original: "Ventana aluminio RPT con doble acristalamiento",
    confianca: 93,
  },
};

const nomsPartida: Record<string, string> = {
  "02.03": "Formigó HA-25 bombejat",
  "02.07": "Acer B500S col·locat",
  "05.02": "Fusteria exterior amb vidre",
};

export const comparatiuNormalitzat = comparatiu.map((c) => {
  const ofertes = c.ofertes.map((o) => {
    const lectura = lectures[o.industrial];
    const normalitzat = o.preu + (lectura?.ajust?.import ?? 0);
    return {
      ...lectura,
      industrial: o.industrial,
      format: o.format,
      preu: o.preu,
      nota: o.nota,
      normalitzat,
      delta: ((normalitzat - c.preuRef) / c.preuRef) * 100,
    };
  });
  const millor = ofertes.reduce((a, b) => (b.normalitzat < a.normalitzat ? b : a));
  const mesBarataBrut = ofertes.reduce((a, b) => (b.preu < a.preu ? b : a));
  return {
    ...c,
    nom: nomsPartida[c.partida] ?? c.descripcio,
    ofertes,
    millor: millor.industrial,
    mesBarataBrut: mesBarataBrut.industrial,
  };
});
