export type ObraEstat =
  | "Estudi"
  | "Adjudicada"
  | "En execució"
  | "Tancament"
  | "Garantia";

export type Obra = {
  id: string;
  obs: string;
  nom: string;
  lloc: string;
  client: string;
  arquitecte: string;
  capObra: string;
  estat: ObraEstat;
  participacio: number;
  importEstudi: number;
  margeEstudi: number;
  margePrevist: number;
  certificat: number;
  facturat: number;
  cobrat: number;
  pendentContractar: number;
  inici: string;
  fi: string;
};

export const obres: Obra[] = [
  {
    id: "aixovall",
    obs: "OBS-2611",
    nom: "Habitatges Aixovall",
    lloc: "Aixovall, Sant Julià de Lòria",
    client: "Immobiliària Coma, SA",
    arquitecte: "Estudi Riba Arquitectes",
    capObra: "Jordi Vidal",
    estat: "En execució",
    participacio: 100,
    importEstudi: 3_860_000,
    margeEstudi: 9.1,
    margePrevist: 8.4,
    certificat: 0.62,
    facturat: 2_310_000,
    cobrat: 1_980_000,
    pendentContractar: 412_000,
    inici: "2026-02-09",
    fi: "2027-05-28",
  },
  {
    id: "placa-major",
    obs: "OBS-2618",
    nom: "Edifici Plaça Major",
    lloc: "Sant Julià de Lòria",
    client: "Promocions Lòria, SL",
    arquitecte: "Pla & Serra",
    capObra: "Marc Riba",
    estat: "Adjudicada",
    participacio: 100,
    importEstudi: 4_104_000,
    margeEstudi: 9.2,
    margePrevist: 9.2,
    certificat: 0,
    facturat: 0,
    cobrat: 0,
    pendentContractar: 3_420_000,
    inici: "2026-12-01",
    fi: "2028-01-31",
  },
  {
    id: "nau-santa-coloma",
    obs: "OBS-2604",
    nom: "Nau industrial Santa Coloma",
    lloc: "Santa Coloma, Andorra la Vella",
    client: "Logística Valira, SA",
    arquitecte: "Arquitectura Ordino",
    capObra: "Anna Puig",
    estat: "En execució",
    participacio: 51,
    importEstudi: 2_140_000,
    margeEstudi: 8.7,
    margePrevist: 9.6,
    certificat: 0.88,
    facturat: 1_880_000,
    cobrat: 1_880_000,
    pendentContractar: 36_000,
    inici: "2025-09-15",
    fi: "2026-12-18",
  },
  {
    id: "hotel-pas",
    obs: "OBS-2597",
    nom: "Rehabilitació Hotel Pas",
    lloc: "Pas de la Casa, Encamp",
    client: "Hotels Envalira, SA",
    arquitecte: "Estudi Riba Arquitectes",
    capObra: "Jordi Vidal",
    estat: "Tancament",
    participacio: 33,
    importEstudi: 5_620_000,
    margeEstudi: 7.9,
    margePrevist: 6.8,
    certificat: 1,
    facturat: 5_710_000,
    cobrat: 5_420_000,
    pendentContractar: 0,
    inici: "2024-10-01",
    fi: "2026-10-30",
  },
  {
    id: "escola-escaldes",
    obs: "OBS-2582",
    nom: "Escola Escaldes",
    lloc: "Escaldes-Engordany",
    client: "Govern d'Andorra",
    arquitecte: "Pla & Serra",
    capObra: "Anna Puig",
    estat: "Garantia",
    participacio: 100,
    importEstudi: 2_960_000,
    margeEstudi: 8.2,
    margePrevist: 8.9,
    certificat: 1,
    facturat: 2_960_000,
    cobrat: 2_812_000,
    pendentContractar: 0,
    inici: "2024-03-04",
    fi: "2025-11-21",
  },
];

export const etapesEstudi = [
  "Documentació",
  "Partides",
  "Comparatiu",
  "Tancament",
  "Oferta",
] as const;

export type Estudi = {
  id: string;
  nom: string;
  arquitecte: string;
  superficie: number;
  importEstimat: number;
  etapa: number;
  lliurament: string;
  responsable: string;
};

export const estudis: Estudi[] = [
  {
    id: "pedrasses",
    nom: "Xalets Les Pedrasses",
    arquitecte: "Moisès Pernía",
    superficie: 0,
    importEstimat: 0,
    etapa: 2,
    lliurament: "2026-11-13",
    responsable: "Jennifer",
  },
  {
    id: "placa-major",
    nom: "Edifici Plaça Major",
    arquitecte: "Pla & Serra",
    superficie: 3_850,
    importEstimat: 4_104_000,
    etapa: 3,
    lliurament: "2026-11-20",
    responsable: "Jennifer",
  },
  {
    id: "xalet-anyos",
    nom: "Xalet Anyós",
    arquitecte: "Arquitectura Ordino",
    superficie: 640,
    importEstimat: 1_180_000,
    etapa: 2,
    lliurament: "2026-11-27",
    responsable: "Jennifer",
  },
  {
    id: "residencial-canillo",
    nom: "Residencial Canillo",
    arquitecte: "Estudi Riba Arquitectes",
    superficie: 5_200,
    importEstimat: 6_350_000,
    etapa: 1,
    lliurament: "2026-12-11",
    responsable: "Jennifer",
  },
  {
    id: "oficines-carlemany",
    nom: "Oficines Av. Carlemany",
    arquitecte: "Pla & Serra",
    superficie: 2_100,
    importEstimat: 2_480_000,
    etapa: 1,
    lliurament: "2026-12-18",
    responsable: "Jennifer",
  },
  {
    id: "habitatges-ordino",
    nom: "Habitatges Ordino",
    arquitecte: "Arquitectura Ordino",
    superficie: 2_900,
    importEstimat: 3_300_000,
    etapa: 0,
    lliurament: "2027-01-15",
    responsable: "Jennifer",
  },
  {
    id: "nau-bixessarri",
    nom: "Nau Bixessarri",
    arquitecte: "Estudi Riba Arquitectes",
    superficie: 1_600,
    importEstimat: 1_420_000,
    etapa: 0,
    lliurament: "2027-01-22",
    responsable: "Jennifer",
  },
];

export const documentsArquitecte = [
  { nom: "Memòria de qualitat", fitxers: 3, format: "PDF", llegit: true },
  { nom: "Amidaments", fitxers: 1, format: "BC3", llegit: true },
  { nom: "Plànols", fitxers: 42, format: "PDF · DWG", llegit: true },
];

export const discrepancies = [
  {
    partida: "03.04 Façana ventilada",
    detall: "Amidament 1.240 m² · plànols 1.318 m²",
    impacte: 9_360,
  },
  {
    partida: "02.07 Acer B500S",
    detall: "Quantia 38 kg/m³ per sota de l'habitual (45–60)",
    impacte: 21_400,
  },
  {
    partida: "05.11 Cuina",
    detall: "Electrodomèstics a la memòria, no als amidaments",
    impacte: 48_000,
  },
];

export type Partida = {
  codi: string;
  descripcio: string;
  unitat: string;
  quantitat: number;
  preuRef: number;
  preuEstudi: number;
  familia: string;
};

export type Capitol = { codi: string; nom: string; partides: Partida[] };

export const capitols: Capitol[] = [
  {
    codi: "02",
    nom: "Fonaments i estructura",
    partides: [
      { codi: "02.03", descripcio: "Formigó HA-25/B/20/IIa", unitat: "m³", quantitat: 2_140, preuRef: 98, preuEstudi: 101, familia: "Formigó" },
      { codi: "02.07", descripcio: "Acer B500S", unitat: "kg", quantitat: 81_300, preuRef: 1.18, preuEstudi: 1.21, familia: "Ferro" },
      { codi: "02.09", descripcio: "Encofrat de forjat", unitat: "m²", quantitat: 6_900, preuRef: 24, preuEstudi: 23.5, familia: "Encofrat" },
    ],
  },
  {
    codi: "03",
    nom: "Tancaments",
    partides: [
      { codi: "03.01", descripcio: "Fàbrica de maó perforat", unitat: "m²", quantitat: 2_380, preuRef: 31, preuEstudi: 32, familia: "Ram de paleta" },
      { codi: "03.04", descripcio: "Façana ventilada de pedra", unitat: "m²", quantitat: 1_318, preuRef: 118, preuEstudi: 120, familia: "Façana" },
    ],
  },
  {
    codi: "04",
    nom: "Instal·lacions",
    partides: [
      { codi: "04.01", descripcio: "Instal·lació elèctrica", unitat: "u", quantitat: 1, preuRef: 312_000, preuEstudi: 305_000, familia: "Elèctrica" },
      { codi: "04.05", descripcio: "Fontaneria i sanejament", unitat: "u", quantitat: 1, preuRef: 188_000, preuEstudi: 192_000, familia: "Fontaneria" },
      { codi: "04.09", descripcio: "Climatització per aerotèrmia", unitat: "u", quantitat: 1, preuRef: 264_000, preuEstudi: 259_000, familia: "Clima" },
    ],
  },
  {
    codi: "05",
    nom: "Acabats",
    partides: [
      { codi: "05.02", descripcio: "Fusteria exterior d'alumini", unitat: "m²", quantitat: 940, preuRef: 410, preuEstudi: 425, familia: "Fusteria" },
      { codi: "05.06", descripcio: "Paviment porcellànic", unitat: "m²", quantitat: 3_120, preuRef: 46, preuEstudi: 44, familia: "Rajola" },
      { codi: "05.11", descripcio: "Cuina equipada", unitat: "u", quantitat: 32, preuRef: 9_800, preuEstudi: 10_400, familia: "Cuina" },
    ],
  },
];

export type Oferta = {
  industrial: string;
  preu: number;
  termini: string;
  format: string;
  nota?: string;
};

export const comparatiu: {
  partida: string;
  descripcio: string;
  unitat: string;
  preuRef: number;
  ofertes: Oferta[];
}[] = [
  {
    partida: "02.03",
    descripcio: "Formigó HA-25",
    unitat: "m³",
    preuRef: 98,
    ofertes: [
      { industrial: "Formigons Andorra", preu: 97.5, termini: "Immediat", format: "PDF" },
      { industrial: "Ciments del Pirineu", preu: 104, termini: "Immediat", format: "Excel" },
      { industrial: "Prefabricats Valira", preu: 101, termini: "1 setmana", format: "PDF", nota: "Inclou bombeig" },
    ],
  },
  {
    partida: "02.07",
    descripcio: "Acer B500S",
    unitat: "kg",
    preuRef: 1.18,
    ofertes: [
      { industrial: "Ferros Lòria", preu: 1.16, termini: "2 setmanes", format: "Excel" },
      { industrial: "Armadures Segre", preu: 1.22, termini: "1 setmana", format: "PDF", nota: "Muntatge inclòs" },
    ],
  },
  {
    partida: "05.02",
    descripcio: "Fusteria exterior",
    unitat: "m²",
    preuRef: 410,
    ofertes: [
      { industrial: "Aluminis Ordino", preu: 418, termini: "6 setmanes", format: "PDF" },
      { industrial: "Tancaments Pirineus", preu: 402, termini: "10 setmanes", format: "PDF", nota: "Vidre a part" },
      { industrial: "Fusteria Escaldes", preu: 431, termini: "5 setmanes", format: "Excel" },
    ],
  },
];

export const indirectesMensuals = [
  { concepte: "Grua", import: 4_200 },
  { concepte: "Vehicles", import: 1_800 },
  { concepte: "Lloguer i casetes", import: 900 },
  { concepte: "Dietes i permisos", import: 1_100 },
];

export const costDirecteEstudi = 3_420_000;
export const totalPartides = 214;
export const costPersonaMes = 5_500;
export const despesesGenerals = 0.06;

export const capitolsObra = [
  { nom: "Fonaments i estructura", estudi: 812_000, reestudi: 796_000, contractat: 791_000, real: 803_500 },
  { nom: "Tancaments", estudi: 488_000, reestudi: 479_000, contractat: 482_000, real: 341_200 },
  { nom: "Instal·lacions", estudi: 702_000, reestudi: 716_000, contractat: 698_000, real: 284_000 },
  { nom: "Acabats", estudi: 941_000, reestudi: 955_000, contractat: 621_000, real: 118_400 },
  { nom: "Indirectes", estudi: 356_000, reestudi: 356_000, contractat: 356_000, real: 231_000 },
];

export const contractes = [
  { industrial: "Formigons Andorra", familia: "Formigó", import: 214_000, pagament: "60 dies", retencio: true, signat: true },
  { industrial: "Ferros Lòria", familia: "Ferro", import: 96_300, pagament: "60 dies", retencio: true, signat: true },
  { industrial: "Instal·lacions Gil", familia: "Elèctrica", import: 298_000, pagament: "90 dies", retencio: true, signat: true },
  { industrial: "Clima Valira", familia: "Clima", import: 254_000, pagament: "60 dies", retencio: true, signat: false },
  { industrial: "Aluminis Ordino", familia: "Fusteria", import: 386_000, pagament: "30 dies", retencio: false, signat: false },
];

export const certificacions = [
  { mes: "Jul 2026", avanc: 0.38, import: 182_400, validada: true, facturada: true, cobrada: true },
  { mes: "Ago 2026", avanc: 0.44, import: 231_600, validada: true, facturada: true, cobrada: true },
  { mes: "Set 2026", avanc: 0.53, import: 347_400, validada: true, facturada: true, cobrada: true },
  { mes: "Oct 2026", avanc: 0.62, import: 347_400, validada: true, facturada: true, cobrada: false },
  { mes: "Nov 2026", avanc: 0.7, import: 308_800, validada: false, facturada: false, cobrada: false },
];

export const passosAprovacio = ["Albarans", "Cap d'obra", "Conformitat", "Direcció"] as const;

export const factures = [
  { num: "F-26/1184", proveidor: "Formigons Andorra", import: 38_420, data: "2026-10-31", pas: 4, albarans: 12 },
  { num: "A-2210", proveidor: "Ferreteria Central", import: 1_284, data: "2026-10-28", pas: 2, albarans: 3, repartida: true },
  { num: "2026-0912", proveidor: "Instal·lacions Gil", import: 54_100, data: "2026-10-15", pas: 1, albarans: 0 },
  { num: "FV-778", proveidor: "Ferros Lòria", import: 22_960, data: "2026-09-30", pas: 1, albarans: 5 },
];

export const activitat = [
  { quan: "Avui", que: "Certificació de novembre preparada · 70%", qui: "Jordi Vidal" },
  { quan: "Ahir", que: "Factura F-26/1184 aprovada per direcció", qui: "Benito" },
  { quan: "28 oct", que: "Ferreteria Central repartida entre 3 obres", qui: "Assistent" },
  { quan: "24 oct", que: "Contracte Clima Valira enviat a signar", qui: "Administració" },
  { quan: "15 oct", que: "Certificació d'octubre validada per l'arquitecte", qui: "Estudi Riba" },
];

export const dadesNecessaries = [
  {
    entitat: "Projecte d'arquitecte",
    camps: "Memòria de qualitat, amidaments, plànols",
    font: "Arquitecte · 3 carpetes",
    estat: "Pendent",
    accio: "Exemple real (Jennifer)",
  },
  {
    entitat: "Capítols i partides",
    camps: "Codi, descripció, unitat, quantitat, família",
    font: "BC3 / Excel · SQL",
    estat: "Pendent",
    accio: "Accés de lectura al SQL",
  },
  {
    entitat: "Preus de referència",
    camps: "Partida, preu tancat, industrial, obra, data",
    font: "SQL històric",
    estat: "Pendent",
    accio: "Accés de lectura al SQL",
  },
  {
    entitat: "Industrials",
    camps: "Nom, CIF, famílies, contacte, obres",
    font: "SQL · clients/proveïdors",
    estat: "Pendent",
    accio: "Accés de lectura al SQL",
  },
  {
    entitat: "Ofertes d'industrials",
    camps: "Partides, preu, termini, format original",
    font: "Correu · SharePoint",
    estat: "Pendent",
    accio: "5–10 ofertes d'una obra",
  },
  {
    entitat: "Comparatiu",
    camps: "Equivalència partida–oferta, seleccionat",
    font: "Plantilla Excel",
    estat: "Pendent",
    accio: "Comparatiu d'exemple",
  },
  {
    entitat: "Full de tancament",
    camps: "Mesos, persones, indirectes, K, benefici",
    font: "Plantilla Excel",
    estat: "Pendent",
    accio: "Full d'exemple",
  },
  {
    entitat: "Oferta al client",
    camps: "Import, IGI, forma de pagament, retenció, estat",
    font: "SQL · Golden",
    estat: "Definit",
    accio: "Model de contracte",
  },
];

export function getObra(id: string) {
  return obres.find((o) => o.id === id);
}

export function getEstudi(id: string) {
  return estudis.find((e) => e.id === id);
}
