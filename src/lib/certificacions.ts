import { getObra } from "@/lib/data";
import { eur, pct } from "@/lib/format";

export const ESTATS = ["Producció", "Certificació", "Arquitecte", "Facturada", "Cobrada"] as const;
export type Estat = (typeof ESTATS)[number];

export const IGI = 0.045;
export const RETENCIO = 0.05;
export const AVUI = "2026-11-03";
export const CICLE = "2026-10";

const MESOS = ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"];
const MESOS_CURT = ["gen", "feb", "març", "abr", "maig", "juny", "jul", "ago", "set", "oct", "nov", "des"];

const nMes = (mes: string) => Number(mes.slice(5, 7)) - 1;

export const mesLabel = (mes: string) => {
  const m = MESOS[nMes(mes)];
  return `${m[0].toUpperCase()}${m.slice(1)} ${mes.slice(0, 4)}`;
};

// Catalan elision: "d'octubre", "d'Habitatges Aixovall", "de setembre"
export const de = (s: string) => (/^[aeiouàèéíòóúh]/i.test(s) ? `d'${s}` : `de ${s}`);
export const deMes = (mes: string) => de(MESOS[nMes(mes)]);

// Deterministic short date ("3 nov") so client and server render the same text.
export const dia = (iso: string) => `${Number(iso.slice(8, 10))} ${MESOS_CURT[Number(iso.slice(5, 7)) - 1]}`;

export type Soci = { nom: string; pct: number };

export type ObraCert = {
  id: string;
  obs: string;
  nom: string;
  lloc: string;
  client: string;
  arquitecte: string;
  signant: string;
  capObra: string;
  pressupost: number;
  participacio: number;
  socis: Soci[];
  retencio: boolean;
  inici: string;
  fi: string;
  fitxa: boolean;
};

export type Linia = {
  codi: string;
  nom: string;
  pressupost: number;
  anterior: number;
  origen: number;
  previst: number;
};

export type Certificacio = {
  id: string;
  obraId: string;
  num: number;
  mes: string;
  estat: Estat;
  linies: Linia[];
  preparada?: string;
  enviada?: string;
  signada?: string;
  facturada?: string;
  cobrada?: string;
  factura?: string;
};

type Pla = { codi: string; nom: string; pes: number; ini: number; fi: number };
type Tipus = "residencial" | "rehabilitacio" | "industrial";

// Chapter weight over the budget and its window as a fraction of the obra's duration.
const PLANS: Record<Tipus, Pla[]> = {
  residencial: [
    { codi: "01", nom: "Moviment de terres", pes: 0.05, ini: 0, fi: 0.12 },
    { codi: "02", nom: "Fonaments i estructura", pes: 0.26, ini: 0.05, fi: 0.45 },
    { codi: "03", nom: "Tancaments", pes: 0.16, ini: 0.3, fi: 0.7 },
    { codi: "04", nom: "Instal·lacions", pes: 0.21, ini: 0.35, fi: 0.92 },
    { codi: "05", nom: "Acabats", pes: 0.32, ini: 0.55, fi: 1 },
  ],
  rehabilitacio: [
    { codi: "01", nom: "Enderrocs i desmuntatges", pes: 0.08, ini: 0, fi: 0.15 },
    { codi: "02", nom: "Estructura i reforços", pes: 0.14, ini: 0.08, fi: 0.4 },
    { codi: "03", nom: "Tancaments i coberta", pes: 0.18, ini: 0.25, fi: 0.65 },
    { codi: "04", nom: "Instal·lacions", pes: 0.28, ini: 0.3, fi: 0.9 },
    { codi: "05", nom: "Acabats", pes: 0.32, ini: 0.5, fi: 1 },
  ],
  industrial: [
    { codi: "01", nom: "Moviment de terres", pes: 0.08, ini: 0, fi: 0.15 },
    { codi: "02", nom: "Fonaments i estructura metàl·lica", pes: 0.34, ini: 0.08, fi: 0.5 },
    { codi: "03", nom: "Tancaments i coberta", pes: 0.22, ini: 0.35, fi: 0.75 },
    { codi: "04", nom: "Instal·lacions", pes: 0.18, ini: 0.45, fi: 0.95 },
    { codi: "05", nom: "Paviments i acabats", pes: 0.18, ini: 0.6, fi: 1 },
  ],
};

const SIGNANTS: Record<string, string> = {
  "Estudi Riba Arquitectes": "Laia Riba",
  "Pla & Serra": "Joan Serra",
  "Arquitectura Ordino": "Núria Cases",
  "Moisès Pernía": "Moisès Pernía",
};

type Dates = Pick<Certificacio, "preparada" | "enviada" | "signada" | "facturada" | "cobrada">;

type Font = {
  id: string;
  tipus: Tipus;
  retencio: boolean;
  socis?: Soci[];
  // A origen at the end of each month, abril → octubre 2026.
  avanc: number[];
  desviacio?: Record<string, number>;
  exces?: { codi: string; origen: number };
  setembre?: Estat;
  octubre?: Dates & { estat: Estat };
  // Obres that only exist in this module (data.ts has five).
  obra?: Omit<ObraCert, "id" | "signant" | "socis" | "retencio" | "fitxa" | "participacio"> & { participacio?: number };
};

const FONTS: Font[] = [
  {
    id: "aixovall",
    tipus: "residencial",
    retencio: true,
    avanc: [0.24, 0.332746, 0.38, 0.44, 0.53, 0.62, 0.7],
    desviacio: { "04": 0.05, "03": -0.06 },
    setembre: "Facturada",
    octubre: { estat: "Certificació", preparada: "2026-11-03" },
  },
  {
    id: "nau-santa-coloma",
    tipus: "industrial",
    retencio: false,
    socis: [{ nom: "Obres Arinsal, SL", pct: 49 }],
    avanc: [0.5, 0.58, 0.66, 0.72, 0.8, 0.88, 0.95],
    desviacio: { "03": -0.05 },
    octubre: { estat: "Arquitecte", preparada: "2026-10-30", enviada: "2026-10-30" },
  },
  {
    id: "hotel-pas",
    tipus: "rehabilitacio",
    retencio: true,
    socis: [
      { nom: "Construccions Montclar, SA", pct: 34 },
      { nom: "Obres Arinsal, SL", pct: 33 },
    ],
    avanc: [0.8, 0.84, 0.88, 0.91, 0.94, 0.97, 1],
    octubre: { estat: "Facturada", preparada: "2026-10-28", enviada: "2026-10-28", signada: "2026-10-30", facturada: "2026-11-02" },
  },
  {
    id: "escola-escaldes",
    tipus: "residencial",
    retencio: true,
    avanc: [1, 1, 1, 1, 1, 1, 1],
  },
  {
    id: "aparcament-escaldes",
    tipus: "residencial",
    retencio: true,
    socis: [{ nom: "Construccions Montclar, SA", pct: 50 }],
    avanc: [0.45, 0.5, 0.55, 0.6, 0.63, 0.68, 0.73],
    exces: { codi: "02", origen: 1.06 },
    setembre: "Facturada",
    octubre: { estat: "Arquitecte", preparada: "2026-10-30", enviada: "2026-11-02" },
    obra: {
      obs: "OBS-2599",
      nom: "Aparcament comunal Escaldes",
      lloc: "Escaldes-Engordany",
      client: "Comú d'Escaldes-Engordany",
      arquitecte: "Pla & Serra",
      capObra: "Sergi Font",
      pressupost: 3_380_000,
      participacio: 50,
      inici: "2025-06-02",
      fi: "2027-02-26",
    },
  },
  {
    id: "fontaneda",
    tipus: "residencial",
    retencio: true,
    avanc: [0.22, 0.28, 0.35, 0.42, 0.46, 0.53, 0.6],
    desviacio: { "05": -0.05 },
    setembre: "Facturada",
    octubre: { estat: "Certificació", preparada: "2026-11-02" },
    obra: {
      obs: "OBS-2602",
      nom: "Habitatges Fontaneda",
      lloc: "Fontaneda, Sant Julià de Lòria",
      client: "Residencial Fontaneda, SL",
      arquitecte: "Arquitectura Ordino",
      capObra: "Anna Puig",
      pressupost: 1_920_000,
      inici: "2025-11-03",
      fi: "2027-03-26",
    },
  },
  {
    id: "casa-comuna",
    tipus: "rehabilitacio",
    retencio: true,
    avanc: [0, 0.08, 0.17, 0.26, 0.31, 0.42, 0.53],
    desviacio: { "04": 0.06 },
    octubre: { estat: "Certificació", preparada: "2026-11-02" },
    obra: {
      obs: "OBS-2609",
      nom: "Reforma Casa Comuna",
      lloc: "Sant Julià de Lòria",
      client: "Comú de Sant Julià de Lòria",
      arquitecte: "Pla & Serra",
      capObra: "Marc Riba",
      pressupost: 640_000,
      inici: "2026-04-06",
      fi: "2027-01-29",
    },
  },
  {
    id: "juberri",
    tipus: "residencial",
    retencio: false,
    avanc: [0.05, 0.11, 0.18, 0.26, 0.3, 0.37, 0.45],
    octubre: { estat: "Arquitecte", preparada: "2026-10-30", enviada: "2026-10-30", signada: "2026-11-02" },
    obra: {
      obs: "OBS-2614",
      nom: "Xalet Juberri",
      lloc: "Juberri, Sant Julià de Lòria",
      client: "Inversions Juberri, SL",
      arquitecte: "Moisès Pernía",
      capObra: "Pere Casals",
      pressupost: 920_000,
      inici: "2026-03-02",
      fi: "2027-02-26",
    },
  },
  {
    id: "meritxell",
    tipus: "rehabilitacio",
    retencio: false,
    avanc: [0.25, 0.35, 0.45, 0.55, 0.6, 0.7, 0.82],
    octubre: { estat: "Cobrada", preparada: "2026-10-26", enviada: "2026-10-26", signada: "2026-10-27", facturada: "2026-10-28", cobrada: "2026-11-02" },
    obra: {
      obs: "OBS-2613",
      nom: "Locals Av. Meritxell",
      lloc: "Andorra la Vella",
      client: "Comercial Meritxell, SA",
      arquitecte: "Arquitectura Ordino",
      capObra: "Pere Casals",
      pressupost: 1_180_000,
      inici: "2026-01-12",
      fi: "2026-12-18",
    },
  },
  {
    id: "prat-creu",
    tipus: "residencial",
    retencio: true,
    avanc: [0.2, 0.25, 0.31, 0.37, 0.41, 0.47, 0.53],
    octubre: { estat: "Producció" },
    obra: {
      obs: "OBS-2607",
      nom: "Edifici Prat de la Creu",
      lloc: "Andorra la Vella",
      client: "Promocions Valira Centre, SA",
      arquitecte: "Estudi Riba Arquitectes",
      capObra: "Marc Riba",
      pressupost: 2_640_000,
      inici: "2025-10-06",
      fi: "2027-04-30",
    },
  },
  {
    id: "nagol",
    tipus: "residencial",
    retencio: true,
    avanc: [0, 0, 0.03, 0.07, 0.09, 0.13, 0.18],
    octubre: { estat: "Producció" },
    obra: {
      obs: "OBS-2616",
      nom: "Habitatges Nagol",
      lloc: "Nagol, Sant Julià de Lòria",
      client: "Immobiliària Coma, SA",
      arquitecte: "Estudi Riba Arquitectes",
      capObra: "Sergi Font",
      pressupost: 1_450_000,
      inici: "2026-06-01",
      fi: "2027-09-30",
    },
  },
];

const FINESTRA = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

// Chapter progress at the "effective time" that makes the weighted total hit the target.
function repartir(plans: Pla[], target: number, shift: Record<string, number> = {}) {
  const at = (tau: number) =>
    plans.map((p) => smooth((tau + (shift[p.codi] ?? 0) - p.ini) / (p.fi - p.ini)));
  const total = (tau: number) => at(tau).reduce((s, v, i) => s + v * plans[i].pes, 0);
  let lo = -0.5;
  let hi = 1.5;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (total(mid) < target) lo = mid;
    else hi = mid;
  }
  // Snap the tails and put the residual on the main open chapter so the total stays exact.
  const v = at(hi).map((x) => (x < 0.003 ? 0 : x > 0.997 ? 1 : x));
  const resta = target - v.reduce((s, x, i) => s + x * plans[i].pes, 0);
  const k = v.reduce((b, x, i) => (x > 0 && x < 1 && (b < 0 || plans[i].pes > plans[b].pes) ? i : b), -1);
  if (k >= 0) v[k] += resta / plans[k].pes;
  return v;
}

const mesSeguent = (mes: string, d: number) => {
  const dt = new Date(Date.UTC(Number(mes.slice(0, 4)), nMes(mes) + 1, d));
  return dt.toISOString().slice(0, 10);
};
const mesosEntre = (a: string, b: string) =>
  (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + nMes(b) - nMes(a);

function obraDe(f: Font): ObraCert {
  const base = f.obra ?? getObra(f.id);
  if (!base) throw new Error(`Obra ${f.id} no existeix`);
  return {
    id: f.id,
    obs: base.obs,
    nom: base.nom,
    lloc: base.lloc,
    client: base.client,
    arquitecte: base.arquitecte,
    signant: SIGNANTS[base.arquitecte] ?? base.arquitecte,
    capObra: base.capObra,
    pressupost: "importEstudi" in base ? base.importEstudi : base.pressupost,
    participacio: base.participacio ?? 100,
    socis: f.socis ?? [],
    retencio: f.retencio,
    inici: base.inici,
    fi: base.fi,
    fitxa: !f.obra,
  };
}

function historic(estat: Estat, mes: string): Dates & { estat: Estat } {
  const d: Dates = {
    preparada: mesSeguent(mes, 2),
    enviada: mesSeguent(mes, 5),
    signada: mesSeguent(mes, 15),
    facturada: mesSeguent(mes, 16),
  };
  return estat === "Cobrada" ? { ...d, estat, cobrada: mesSeguent(mes, 30) } : { ...d, estat };
}

function generar(f: Font, obra: ObraCert): Certificacio[] {
  const plans = PLANS[f.tipus];
  const certs: Certificacio[] = [];
  let anterior = repartir(plans, f.avanc[0], f.desviacio);
  let num = f.avanc[0] > 0 ? mesosEntre(obra.inici.slice(0, 7), FINESTRA[0]) + 1 : 0;

  for (let i = 1; i < FINESTRA.length; i++) {
    const mes = FINESTRA[i];
    if (f.avanc[i] <= f.avanc[i - 1]) continue;
    const origen = repartir(plans, f.avanc[i], f.desviacio);
    const previst = repartir(plans, f.avanc[i]);
    const linies: Linia[] = plans.map((p, j) => ({
      codi: p.codi,
      nom: p.nom,
      pressupost: Math.round(p.pes * obra.pressupost),
      anterior: anterior[j],
      origen: origen[j],
      previst: previst[j],
    }));
    const actual = mes === CICLE;
    if (actual && f.exces) {
      const l = linies.find((x) => x.codi === f.exces!.codi);
      if (l) l.origen = Math.max(l.origen, f.exces.origen);
    }
    const dates = actual
      ? (f.octubre ?? { estat: "Producció" as Estat })
      : historic(mes === "2026-09" ? (f.setembre ?? "Cobrada") : "Cobrada", mes);
    num += 1;
    certs.push({ id: `${f.id}-${mes}`, obraId: f.id, num, mes, linies, ...dates });
    anterior = origen;
  }
  return certs;
}

export const obresCert: ObraCert[] = FONTS.map(obraDe);

const generades = FONTS.flatMap((f, i) => generar(f, obresCert[i]));

// Sales invoices are numbered in issue order across every obra.
const PRIMERA_FACTURA = 121;
const ordreFactura = generades
  .filter((c) => c.facturada)
  .sort((a, b) => a.facturada!.localeCompare(b.facturada!) || a.obraId.localeCompare(b.obraId));
const numFactura = (n: number) => `FV-26/${String(n).padStart(4, "0")}`;

export const certificacions: Certificacio[] = generades.map((c) => {
  const i = ordreFactura.indexOf(c);
  return i >= 0 ? { ...c, factura: numFactura(PRIMERA_FACTURA + i) } : c;
});

export const seguentFactura = () => numFactura(PRIMERA_FACTURA + ordreFactura.length);

export const getObraCert = (id: string) => obresCert.find((o) => o.id === id);
export const getCertificacio = (id: string) => certificacions.find((c) => c.id === id);

export const certsObra = (obraId: string) =>
  certificacions.filter((c) => c.obraId === obraId).sort((a, b) => b.mes.localeCompare(a.mes));

export const delCicle = (mes = CICLE) =>
  certificacions
    .filter((c) => c.mes === mes)
    .sort((a, b) => ESTATS.indexOf(a.estat) - ESTATS.indexOf(b.estat) || totals(b).pujal - totals(a).pujal);

export const mesosAnteriors = () =>
  [...new Set(certificacions.map((c) => c.mes))]
    .filter((m) => m < CICLE)
    .sort((a, b) => b.localeCompare(a))
    .map((mes) => ({ mes, certs: delCicle(mes) }));

const cents = (n: number) => Math.round(n * 100) / 100;

export const importMes = (l: Linia) => cents(l.pressupost * (l.origen - l.anterior));

export function avancObra(c: Certificacio) {
  const pres = c.linies.reduce((s, l) => s + l.pressupost, 0);
  const anterior = c.linies.reduce((s, l) => s + l.pressupost * l.anterior, 0) / pres;
  const origen = c.linies.reduce((s, l) => s + l.pressupost * l.origen, 0) / pres;
  return { pressupost: pres, anterior, origen, mes: origen - anterior };
}

export function totals(c: Certificacio) {
  const obra = getObraCert(c.obraId)!;
  const base = cents(c.linies.reduce((s, l) => s + l.pressupost * (l.origen - l.anterior), 0));
  const part = obra.participacio / 100;
  const pujal = cents(base * part);
  const igi = cents(pujal * IGI);
  const retencio = obra.retencio ? cents(pujal * RETENCIO) : 0;
  return {
    base,
    part,
    pujal,
    igi,
    retencio,
    total: cents(pujal + igi - retencio),
    socis: obra.socis.map((s) => ({ ...s, base: cents((base * s.pct) / 100) })),
  };
}

// Deviation of a chapter against the planning, in percentage points; excess over budget wins.
export function desviacio(l: Linia): { tipus: "exces" | "previst"; pp: number } | null {
  if (l.origen > 1.0001) return { tipus: "exces", pp: (l.origen - 1) * 100 };
  const pp = (l.origen - l.previst) * 100;
  return Math.abs(pp) >= 4 ? { tipus: "previst", pp } : null;
}

export const signada = (c: Certificacio) => !!c.signada;
export const pendentArquitecte = (c: Certificacio) => c.estat === "Arquitecte" && !c.signada;
const perCertificar = (c: Certificacio) =>
  c.estat === "Producció" || c.estat === "Certificació" || pendentArquitecte(c);
const facturada = (c: Certificacio) => c.estat === "Facturada" || c.estat === "Cobrada";

export function retencions() {
  return obresCert
    .filter((o) => o.retencio)
    .map((o) => {
      const fet = certsObra(o.id).find(facturada);
      const font = FONTS.find((f) => f.id === o.id)!;
      const origen = fet ? avancObra(fet).origen : font.avanc[0];
      const venciment = `${Number(o.fi.slice(0, 4)) + 1}${o.fi.slice(4)}`;
      return {
        obra: o,
        import: cents(o.pressupost * (o.participacio / 100) * origen * RETENCIO),
        venciment,
        acabada: o.fi < AVUI,
      };
    })
    .filter((r) => r.import > 0)
    .sort((a, b) => a.venciment.localeCompare(b.venciment));
}

export function resumCicle(mes = CICLE) {
  const certs = delCicle(mes);
  const suma = (cs: Certificacio[]) => cents(cs.reduce((s, c) => s + totals(c).pujal, 0));
  const ret = retencions();
  return {
    certs,
    total: suma(certs),
    perEstat: ESTATS.map((estat) => {
      const cs = certs.filter((c) => c.estat === estat);
      return { estat, n: cs.length, import: suma(cs), signades: estat === "Arquitecte" ? cs.filter(signada).length : 0 };
    }),
    perCertificar: { n: certs.filter(perCertificar).length, import: suma(certs.filter(perCertificar)) },
    arquitecte: { n: certs.filter(pendentArquitecte).length, import: suma(certs.filter(pendentArquitecte)) },
    facturat: { n: certs.filter(facturada).length, import: suma(certs.filter(facturada)) },
    retencions: { import: cents(ret.reduce((s, r) => s + r.import, 0)), propera: ret.find((r) => r.venciment >= AVUI) },
    utes: obresCert.filter((o) => o.participacio < 100 && certs.some((c) => c.obraId === o.id)),
  };
}

// Same shape as the assistant's Card so it can back a chat tool directly.
export function resumCertificacions() {
  const r = resumCicle();
  return {
    title: `Certificacions ${deMes(CICLE)} · ${eur(r.perCertificar.import)} per certificar`,
    rows: r.perEstat
      .filter((e) => e.n > 0)
      .map((e) => ({
        label: e.estat,
        value: `${e.n} · ${eur(e.import)}`,
        hint: r.certs
          .filter((c) => c.estat === e.estat)
          .map((c) => getObraCert(c.obraId)!.nom)
          .join(", "),
      })),
    links: [{ label: "Obrir certificacions", href: "/certificacions" }],
  };
}

export function detallCertificacio(id: string) {
  const c = getCertificacio(id);
  if (!c) return { error: `No existeix la certificació ${id}. Format: <obra>-<aaaa-mm>` };
  const o = getObraCert(c.obraId)!;
  const t = totals(c);
  const a = avancObra(c);
  return {
    title: `${o.nom} · ${mesLabel(c.mes)} · núm. ${c.num}`,
    rows: [
      { label: "Estat", value: c.signada && c.estat === "Arquitecte" ? "Signada" : c.estat },
      { label: "Avanç", value: `${pct(a.anterior * 100)} → ${pct(a.origen * 100)}` },
      { label: "Base", value: eur(t.pujal), hint: o.participacio < 100 ? `UTE ${o.participacio}% de ${eur(t.base)}` : undefined },
      { label: "Total a cobrar", value: eur(t.total), hint: `IGI ${eur(t.igi)}${t.retencio ? ` · retenció ${eur(t.retencio)}` : ""}` },
      ...c.linies
        .map((l) => ({ l, d: desviacio(l) }))
        .filter((x) => x.d)
        .map(({ l, d }) => ({
          label: l.nom,
          value: d!.tipus === "exces" ? `Excés +${d!.pp.toFixed(1)}%` : `${d!.pp > 0 ? "+" : ""}${d!.pp.toFixed(1)} pp vs previst`,
        })),
    ],
    links: [{ label: "Obrir certificació", href: `/certificacions/${c.id}` }],
  };
}
