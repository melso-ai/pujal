import { contractes as base, obres } from "@/lib/data";
import { date } from "@/lib/format";
import { getIndustrial, industrials, type FamiliaCodi } from "@/lib/industrials";
import { projecte as pedrasses } from "@/lib/pedrasses";

export const AVUI = "2026-11-03";
export const DIES_PROPER = 30;
export const RETENCIO = 0.05;
export const IGI = 0.045;
export const EMPRESA = "Construccions Pujal";
export const SIGNANT = "Benito";

export type Tipus = "client" | "industrial";
export type Dies = 30 | 60 | 90;
export type Estat = "esborrany" | "enviat" | "signat";
export type EstatVisible = Estat | "caducat";

export const pagaments: { dies: Dies; clausula: "A" | "B" | "C" }[] = [
  { dies: 30, clausula: "A" },
  { dies: 60, clausula: "B" },
  { dies: 90, clausula: "C" },
];

export const clausula = (dies: Dies) => pagaments.find((p) => p.dies === dies)?.clausula ?? "B";

// Venciment presets, in months after the end of the obra.
export const terminis = [
  { mesos: 0, label: "Fi d'obra" },
  { mesos: 3, label: "+3 mesos" },
  { mesos: 6, label: "+6 mesos" },
] as const;

export const nomEstat: Record<EstatVisible, string> = {
  esborrany: "Esborrany",
  enviat: "Pendent de signatura",
  signat: "Signat",
  caducat: "Caducat",
};

export type Projecte = {
  id: string;
  num: string;
  nom: string;
  lloc: string;
  client: string;
  arquitecte: string;
  capObra: string | null;
  fi: string;
  importEstudi: number;
  href: string;
};

// Pedrasses is still an estudi: it keeps its number when won (estudi → guanyat → fases).
export const projectes: Projecte[] = [
  {
    id: pedrasses.id,
    num: "2624",
    nom: pedrasses.nom,
    lloc: "La Massana",
    client: pedrasses.client,
    arquitecte: pedrasses.arquitecte,
    capObra: null,
    fi: "2028-03-31",
    importEstudi: 2_450_000,
    href: `/pressupostos/${pedrasses.id}`,
  },
  ...[...obres]
    .sort((a, b) => b.obs.localeCompare(a.obs))
    .map((o) => ({
      id: o.id,
      num: o.obs.replace("OBS-", ""),
      nom: o.nom,
      lloc: o.lloc,
      client: o.client,
      arquitecte: o.arquitecte,
      capObra: o.capObra,
      fi: o.fi,
      importEstudi: o.importEstudi,
      href: `/obres/${o.id}`,
    })),
];

export const getProjecte = (id: string) => projectes.find((p) => p.id === id);

export type Contracte = {
  id: string;
  num: string;
  seq: number;
  tipus: Tipus;
  obra: string;
  contrapart: string;
  industrialId: string | null;
  familia: FamiliaCodi | null;
  import: number;
  pagament: Dies;
  retencio: boolean;
  venciment: string;
  estat: Estat;
  autor: string;
  creat: string;
  enviat: string | null;
  signat: string | null;
  executat: number;
};

type Llavor = {
  seq: number;
  contrapart?: string;
  familia?: FamiliaCodi;
  import: number;
  pagament: Dies;
  retencio: boolean;
  creat: string;
  enviat?: string;
  signat?: string;
  executat?: number;
  venciment?: string;
  autor?: string;
};

const familiaBase: Record<string, FamiliaCodi> = {
  Formigó: "MAT.02",
  Ferro: "MAT.08",
  Elèctrica: "IND.01",
  Clima: "IND.03",
  Fusteria: "SUB.16",
};

// Dates and progress for the Aixovall contracts already in data.ts.
const historiaAixovall: Record<string, Pick<Llavor, "creat" | "enviat" | "signat" | "executat">> = {
  "Formigons Andorra": { creat: "2026-01-26T09:00", enviat: "2026-01-27T10:15", signat: "2026-02-02T13:40", executat: 181_900 },
  "Ferros Lòria": { creat: "2026-01-26T09:20", enviat: "2026-01-27T10:15", signat: "2026-02-03T09:05", executat: 81_850 },
  "Instal·lacions Gil": { creat: "2026-03-09T11:00", enviat: "2026-03-10T09:30", signat: "2026-03-18T17:45", executat: 134_100 },
  "Clima Valira": { creat: "2026-10-22T16:30", enviat: "2026-10-24T11:20" },
  "Aluminis Ordino": { creat: "2026-10-30T12:05" },
};

const llavors: Record<string, Llavor[]> = {
  pedrasses: [
    { seq: 0, import: 2_450_000, pagament: 60, retencio: true, creat: "2026-11-03T09:10" },
  ],
  "placa-major": [
    { seq: 0, import: 4_104_000, pagament: 60, retencio: true, creat: "2026-10-27T10:00", enviat: "2026-10-29T16:40" },
    { seq: 1, contrapart: "Formigons Andorra", familia: "MAT.02", import: 486_000, pagament: 60, retencio: true, creat: "2026-11-02T11:30" },
    { seq: 2, contrapart: "Ferros Lòria", familia: "MAT.08", import: 188_000, pagament: 60, retencio: true, creat: "2026-10-28T09:45", enviat: "2026-10-30T12:10" },
    { seq: 3, contrapart: "Estructures Valira", familia: "MAO.02", import: 612_000, pagament: 90, retencio: true, creat: "2026-11-02T12:15", autor: "Jennifer" },
  ],
  aixovall: [
    { seq: 0, import: 3_860_000, pagament: 60, retencio: true, creat: "2026-01-12T09:30", enviat: "2026-01-14T10:00", signat: "2026-01-20T12:05", executat: 2_310_000 },
    ...base.map((c, i) => ({
      seq: i + 1,
      contrapart: c.industrial,
      familia: familiaBase[c.familia],
      import: c.import,
      pagament: Number.parseInt(c.pagament, 10) as Dies,
      retencio: c.retencio,
      ...historiaAixovall[c.industrial],
    })),
  ],
  "nau-santa-coloma": [
    { seq: 0, import: 2_140_000, pagament: 90, retencio: true, creat: "2025-08-25T09:00", enviat: "2025-08-27T10:30", signat: "2025-09-08T17:20", executat: 1_880_000 },
    { seq: 1, contrapart: "Prefabricats Valira", familia: "MAT.02", import: 312_000, pagament: 60, retencio: true, creat: "2025-09-18T10:00", enviat: "2025-09-19T09:00", signat: "2025-09-24T11:45", executat: 296_000, venciment: "2026-11-20" },
    { seq: 2, contrapart: "Metàl·liques Ordino", familia: "SUB.22", import: 468_000, pagament: 90, retencio: true, creat: "2025-10-06T09:30", enviat: "2025-10-07T10:00", signat: "2025-10-15T16:10", executat: 441_000 },
    { seq: 3, contrapart: "Bombeigs Andorra", familia: "MAQ.02", import: 38_000, pagament: 30, retencio: false, creat: "2025-09-10T08:30", enviat: "2025-09-10T09:00", signat: "2025-09-11T10:20", executat: 31_500, venciment: "2026-11-27" },
  ],
  "hotel-pas": [
    { seq: 0, import: 5_620_000, pagament: 60, retencio: true, creat: "2024-09-02T09:00", enviat: "2024-09-04T10:00", signat: "2024-09-20T13:30", executat: 5_710_000 },
    { seq: 1, contrapart: "Fusteria Escaldes", familia: "SUB.16", import: 214_000, pagament: 60, retencio: true, creat: "2026-08-10T10:00", enviat: "2026-08-12T09:40", executat: 198_000 },
    { seq: 2, contrapart: "Façanes Tèrmiques", familia: "SUB.19", import: 176_000, pagament: 60, retencio: true, creat: "2025-03-03T09:00", enviat: "2025-03-04T10:00", signat: "2025-03-10T12:00", executat: 176_000 },
  ],
  "escola-escaldes": [
    { seq: 0, import: 2_960_000, pagament: 60, retencio: true, creat: "2024-02-12T09:00", enviat: "2024-02-14T10:00", signat: "2024-02-26T11:00", executat: 2_960_000 },
    { seq: 1, contrapart: "Paletes Sant Julià", familia: "MAO.03", import: 342_000, pagament: 60, retencio: true, creat: "2024-03-11T09:00", enviat: "2024-03-12T09:30", signat: "2024-03-15T12:40", executat: 342_000 },
  ],
};

const pad = (n: number) => String(n).padStart(2, "0");

const idIndustrial = (nom: string) => industrials.find((i) => i.nom === nom)?.id ?? null;

export const contractes: Contracte[] = projectes.flatMap((p) =>
  (llavors[p.id] ?? []).map((l) => {
    const tipus: Tipus = l.seq === 0 ? "client" : "industrial";
    const contrapart = l.contrapart ?? p.client;
    return {
      id: `${p.num}-${pad(l.seq)}`,
      num: `CT-${p.num}.${pad(l.seq)}`,
      seq: l.seq,
      tipus,
      obra: p.id,
      contrapart,
      industrialId: tipus === "industrial" ? idIndustrial(contrapart) : null,
      familia: l.familia ?? null,
      import: l.import,
      pagament: l.pagament,
      retencio: l.retencio,
      venciment: l.venciment ?? p.fi,
      estat: l.signat ? "signat" : l.enviat ? "enviat" : "esborrany",
      autor: l.autor ?? "Marta Pujal",
      creat: l.creat,
      enviat: l.enviat ?? null,
      signat: l.signat ?? null,
      executat: l.executat ?? 0,
    };
  })
);

export const getContracte = (id: string) => contractes.find((c) => c.id === id);
export const contractesDe = (obra: string) => contractes.filter((c) => c.obra === obra);
export const contractesIndustrial = (industrialId: string) =>
  contractes.filter((c) => c.industrialId === industrialId);

const DIA = 86_400_000;

export const diesFins = (iso: string) => Math.round((Date.parse(iso.slice(0, 10)) - Date.parse(AVUI)) / DIA);

export function sumaMesos(iso: string, n: number) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const ultim = new Date(Date.UTC(y, m + n, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1 + n, Math.min(d, ultim))).toISOString().slice(0, 10);
}

export const estatDe = (c: Contracte): EstatVisible =>
  c.estat !== "signat" && diesFins(c.venciment) < 0 ? "caducat" : c.estat;

export function venceAviat(c: Contracte) {
  const d = diesFins(c.venciment);
  return d >= 0 && d <= DIES_PROPER;
}

export const retingut = (c: Contracte) => (c.retencio ? Math.round(c.executat * RETENCIO) : 0);

// The 5% guarantee is returned one year after the obra ends.
export function retornRetencio(c: Contracte) {
  const p = getProjecte(c.obra);
  return c.retencio && p ? sumaMesos(p.fi, 12) : null;
}

export const hora = (iso: string) => iso.slice(11, 16);
export const quan = (iso: string) => (iso.length > 10 ? `${date(iso)} · ${hora(iso)}` : date(iso));
export const dataLlarga = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("ca-AD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function ara() {
  const d = new Date();
  return `${AVUI}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const suma = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

export function resum(llista: Contracte[] = contractes) {
  const senseSignar = llista.filter((c) => c.estat !== "signat");
  const signats = llista.filter((c) => c.estat === "signat");
  return {
    senseSignar: senseSignar.length,
    importSenseSignar: suma(senseSignar.map((c) => c.import)),
    signats: signats.length,
    importSignat: suma(signats.map((c) => c.import)),
    pendents: llista.filter((c) => estatDe(c) === "enviat").length,
    esborranys: llista.filter((c) => estatDe(c) === "esborrany").length,
    caducats: llista.filter((c) => estatDe(c) === "caducat").length,
    retingut: suma(llista.filter((c) => c.tipus === "industrial").map(retingut)),
    retingutClients: suma(llista.filter((c) => c.tipus === "client").map(retingut)),
    vencenAviat: llista.filter(venceAviat).length,
  };
}

export function seguentNumero(obra: string, tipus: Tipus) {
  const p = getProjecte(obra);
  const num = p?.num ?? "0000";
  const delProjecte = contractesDe(obra);
  if (tipus === "client") {
    const n = delProjecte.filter((c) => c.tipus === "client").length;
    const sufix = n ? `-v${n + 1}` : "";
    return { seq: 0, id: `${num}-00${sufix}`, num: `CT-${num}.00${sufix}` };
  }
  const seq = Math.max(0, ...delProjecte.map((c) => c.seq)) + 1;
  return { seq, id: `${num}-${pad(seq)}`, num: `CT-${num}.${pad(seq)}` };
}

function ofertaPedrasses(industrialId: string) {
  const ofertes = (getIndustrial(industrialId)?.ofertes ?? []).filter((o) => o.baseImposable !== null);
  return ofertes.sort((a, b) => (a.baseImposable ?? 0) - (b.baseImposable ?? 0))[0] ?? null;
}

export function familiaPer(industrialId: string, obra: string): FamiliaCodi | null {
  const previ = contractesDe(obra).find((c) => c.industrialId === industrialId);
  if (previ?.familia) return previ.familia;
  const oferta = obra === pedrasses.id ? ofertaPedrasses(industrialId) : null;
  if (oferta) return oferta.familia as FamiliaCodi;
  return getIndustrial(industrialId)?.families[0] ?? null;
}

export function importSuggerit(tipus: Tipus, obra: string, industrialId: string | null) {
  if (tipus === "client") {
    const p = getProjecte(obra);
    return p ? { import: p.importEstudi, font: "Import d'estudi" } : null;
  }
  if (!industrialId) return null;
  const previ = contractesDe(obra).find((c) => c.industrialId === industrialId);
  if (previ) return { import: previ.import, font: `Contracte ${previ.num}` };
  const oferta = obra === pedrasses.id ? ofertaPedrasses(industrialId) : null;
  if (oferta?.baseImposable) return { import: Math.round(oferta.baseImposable), font: "Oferta a Pedrasses" };
  return null;
}

export type Variables = {
  tipus: Tipus;
  obra: string;
  industrialId: string | null;
  import: number;
  pagament: Dies;
  retencio: boolean;
  venciment: string;
};

export function generar(v: Variables, creat: string): Contracte {
  const p = getProjecte(v.obra);
  const n = seguentNumero(v.obra, v.tipus);
  const ind = v.tipus === "industrial" && v.industrialId ? getIndustrial(v.industrialId) : null;
  return {
    ...n,
    tipus: v.tipus,
    obra: v.obra,
    contrapart: v.tipus === "client" ? (p?.client ?? "") : (ind?.nom ?? ""),
    industrialId: ind?.id ?? null,
    familia: ind ? familiaPer(ind.id, v.obra) : null,
    import: v.import,
    pagament: v.pagament,
    retencio: v.retencio,
    venciment: v.venciment,
    estat: "esborrany",
    autor: "Marta Pujal",
    creat,
    enviat: null,
    signat: null,
    executat: 0,
  };
}

export function hrefRegenerar(c: Contracte) {
  return c.industrialId
    ? `/contractes/nou?obra=${c.obra}&industrial=${c.industrialId}`
    : `/contractes/nou?obra=${c.obra}&tipus=client`;
}
