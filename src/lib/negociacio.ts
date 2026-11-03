import { electric } from "@/lib/estudi-run";
import { eur, eurPrecise, num } from "@/lib/format";

export type Qui = "besoli" | "efhys";

export const parts = {
  besoli: { nom: "Besolí", complet: "Elèctrica Marcel Besolí", id: "electrica-marcel-besoli", partides: electric.besoli.partides },
  efhys: { nom: "EFHYS", complet: "EFHYS", id: "efhys", partides: electric.efhys.partides },
} as const;

const nomCapitol = (c: string) => {
  const [codi, nom = ""] = c.split(/\s*:\s*/);
  const net = nom.toLowerCase();
  return { codi: codi.trim(), nom: net.charAt(0).toUpperCase() + net.slice(1) };
};

export const capitols = electric.perCapitol
  .map((c, i) => {
    const { codi, nom } = nomCapitol(c.capitol);
    const guanya: Qui = c.besoli <= c.efhys ? "besoli" : "efhys";
    return {
      key: `${codi}-${i}`,
      codi,
      nom,
      linies: c.linies,
      besoli: Math.round(c.besoli),
      efhys: Math.round(c.efhys),
      millor: Math.round(Math.min(c.besoli, c.efhys)),
      guanya,
      delta: Math.abs(Math.round(c.efhys) - Math.round(c.besoli)),
    };
  })
  .sort((a, b) => b.delta - a.delta);

export type Capitol = (typeof capitols)[number];

export const domotica = { partides: electric.omeses.length, import: Math.round(electric.omesesImport) };

// Each industrial is asked to match the other where the other is cheaper; never a linear discount.
const peticions = (qui: Qui) =>
  capitols
    .filter((c) => c.guanya !== qui)
    .map((c) => ({ key: c.key, nom: c.nom, actual: c[qui], objectiu: c.millor, rebaixa: c[qui] - c.millor }));

export const peticionsBesoli = peticions("besoli");
export const peticionsEfhys = peticions("efhys");

const suma = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

// Whole euros everywhere so every list adds up to its total.
const rebaixaBesoli = suma(peticionsBesoli.map((p) => p.rebaixa));
const besoli = Math.round(electric.besoli.total);

export const totals = {
  efhysBrut: Math.round(electric.efhys.total),
  efhysReal: Math.round(electric.efhysNormalitzat),
  besoli,
  objectiu: besoli - rebaixaBesoli,
  rebaixaBesoli,
  rebaixaEfhys: suma(peticionsEfhys.map((p) => p.rebaixa)),
};

export const estalvi = rebaixaBesoli;
export const estalviPct = (estalvi / totals.besoli) * 100;

const curt: Record<number, string> = {
  5: "Quadre elèctric de doble aïllament",
  21: "Tub IRL rígid Ø20 mm",
  6: "Conductor de coure 1×1,5 mm²",
  7: "Conductor de coure 1×2,5 mm²",
  55: "Mòdul LED infinity 1120 mm",
  24: "Separador metàl·lic de safata",
  114: "Cable U/UTP de 4 parells",
  78: "Tira LED 9,6 W/m",
};

export const linies = electric.linies.map((l) => ({
  n: l.n,
  nom: curt[l.n] ?? l.desc,
  desc: l.desc,
  unitat: l.unitat.replace(/\.$/, ""),
  quantitat: l.quantitat,
  besoli: l.besoli,
  efhys: l.efhys,
  guanya: (l.besoli <= l.efhys ? "besoli" : "efhys") as Qui,
  impacte: Math.abs(l.impacte),
}));

const linia = (p: { nom: string; actual: number; objectiu: number }) =>
  `- ${p.nom}: ${eur(p.actual)} → ${eur(p.objectiu)}`;

const exemple = (qui: Qui) => {
  const l = linies.find((x) => x.guanya !== qui);
  return l
    ? `Exemple: ${l.nom.toLowerCase()}, ${num(l.quantitat)} ${l.unitat}, ens el poseu a ${eurPrecise(l[qui])}/${l.unitat} i tenim preu de ${eurPrecise(l[qui === "besoli" ? "efhys" : "besoli"])}/${l.unitat}.`
    : "";
};

const comu =
  "No demanem un descompte lineal: només els capítols on tenim un preu millor d'un altre industrial, i mantenim la resta. No diguis qui és l'altre industrial. To cordial i directe, en català, signa Marta Pujal (Construccions Pujal) i demana resposta abans del 13 de novembre. Els imports són a l'euro i quadren; no els recalculis.";

export const promptBesoli = [
  `Redacta un correu a ${parts.besoli.complet} per negociar la seva oferta d'instal·lació elèctrica de Xalets Les Pedrasses, habitatge 1 (${eur(totals.besoli)}).`,
  `Volem que iguali aquests ${peticionsBesoli.length} capítols:`,
  ...peticionsBesoli.map(linia),
  `Total: −${eur(totals.rebaixaBesoli)}, oferta objectiu ${eur(totals.objectiu)}.`,
  exemple("besoli"),
  comu,
].join("\n");

export const promptEfhys = [
  `Redacta un correu a ${parts.efhys.complet} sobre la seva oferta d'instal·lació elèctrica de Xalets Les Pedrasses, habitatge 1 (${eur(totals.efhysBrut)}).`,
  `1. L'oferta no valora ${domotica.partides} partides de domòtica (quadre de domòtica, miniserver i extensions Loxone, font d'alimentació...). Demana que les valori.`,
  `2. Volem que iguali aquests ${peticionsEfhys.length} capítols:`,
  ...peticionsEfhys.map(linia),
  `Total capítols: −${eur(totals.rebaixaEfhys)}.`,
  exemple("efhys"),
  comu,
].join("\n");

export const promptTots = `${promptBesoli}\n\nDesprés, en un segon correu:\n${promptEfhys}`;
