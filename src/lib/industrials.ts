import { contractes } from "@/lib/data";
import { families, ofertes } from "@/lib/pedrasses";
import { elements, preusTancats, type PreuTancat } from "@/lib/preus";

export type FamiliaCodi = keyof typeof families;
export type OfertaPedrasses = (typeof ofertes)[number];

export const grups = [
  { prefix: "IND", nom: "Instal·lacions" },
  { prefix: "SUB", nom: "Subcontractes" },
  { prefix: "MAT", nom: "Materials" },
  { prefix: "MAO", nom: "Mà d'obra" },
  { prefix: "MAQ", nom: "Maquinària" },
] as const;

export type Grup = (typeof grups)[number]["nom"];

export const codis = Object.keys(families) as FamiliaCodi[];

export const nomFamilia = (codi: string) => families[codi as FamiliaCodi] ?? codi;

export const grupDe = (codi: string): Grup =>
  grups.find((g) => codi.startsWith(g.prefix))?.nom ?? "Subcontractes";

// Structure families Pedrasses has no offer for yet.
export const SENSE_OFERTA_PEDRASSES: FamiliaCodi[] = ["MAT.02", "MAT.08", "MAT.13", "MAO.02", "MAO.03"];

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

const familiaContracte: Record<string, FamiliaCodi> = {
  Formigó: "MAT.02",
  Ferro: "MAT.08",
  Elèctrica: "IND.01",
  Clima: "IND.03",
  Fusteria: "SUB.16",
};

// Sample suppliers for families no study or closed price covers yet.
const mostra: { nom: string; families: FamiliaCodi[]; obres: number; desde: number }[] = [
  { nom: "Estructures Valira", families: ["MAO.02"], obres: 6, desde: 2014 },
  { nom: "Encofradors del Pirineu", families: ["MAO.02", "MAT.13"], obres: 3, desde: 2019 },
  { nom: "Paletes Sant Julià", families: ["MAO.03", "MAO.01"], obres: 9, desde: 2011 },
  { nom: "Obres Arinsal", families: ["MAO.03"], obres: 2, desde: 2022 },
  { nom: "Bombeigs Andorra", families: ["MAQ.02"], obres: 11, desde: 2012 },
  { nom: "Lloguers Encamp", families: ["MAQ.03"], obres: 7, desde: 2016 },
  { nom: "Àrids de la Valira", families: ["MAT.01"], obres: 10, desde: 2010 },
  { nom: "Runes Andorra", families: ["MAT.15"], obres: 12, desde: 2013 },
  { nom: "Micropilots Pirineu", families: ["SUB.03"], obres: 2, desde: 2020 },
  { nom: "Metàl·liques Ordino", families: ["SUB.22", "SUB.21"], obres: 4, desde: 2017 },
  { nom: "Façanes Tèrmiques", families: ["SUB.19"], obres: 3, desde: 2021 },
  { nom: "Enderrocs Valls", families: ["SUB.01", "SUB.02"], obres: 5, desde: 2015 },
];

export type Tancat = PreuTancat & { element: string; elementId: string; unitat: string; familia: FamiliaCodi };

export type Industrial = {
  id: string;
  nom: string;
  families: FamiliaCodi[];
  ofertes: OfertaPedrasses[];
  tancats: Tancat[];
  contractat: number;
  obres: string[];
  obresHistoric: number;
  desde: number | null;
  ultimContacte: string | null;
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function construir(): Industrial[] {
  const map = new Map<string, Industrial>();
  const get = (nom: string) => {
    let ind = map.get(nom);
    if (!ind) {
      ind = {
        id: slug(nom),
        nom,
        families: [],
        ofertes: [],
        tancats: [],
        contractat: 0,
        obres: [],
        obresHistoric: 0,
        desde: null,
        ultimContacte: null,
      };
      map.set(nom, ind);
    }
    return ind;
  };
  const afegirFamilia = (ind: Industrial, f: FamiliaCodi) => {
    if (!ind.families.includes(f)) ind.families.push(f);
  };

  for (const o of ofertes) {
    const ind = get(o.industrial);
    ind.ofertes.push(o);
    afegirFamilia(ind, o.familia);
  }
  for (const e of elements) {
    const familia = familiaElement[e.id];
    for (const t of preusTancats(e.id)) {
      const ind = get(t.industrial);
      ind.tancats.push({ ...t, element: e.nom, elementId: e.id, unitat: e.unitat, familia });
      afegirFamilia(ind, familia);
    }
  }
  for (const c of contractes) {
    const ind = get(c.industrial);
    ind.contractat += c.import;
    const familia = familiaContracte[c.familia];
    if (familia) afegirFamilia(ind, familia);
  }
  for (const m of mostra) {
    const ind = get(m.nom);
    m.families.forEach((f) => afegirFamilia(ind, f));
    ind.obresHistoric = m.obres;
    ind.desde = m.desde;
  }

  for (const ind of map.values()) {
    ind.tancats.sort((a, b) => b.data.localeCompare(a.data));
    ind.obres = [...new Set(ind.tancats.map((t) => t.obra))];
    ind.obresHistoric = Math.max(ind.obresHistoric, ind.obres.length);
    const dates = [...ind.ofertes.map((o) => o.data), ...ind.tancats.map((t) => t.data)].filter(Boolean);
    ind.ultimContacte = dates.sort().at(-1) ?? null;
    ind.families.sort();
  }
  return [...map.values()].sort((a, b) => a.nom.localeCompare(b.nom, "ca"));
}

export const industrials = construir();

export function getIndustrial(id: string) {
  return industrials.find((i) => i.id === id);
}

export function perFamilia(codi: string) {
  return industrials.filter((i) => i.families.includes(codi as FamiliaCodi));
}

export const familiesCobertes = codis.filter((c) => perFamilia(c).length > 0);

export const importOferta = (o: OfertaPedrasses): number | null => o.baseImposable ?? null;

// One line per supplier: the real offer wins over sample history.
export function resumIndustrial(ind: Industrial, familia?: string) {
  const ofertes = familia ? ind.ofertes.filter((o) => o.familia === familia) : ind.ofertes;
  const tancats = familia ? ind.tancats.filter((t) => t.familia === familia) : ind.tancats;
  const imports = ofertes.map(importOferta).filter((n): n is number => n !== null);
  return {
    ofertes: ofertes.length,
    millorOferta: imports.length ? Math.min(...imports) : null,
    tancats: tancats.length,
    obres: new Set(tancats.map((t) => t.obra)).size || ind.obresHistoric,
    pedrasses: ofertes.length > 0,
  };
}
