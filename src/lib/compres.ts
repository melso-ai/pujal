import type { Card } from "@/lib/assistant";
import { getObra } from "@/lib/data";
import { eur } from "@/lib/format";
import { industrials, nomFamilia, perFamilia, resumIndustrial, type FamiliaCodi } from "@/lib/industrials";
import {
  elements,
  mesLabel,
  preu,
  preusTancats,
  PREVISIO,
  rankingIndustrials,
  resumElement,
  volumLabel,
  type CapitolPreu,
} from "@/lib/preus";

export const MESOS = PREVISIO;
export const PERIODE = `${mesLabel(MESOS[0])} – ${mesLabel(MESOS[MESOS.length - 1])}`;

export type EstatCompra = "En execució" | "Adjudicada" | "Si s'adjudica";

export type ObraCompra = {
  id: string;
  nom: string;
  curt: string;
  capObra: string;
  estat: EstatCompra;
  href: string | null;
};

// Obres outside data.ts have no page yet, so they carry no href.
const definides: Omit<ObraCompra, "href">[] = [
  { id: "aixovall", nom: "Habitatges Aixovall", curt: "Aixovall", capObra: "Jordi Vidal", estat: "En execució" },
  { id: "placa-major", nom: "Edifici Plaça Major", curt: "Plaça Major", capObra: "Marc Riba", estat: "Adjudicada" },
  { id: "nau-santa-coloma", nom: "Nau industrial Santa Coloma", curt: "Nau Santa Coloma", capObra: "Anna Puig", estat: "En execució" },
  { id: "aparcament-prat-creu", nom: "Aparcament Prat de la Creu", curt: "Prat de la Creu", capObra: "Anna Puig", estat: "En execució" },
  { id: "edifici-fontaneda", nom: "Edifici Fontaneda", curt: "Fontaneda", capObra: "Pere Font", estat: "En execució" },
  { id: "habitatges-margineda", nom: "Habitatges La Margineda", curt: "La Margineda", capObra: "Laura Serra", estat: "Adjudicada" },
  { id: "habitatges-engordany", nom: "Habitatges Engordany", curt: "Engordany", capObra: "Pere Font", estat: "En execució" },
  { id: "hotel-arinsal", nom: "Rehabilitació Hotel Arinsal", curt: "Hotel Arinsal", capObra: "Jordi Vidal", estat: "En execució" },
  { id: "pedrasses", nom: "Xalets Les Pedrasses", curt: "Pedrasses", capObra: "Per assignar", estat: "Si s'adjudica" },
];

export const obresCompra: ObraCompra[] = definides.map((o) => ({
  ...o,
  nom: getObra(o.id)?.nom ?? o.nom,
  href: getObra(o.id) ? `/obres/${o.id}` : o.id === "pedrasses" ? "/pressupostos/pedrasses" : null,
}));

const obraCompra = (id: string) => obresCompra.find((o) => o.id === id)!;

type Mesos = [number, number, number, number];

// Volume per obra for nov, des, gen, febr.
const previsio: Record<string, Record<string, Mesos>> = {
  "formigo-ha25": {
    aixovall: [140, 0, 0, 0],
    "nau-santa-coloma": [60, 0, 0, 0],
    "placa-major": [0, 420, 560, 480],
    "aparcament-prat-creu": [320, 520, 640, 380],
    "edifici-fontaneda": [180, 220, 150, 0],
    "habitatges-margineda": [0, 0, 240, 310],
    pedrasses: [0, 0, 90, 60],
  },
  "acer-b500s": {
    aixovall: [9_000, 0, 0, 0],
    "placa-major": [0, 38_000, 52_000, 44_000],
    "aparcament-prat-creu": [27_000, 44_000, 55_000, 32_000],
    "edifici-fontaneda": [14_000, 18_000, 11_000, 0],
    "habitatges-margineda": [0, 0, 19_000, 24_000],
    pedrasses: [0, 0, 6_500, 4_000],
  },
  encofrat: {
    aixovall: [600, 0, 0, 0],
    "placa-major": [0, 2_200, 2_600, 2_100],
    "aparcament-prat-creu": [800, 1_400, 1_600, 900],
    "edifici-fontaneda": [900, 1_100, 700, 0],
    "habitatges-margineda": [0, 0, 800, 1_200],
    pedrasses: [0, 0, 380, 0],
  },
  "bloc-formigo": {
    aixovall: [420, 380, 0, 0],
    "nau-santa-coloma": [160, 0, 0, 0],
    "placa-major": [0, 0, 0, 300],
    "edifici-fontaneda": [0, 0, 280, 340],
    "hotel-arinsal": [0, 220, 180, 0],
    pedrasses: [0, 0, 0, 240],
  },
  "fusteria-alumini": {
    aixovall: [0, 260, 180, 0],
    "hotel-arinsal": [0, 0, 140, 120],
    "edifici-fontaneda": [0, 0, 0, 160],
  },
  "electrica-habitatge": {
    aixovall: [0, 0, 12, 12],
    "habitatges-engordany": [8, 8, 0, 0],
  },
  "fontaneria-habitatge": {
    aixovall: [0, 12, 12, 0],
    "habitatges-engordany": [8, 8, 0, 0],
  },
  "clima-aerotermia": {
    aixovall: [0, 0, 24, 0],
  },
  "rajola-porcellanica": {
    aixovall: [0, 900, 1_100, 700],
    "habitatges-engordany": [640, 520, 0, 0],
    "hotel-arinsal": [0, 0, 0, 480],
  },
  "cuina-equipada": {
    aixovall: [0, 0, 0, 24],
  },
};

// Same mapping as industrials.ts, which keeps it private.
const familiaElement: Record<string, FamiliaCodi> = {
  "formigo-ha25": "MAT.02",
  "acer-b500s": "MAT.08",
  encofrat: "MAT.13",
  "bloc-formigo": "MAT.06",
  "fusteria-alumini": "SUB.16",
  "electrica-habitatge": "IND.01",
  "fontaneria-habitatge": "IND.02",
  "clima-aerotermia": "IND.03",
  "rajola-porcellanica": "MAT.07",
  "cuina-equipada": "SUB.25",
};

export type Demanda = {
  obra: ObraCompra;
  mesos: number[];
  volum: number;
  siAdjudica: boolean;
};

export type Candidat = {
  id: string;
  nom: string;
  preuMitja: number | null;
  nObres: number;
  tancaments: number;
  pedrasses: boolean;
};

export type Oportunitat = {
  id: string;
  nom: string;
  unitat: string;
  capitol: CapitolPreu;
  familia: FamiliaCodi;
  familiaNom: string;
  demanda: Demanda[];
  perMes: number[];
  volum: number;
  volumSiAdjudica: number;
  nObres: number;
  referencia: number;
  millorHistoric: { preu: number; data: string; industrial: string; obra: string };
  descompte: number;
  ancora: { nom: string; preu: number };
  preuObjectiu: number;
  importReferencia: number;
  estalvi: number;
  estalviSiAdjudica: number;
  candidats: Candidat[];
  agrupable: boolean;
};

function candidats(elementId: string, familia: FamiliaCodi): Candidat[] {
  const ranking = rankingIndustrials(elementId);
  return perFamilia(familia)
    .map((ind) => {
      const r = ranking.find((x) => x.industrial === ind.nom);
      const resum = resumIndustrial(ind, familia);
      return {
        id: ind.id,
        nom: ind.nom,
        preuMitja: r?.preuMitja ?? null,
        nObres: r?.nObres ?? resum.obres,
        tancaments: r?.tancaments ?? 0,
        pedrasses: resum.pedrasses,
      };
    })
    .sort(
      (a, b) =>
        (a.preuMitja ?? Infinity) - (b.preuMitja ?? Infinity) ||
        Number(b.pedrasses) - Number(a.pedrasses) ||
        b.nObres - a.nObres
    )
    .slice(0, 3);
}

function arrodonir(p: number) {
  if (p < 5) return Math.round(p * 100) / 100;
  if (p < 1000) return Math.round(p * 2) / 2;
  return Math.round(p / 10) * 10;
}

function construir(id: string): Oportunitat {
  const el = elements.find((e) => e.id === id)!;
  const resum = resumElement(id)!;
  const familia = familiaElement[id];
  const demanda = Object.entries(previsio[id] ?? {})
    .map(([obraId, mesos]) => {
      const obra = obraCompra(obraId);
      return { obra, mesos, volum: mesos.reduce((s, v) => s + v, 0), siAdjudica: obra.estat === "Si s'adjudica" };
    })
    .sort((a, b) => Number(a.siAdjudica) - Number(b.siAdjudica) || b.volum - a.volum);

  const confirmades = demanda.filter((d) => !d.siAdjudica);
  const volum = confirmades.reduce((s, d) => s + d.volum, 0);
  const volumSiAdjudica = demanda.filter((d) => d.siAdjudica).reduce((s, d) => s + d.volum, 0);
  const millor = preusTancats(id).reduce((a, b) => (b.preu < a.preu ? b : a));
  const { referencia, agrupar } = resum;
  const descompte = agrupar.descompte;
  const cands = candidats(id, familia);
  const ancoraInd = cands.find((c) => c.preuMitja !== null && c.preuMitja < referencia);
  const ancora = ancoraInd ? { nom: ancoraInd.nom, preu: ancoraInd.preuMitja! } : { nom: "referència", preu: referencia };
  // Pooling should beat the cheapest supplier we already use, but never undercut our best closed price.
  const preuObjectiu = Math.max(millor.preu, arrodonir(ancora.preu * (1 - descompte)));

  return {
    id,
    nom: el.nom,
    unitat: el.unitat,
    capitol: el.capitol,
    familia,
    familiaNom: nomFamilia(familia),
    demanda,
    perMes: MESOS.map((_, i) => confirmades.reduce((s, d) => s + d.mesos[i], 0)),
    volum,
    volumSiAdjudica,
    nObres: confirmades.length,
    referencia,
    millorHistoric: { preu: millor.preu, data: millor.data, industrial: millor.industrial, obra: millor.obra },
    descompte,
    ancora,
    preuObjectiu,
    importReferencia: volum * referencia,
    estalvi: volum * (referencia - preuObjectiu),
    estalviSiAdjudica: volumSiAdjudica * (referencia - preuObjectiu),
    candidats: cands,
    agrupable: confirmades.length >= 2,
  };
}

export const oportunitats: Oportunitat[] = elements.map((e) => construir(e.id)).sort((a, b) => b.estalvi - a.estalvi);

export const agrupables = oportunitats.filter((o) => o.agrupable);

export function getOportunitat(id: string) {
  return oportunitats.find((o) => o.id === id);
}

export const estalviTotal = agrupables.reduce((s, o) => s + o.estalvi, 0);
export const estalviSiAdjudica = agrupables.reduce((s, o) => s + o.estalviSiAdjudica, 0);
export const obresImplicades = new Set(
  agrupables.flatMap((o) => o.demanda.filter((d) => !d.siAdjudica).map((d) => d.obra.id))
).size;
export const volumFormigo = getOportunitat("formigo-ha25")?.volum ?? 0;

/** Chart rows per month, one key per obra (`o0..n`), Pedrasses last. */
export function seriePerObra(o: Oportunitat) {
  const series = o.demanda.map((d, i) => ({ key: `o${i}`, nom: d.obra.curt, siAdjudica: d.siAdjudica }));
  const rows = MESOS.map((mes, m) => {
    const row: Record<string, string | number | null> = { mes, label: mesLabel(mes) };
    o.demanda.forEach((d, i) => (row[`o${i}`] = d.mesos[m] || null));
    return row;
  });
  return { rows, series };
}

export type ComandaMarc = {
  codi: string;
  industrialId: string | null;
  industrial: string;
  concepte: string;
  elementId: string | null;
  unitat: string;
  preu: number;
  volum: number;
  consumit: number;
  inici: string;
  fi: string;
  obres: string[];
};

const idIndustrial = (nom: string) => industrials.find((i) => i.nom === nom)?.id ?? null;

export const comandesMarc: ComandaMarc[] = [
  {
    codi: "CM-26-003",
    industrial: "Àrids de la Valira",
    concepte: "Grava i sorra",
    unitat: "t",
    preu: 17.8,
    volum: 4_000,
    consumit: 3_120,
    inici: "2026-01",
    fi: "2026-12",
    obres: ["Aixovall", "Nau Santa Coloma", "Fontaneda"],
  },
  {
    codi: "CM-26-005",
    industrial: "Bombeigs Andorra",
    concepte: "Bombeig de formigó",
    unitat: "h",
    preu: 118,
    volum: 600,
    consumit: 248,
    inici: "2026-07",
    fi: "2027-06",
    obres: ["Aixovall", "Fontaneda", "Prat de la Creu"],
  },
  {
    codi: "CM-26-006",
    industrial: "Runes Andorra",
    concepte: "Contenidor de runa 7 m³",
    unitat: "u",
    preu: 165,
    volum: 420,
    consumit: 296,
    inici: "2026-03",
    fi: "2027-02",
    obres: ["Aixovall", "Nau Santa Coloma", "Hotel Pas", "Fontaneda", "Engordany"],
  },
].map((c) => ({ ...c, industrialId: idIndustrial(c.industrial), elementId: null }));

export const SEGUENT_CODI = "CM-26-007";

const llista = (xs: string[]) =>
  xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} i ${xs[xs.length - 1]}`;

export function calendari(o: Oportunitat) {
  return MESOS.map((m, i) => (o.perMes[i] ? `${mesLabel(m)}: ${volumLabel(o.perMes[i], o.unitat)}` : null))
    .filter(Boolean)
    .join(", ");
}

export function promptNegociar(o: Oportunitat) {
  const obres = o.demanda.filter((d) => !d.siAdjudica).map((d) => d.obra.nom);
  const extra = o.volumSiAdjudica
    ? ` Si s'adjudica Xalets Les Pedrasses, hi sumarem ${volumLabel(o.volumSiAdjudica, o.unitat)} més.`
    : "";
  const abast = o.nObres > 1 ? `agrupant ${o.nObres} obres de Pujal (${obres.join(", ")})` : `per a ${obres[0]}`;
  return `Redacta un sol correu a ${llista(o.candidats.map((c) => c.nom))} per negociar el subministrament de ${o.nom} ${abast}: ${volumLabel(o.volum, o.unitat)} entre ${PERIODE}. Calendari: ${calendari(o)}. Preu objectiu ${preu(o.preuObjectiu)}/${o.unitat} (referència actual ${preu(o.referencia)}/${o.unitat}). Demana preu per a tot el volum abans del 20 de novembre.${extra}`;
}

export function cardCompres(): Card {
  const top = agrupables.slice(0, 5);
  return {
    title: `Compres agrupades · ${eur(estalviTotal)} d'estalvi · ${PERIODE}`,
    rows: top.map((o) => ({
      label: o.nom,
      value: eur(o.estalvi),
      hint: `${o.nObres} obres · ${volumLabel(o.volum, o.unitat)} · ${preu(o.referencia)} → ${preu(o.preuObjectiu)}`,
    })),
    links: [
      { label: "Obrir compres", href: "/compres" },
      { label: `Obrir ${top[0].nom}`, href: `/compres/${top[0].id}` },
    ],
  };
}

export function cardOportunitat(id: string): Card | { error: string } {
  const o = getOportunitat(id);
  if (!o) return { error: `No existeix l'element ${id}. Elements: ${oportunitats.map((x) => x.id).join(", ")}` };
  return {
    title: `${o.nom} · ${volumLabel(o.volum, o.unitat)} · ${o.nObres} obres`,
    rows: [
      { label: "Estalvi agrupant", value: eur(o.estalvi), hint: PERIODE },
      { label: "Referència → objectiu", value: `${preu(o.referencia)} → ${preu(o.preuObjectiu)}`, hint: `${o.ancora.nom} −${(o.descompte * 100).toFixed(1)}%` },
      { label: "Millor històric", value: preu(o.millorHistoric.preu), hint: `${o.millorHistoric.industrial} · ${o.millorHistoric.obra}` },
      { label: "Calendari", value: calendari(o) },
      { label: "Candidats", value: o.candidats.map((c) => c.nom).join(", ") },
    ],
    links: [{ label: "Obrir", href: `/compres/${o.id}` }],
  };
}
