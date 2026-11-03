import { comparatiu } from "@/lib/data";
import {
  capitolsArquitectura,
  carpetes,
  comparatiuElectric,
  families,
  installacions,
  mapping,
  ofertes,
  partidesEstructura,
  projecte,
} from "@/lib/pedrasses";

export type FamiliaCodi = keyof typeof families;
export type OfertaPedrasses = (typeof ofertes)[number];

const suma = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0);
const extensio = (nom: string) => (nom.toLowerCase().endsWith(".xlsx") ? "Excel" : "PDF");

export const exemplePedrasses = {
  estudiId: projecte.id,
  nom: projecte.nom,
  descripcio: projecte.descripcio,
  arquitecte: projecte.arquitecte,
  enginyeria: projecte.enginyeria,
  lliurament: "2026-11-13",
};

export const zones = carpetes.map((c) => ({
  id: c.carpeta,
  nom: c.nom,
  carpeta: c.carpeta,
  fitxers: c.fitxers as number,
  exemples: [...c.exemples] as string[],
  industrials: "industrials" in c ? c.industrials : undefined,
  format: [...new Set(c.exemples.map(extensio))].sort().join(" · "),
}));

export const totals = {
  fitxers: suma(zones.map((z) => z.fitxers)),
  industrials: zones.find((z) => z.industrials)?.industrials ?? 0,
};

export const etapesRun = [
  { id: "lectura", titol: "Llegint documentació", durada: 1800 },
  { id: "partides", titol: "Estructurant partides", durada: 2600 },
  { id: "ofertes", titol: "Llegint ofertes", durada: 2400 },
  { id: "alertes", titol: "Alertes", durada: 2600 },
  { id: "sollicituds", titol: "Sol·licituds d'ofertes", durada: 2000 },
] as const;

export type EtapaId = (typeof etapesRun)[number]["id"];

// Each demo second stands for 20 s of real processing.
export const ESCALA_TEMPS = 20;

const installacionsH1 = suma(installacions.map((i) => i.h1));
const installacionsH2 = suma(installacions.map((i) => i.h2));
const arquitectura = suma(capitolsArquitectura.map((c) => c.partides));

export const partides = {
  arquitectura,
  capitolsArquitectura: capitolsArquitectura.length,
  estructura: partidesEstructura as number,
  installacionsH1,
  installacionsH2,
  total: arquitectura + partidesEstructura + installacionsH1 + installacionsH2,
};

export const grupsPartides = [
  { nom: "Arquitectura", partides: arquitectura, detall: `${capitolsArquitectura.length} capítols` },
  { nom: "Estructura", partides: partides.estructura, detall: "Pressupost estructura" },
  { nom: "Instal·lacions H1", partides: installacionsH1, detall: projecte.enginyeria },
  { nom: "Instal·lacions H2", partides: installacionsH2, detall: projecte.enginyeria },
];

export const mapejos = mapping.map((m) => ({
  original: m.text,
  origen: m.origen,
  codi: m.familia,
  partida: m.familiaNom,
}));

export const ofertesPerFamilia = (() => {
  const grups = new Map<FamiliaCodi, OfertaPedrasses[]>();
  for (const o of ofertes) {
    const codi = o.familia as FamiliaCodi;
    grups.set(codi, [...(grups.get(codi) ?? []), o]);
  }
  return grups;
})();

export const resumOfertes = {
  total: ofertes.length,
  families: ofertesPerFamilia.size,
  ambImport: ofertes.filter((o) => o.baseImposable !== null).length,
  excel: ofertes.filter((o) => o.format === "Excel").length,
  pdf: ofertes.filter((o) => o.format === "PDF").length,
};

// One offer per family, largest first: a concrete sample for the run.
export const ofertesMostra = [...ofertesPerFamilia.values()]
  .map((list) => list.reduce((a, b) => ((b.baseImposable ?? 0) > (a.baseImposable ?? 0) ? b : a)))
  .sort((a, b) => (b.baseImposable ?? 0) - (a.baseImposable ?? 0))
  .slice(0, 6);

const omesesImport = suma(comparatiuElectric.omeses.map((o) => o.import));
const efhysNormalitzat = comparatiuElectric.efhys.total + omesesImport;

export const electric = {
  habitatge: comparatiuElectric.habitatge,
  partidesAmidament: comparatiuElectric.partidesAmidament,
  besoli: comparatiuElectric.besoli,
  efhys: comparatiuElectric.efhys,
  omeses: comparatiuElectric.omeses,
  omesesImport,
  efhysNormalitzat,
  diferencia: efhysNormalitzat - comparatiuElectric.besoli.total,
  diferenciaPct: ((efhysNormalitzat - comparatiuElectric.besoli.total) / comparatiuElectric.besoli.total) * 100,
  perCapitol: comparatiuElectric.perCapitol.map((c) => ({
    ...c,
    capitol: c.capitol.replace(/^CAPÍTOL\s*/, ""),
    delta: c.efhys - c.besoli,
  })),
  omesesPerCapitol: [...new Set(comparatiuElectric.omeses.map((o) => o.capitol))].map((capitol) => {
    const linies = comparatiuElectric.omeses.filter((o) => o.capitol === capitol);
    return {
      capitol: capitol.replace(/^CAPÍTOL\s*/, ""),
      linies: linies.length,
      import: suma(linies.map((l) => l.import)),
    };
  }),
  omesesMajors: [...comparatiuElectric.omeses].sort((a, b) => b.import - a.import),
  linies: comparatiuElectric.linies
    .map((l) => ({ ...l, impacte: (l.efhys - l.besoli) * l.quantitat }))
    .sort((a, b) => Math.abs(b.impacte) - Math.abs(a.impacte)),
};

const pladur = ofertesPerFamilia.get("SUB.09") ?? [];
const importsPladur = pladur.flatMap((o) => (o.baseImposable === null ? [] : [o.baseImposable]));

export const alertaPladur = {
  codi: "SUB.09" as const,
  nom: families["SUB.09"],
  ofertes: [...pladur].sort((a, b) => (a.baseImposable ?? 0) - (b.baseImposable ?? 0)),
  min: Math.min(...importsPladur),
  max: Math.max(...importsPladur),
};

export const alertaInstallacions = {
  paquets: ofertesPerFamilia.get("IND.08") ?? [],
  perOfici: [...(ofertesPerFamilia.get("IND.01") ?? []), ...(ofertesPerFamilia.get("IND.02") ?? [])].filter(
    (o) => o.industrial !== "EFHYS"
  ),
};

const familiesEstructura: FamiliaCodi[] = ["MAT.02", "MAT.08", "MAT.13", "MAO.02", "MAO.03"];

export const familiesSenseOferta = familiesEstructura
  .filter((codi) => !ofertesPerFamilia.has(codi))
  .map((codi) => ({ codi, nom: families[codi] }));

const fitxerEstructura =
  zones.flatMap((z) => z.exemples).find((f) => f.includes("PRESS EST")) ?? "";

const terminiOfertes = new Date(exemplePedrasses.lliurament);
terminiOfertes.setUTCDate(terminiOfertes.getUTCDate() - 3);

export const correuExemple = {
  per: `Cartera Pujal · ${families["MAT.02"]}`,
  assumpte: `Sol·licitud d'oferta · ${projecte.nom} · ${families["MAT.02"]}`,
  adjunt: fitxerEstructura,
  cos: [
    "Bon dia,",
    `Us adjuntem el pressupost d'estructura de ${projecte.nom} (${projecte.descripcio.toLowerCase()}): ${partidesEstructura} partides de formigó, ferro i encofrats.`,
    `Ens podeu enviar preu i termini abans del ${terminiOfertes.toLocaleDateString("ca-AD", { day: "numeric", month: "long", timeZone: "UTC" })}?`,
    "Gràcies,\nJennifer · Construccions Pujal",
  ],
};

export const alertes = [
  {
    id: "electric",
    titol: `Electricitat ${electric.habitatge}: EFHYS omet ${electric.omeses.length} partides`,
    valor: `+${Math.round(electric.diferencia).toLocaleString("ca-AD")} €`,
  },
  {
    id: "pladur",
    titol: `${alertaPladur.codi} ${alertaPladur.nom}: ${alertaPladur.ofertes.length} ofertes amb abasts diferents`,
    valor: `×${(alertaPladur.max / alertaPladur.min).toFixed(1)}`,
  },
  {
    id: "installacions",
    titol: "Instal·lacions: paquet complet o per ofici",
    valor: `${alertaInstallacions.paquets.length} + ${alertaInstallacions.perOfici.length}`,
  },
  {
    id: "estructura",
    titol: `Estructura: ${partidesEstructura} partides sense cap oferta`,
    valor: "0 ofertes",
  },
] as const;

export type Cobertura = {
  codi: FamiliaCodi;
  nom: string;
  ofertes: OfertaPedrasses[];
  min: number | null;
  max: number | null;
  millor: OfertaPedrasses | null;
  normalitzat: boolean;
  abastDiferent: boolean;
  avisos: string[];
};

export const cobertura: Cobertura[] = [...ofertesPerFamilia.entries()]
  .map(([codi, list]) => {
    const amb = list.filter((o) => o.baseImposable !== null);
    const imports = amb.map((o) => o.baseImposable as number);
    const abasts = [...new Set(list.map((o) => o.habitatges))];
    const sensImport = list.length - amb.length;
    const exclusions = suma(list.map((o) => o.exclusions.length));
    const normalitzat = codi === "IND.01";
    const besoli = list.find((o) => o.industrial.startsWith("Elèctrica Marcel Besolí"));
    const avisos = [
      abasts.length > 1 ? `Abast: ${abasts.join(" · ")}` : null,
      sensImport > 0 ? `${sensImport} sense import` : null,
      exclusions > 0 ? `${exclusions} exclusions` : null,
    ].filter((a): a is string => a !== null);
    return {
      codi,
      nom: families[codi],
      ofertes: [...list].sort((a, b) => (a.baseImposable ?? Infinity) - (b.baseImposable ?? Infinity)),
      min: imports.length ? Math.min(...imports) : null,
      max: imports.length ? Math.max(...imports) : null,
      millor: normalitzat && besoli ? besoli : amb.length ? amb.reduce((a, b) => ((b.baseImposable as number) < (a.baseImposable as number) ? b : a)) : null,
      normalitzat,
      abastDiferent: abasts.length > 1,
      avisos,
    };
  })
  .sort((a, b) => a.codi.localeCompare(b.codi));

export const capitolsPedrasses = capitolsArquitectura;
export const installacionsPedrasses = installacions;

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

// Mock studies: Pujal's partides price the complete unit (pumped concrete, placed steel, glazed window).
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
  const ofertesNorm = c.ofertes.map((o) => {
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
  const millor = ofertesNorm.reduce((a, b) => (b.normalitzat < a.normalitzat ? b : a));
  const mesBarataBrut = ofertesNorm.reduce((a, b) => (b.preu < a.preu ? b : a));
  return {
    ...c,
    nom: nomsPartida[c.partida] ?? c.descripcio,
    ofertes: ofertesNorm,
    millor: millor.industrial,
    mesBarataBrut: mesBarataBrut.industrial,
  };
});
