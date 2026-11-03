export type Area = "Estudis" | "Compres" | "Obra" | "Administració";

export type Versio = { v: number; autor: string; data: string; canvi: string };

export type Skill = {
  id: string;
  titol: string;
  area: Area;
  owner: string;
  editat: string;
  usos: number;
  fitxer: string;
  pregunta: string;
  versions: Versio[];
  text: string;
};

export const arees: Area[] = ["Estudis", "Compres", "Obra", "Administració"];

export const EDITOR = "Marta Pujal";

const v1 = (canvi = "Primera versió, a partir del kickoff"): Versio => ({
  v: 1,
  autor: "Albert · Melso",
  data: "2026-10-15T12:00:00",
  canvi,
});

export const skills: Skill[] = [
  {
    id: "fer-un-estudi",
    titol: "Fer un estudi",
    area: "Estudis",
    owner: "Jennifer",
    editat: "2026-10-30T12:00:00",
    usos: 41,
    fitxer: "skills/estudis/fer-un-estudi.md",
    pregunta: "Hi ha discrepàncies entre els amidaments i els plànols de Xalets Les Pedrasses? Quines ens poden costar més diners?",
    versions: [
      v1(),
      { v: 2, autor: "Jennifer", data: "2026-10-22T12:00:00", canvi: "Capítols d'instal·lacions separats" },
      { v: 3, autor: "Jennifer", data: "2026-10-30T12:00:00", canvi: "Regla: mana el plànol" },
    ],
    text: `## Quan s'aplica
Arriba una petició d'estudi d'un client o d'un arquitecte.

## Passos
1. Rebre les 3 carpetes de l'arquitecte: **memòria de qualitats**, **amidaments** i **plànols**. Si en falta una, demanar-la abans de començar.
2. Contrastar amidaments amb plànols, capítol per capítol. Anotar cada diferència amb la cota del plànol.
3. Muntar els capítols: estructura; instal·lacions (elèctrica, fontaneria, clima); acabats (fusteria, rajola, cuina).
4. Demanar oferta als industrials de cada capítol amb la memòria de qualitats i els amidaments corregits.
5. Recopilar les ofertes al comparatiu i passar al full de tancament.

## Regles
- Mana el plànol. Un mur de 2 m a l'amidament i 2,5 m al plànol es pressuposta a 2,5 m i s'avisa l'arquitecte: la diferència són milers d'euros.
- Mínim 2 ofertes comparables per partida.
- Conversió històrica: ~20% (1 de cada 5 estudis). Dimensionar les hores d'estudi en conseqüència.

## Excepcions
- Sense amidaments de l'arquitecte: els fa Pujal sobre plànol i l'estudi es marca com a amidament propi.
- Client que s'ha de tenir en compte però sense capacitat: veure **Acompanyar**.`,
  },
  {
    id: "full-de-tancament",
    titol: "Full de tancament i K",
    area: "Estudis",
    owner: "Marta Pujal",
    editat: "2026-11-02T12:00:00",
    usos: 33,
    fitxer: "skills/estudis/full-de-tancament.md",
    pregunta: "Quin preu d'oferta necessitem per a un 3% de benefici net si l'obra dura 12 mesos? I si en dura 24?",
    versions: [
      v1(),
      { v: 2, autor: "Jennifer", data: "2026-10-24T12:00:00", canvi: "Llista completa d'indirectes" },
      { v: 3, autor: "Marta Pujal", data: "2026-11-02T12:00:00", canvi: "Objectiu 20% brut, 2-3% net" },
    ],
    text: `## Quan s'aplica
L'estudi té totes les ofertes i cal fixar el preu de venda.

## Passos
1. Sumar el **cost directe**: ofertes adjudicables, materials i mà d'obra pròpia.
2. Fixar la durada de l'obra en mesos segons la planificació.
3. Afegir els **indirectes** per mes d'obra: grua, personal d'obra, cap de producció, administratius, vehicles, lloguer d'oficina, dietes, sanitaris i WC d'obra, permisos.
4. Aplicar la **K** sobre la venda.
5. Revisar el resultat: ~20% de marge brut i 2-3% de benefici net.
6. Presentar al client un preu tancat.

## Regles
- Els indirectes depenen dels mesos: la grua de 12 mesos no costa el mateix que la de 24. Si canvia el termini, es refà el full.
- La K és un coeficient sobre la venda, no sobre el cost.
- Al client, sempre un preu fix. Mai una forquilla.

## Excepcions
- Obres a acompanyar: veure **Acompanyar** (+10%).
- UTE: el full es fa sobre l'obra sencera i després s'aplica el % de Pujal.`,
  },
  {
    id: "acompanyar",
    titol: "Acompanyar",
    area: "Estudis",
    owner: "Marta Pujal",
    editat: "2026-10-27T12:00:00",
    usos: 6,
    fitxer: "skills/estudis/acompanyar.md",
    pregunta: "Calcula el preu d'oferta per a un 3% net i digues quin preu presentaríem si l'estudi és per acompanyar.",
    versions: [
      v1(),
      { v: 2, autor: "Jennifer", data: "2026-10-21T12:00:00", canvi: "Fer l'estudi complet igualment" },
      { v: 3, autor: "Marta Pujal", data: "2026-10-27T12:00:00", canvi: "Recalcular si s'allibera capacitat" },
    ],
    text: `## Quan s'aplica
Pujal no té capacitat per fer l'obra, però el client és important i ens ha de seguir tenint en compte.

## Passos
1. Confirmar amb gerència que l'estudi és per acompanyar.
2. Fer l'estudi complet, com qualsevol altre.
3. Tancar el full de tancament amb la K habitual.
4. Presentar el preu **~10% per sobre** del resultat.

## Regles
- Mai rebutjar un estudi a un client que ens interessa: es presenta, però més car.
- L'estudi ha de ser rigorós: si ens l'adjudiquen, s'ha de poder fer amb benefici.
- Marcar l'estudi com a "acompanyar" perquè no compti a la conversió.

## Excepcions
- Si s'allibera capacitat abans del lliurament, es recalcula sense el 10%.`,
  },
  {
    id: "comparatiu-industrials",
    titol: "Comparatiu i negociació amb industrials",
    area: "Compres",
    owner: "Jennifer",
    editat: "2026-10-29T12:00:00",
    usos: 28,
    fitxer: "skills/compres/comparatiu-industrials.md",
    pregunta: "Compara Besoli i EFHYS a l'electricitat de Xalets Les Pedrasses partida per partida: què no inclouen i on podem negociar?",
    versions: [
      v1(),
      { v: 2, autor: "Jennifer", data: "2026-10-23T12:00:00", canvi: "Dos comparatius: abans i després d'adjudicar" },
      { v: 3, autor: "Jennifer", data: "2026-10-29T12:00:00", canvi: "Revisar sempre els \"no inclou\"" },
    ],
    text: `## Quan s'aplica
Dos moments: abans de lliurar l'oferta al client i després de l'adjudicació.

## Passos
1. **Primer comparatiu**, abans de l'oferta: ofertes de cada capítol amb preus indicatius per tancar l'estudi.
2. Després de l'adjudicació, **segon comparatiu** amb les ofertes actualitzades.
3. Negociar partida per partida amb cada industrial.
4. Adjudicar i passar a contracte.

## Regles
- Mai un descompte lineal (un -5% a tot). Es negocia cada partida.
- Molts industrials copien el mateix preu a totes les constructores: comparar també amb el nostre històric.
- Llegir la descripció tècnica per comparar elements equivalents: manetes, cuines per tipologia d'habitatge, rajola Porcelanosa vs altres marques.
- Revisar sempre els "no inclou": una oferta barata amb exclusions pot sortir més cara.

## Excepcions
- Partides amb pocs proveïdors (formigó: 2 a Andorra): negociar per volum anual, veure **Compres agrupades**.`,
  },
  {
    id: "preu-de-referencia",
    titol: "Preu de referència per element",
    area: "Compres",
    owner: "Jennifer",
    editat: "2026-10-28T12:00:00",
    usos: 52,
    fitxer: "skills/compres/preu-de-referencia.md",
    pregunta: "Estem pagant el formigó HA-25 per sobre del que Pujal ha tancat històricament? Quin és el preu de referència?",
    versions: [
      v1(),
      { v: 2, autor: "Jennifer", data: "2026-10-20T12:00:00", canvi: "Comparar sempre en la mateixa unitat" },
      { v: 3, autor: "Marta Pujal", data: "2026-10-28T12:00:00", canvi: "Alerta si paguem més que l'històric" },
    ],
    text: `## Quan s'aplica
Abans de tancar qualsevol compra o contracte amb un industrial.

## Passos
1. Identificar l'element: formigó HA-25, acer B500S, rajola porcellànica, cuina equipada...
2. Buscar el preu que Pujal ha tancat per a aquest element, per obra i data.
3. Comparar el preu ofert amb la referència.
4. Si és més car, avisar abans de signar i negociar amb el preu històric a la mà.

## Regles
- Referència = preu tancat real de Pujal, no preu de tarifa.
- **Alerta** si paguem més que l'històric: cal justificar-ho (volum, termini, qualitat) o renegociar.
- Comparar en la mateixa unitat (m³, kg, m², ut).

## Excepcions
- Element nou sense historial: la primera compra fixa la referència.
- Pujades de material documentades (acer, coure): ajustar la referència a la data.`,
  },
  {
    id: "compres-agrupades",
    titol: "Compres agrupades",
    area: "Compres",
    owner: "Marta Pujal",
    editat: "2026-10-26T12:00:00",
    usos: 9,
    fitxer: "skills/compres/compres-agrupades.md",
    pregunta: "Quin volum podem agrupar entre obres els propers mesos i quant estalviaríem negociant-lo conjuntament?",
    versions: [
      v1(),
      { v: 2, autor: "Jennifer", data: "2026-10-22T12:00:00", canvi: "Volum a partir de la planificació d'obres" },
      { v: 3, autor: "Marta Pujal", data: "2026-10-26T12:00:00", canvi: "Començar pel formigó" },
    ],
    text: `## Quan s'aplica
A l'inici de cada any i quan entra una obra nova a planificació.

## Passos
1. Sumar el volum previst de cada material de totes les obres, a partir de la planificació.
2. Començar pel **formigó**: a Andorra només hi ha 2 proveïdors.
3. Negociar un preu anual conjunt amb el volum total.
4. Aplicar el preu pactat a totes les obres.

## Regles
- Es negocia per volum de l'empresa, no per obra.
- Amb 2 proveïdors, mantenir-los tots dos actius: no dependre d'un de sol.
- Revisar desviacions de volum cada trimestre.

## Excepcions
- Obres en UTE: el volum compta només si les compres les fa Pujal.`,
  },
  {
    id: "certificacio-mensual",
    titol: "Certificació mensual",
    area: "Obra",
    owner: "Caps d'obra",
    editat: "2026-10-31T12:00:00",
    usos: 18,
    fitxer: "skills/obra/certificacio-mensual.md",
    pregunta: "Quant tenim facturat i pendent de cobrar per obra aquest mes?",
    versions: [
      v1(),
      { v: 2, autor: "Caps d'obra", data: "2026-10-24T12:00:00", canvi: "Sense signatura de la DF no es factura" },
      { v: 3, autor: "Benito", data: "2026-10-31T12:00:00", canvi: "Retenció del 5% i UTE" },
    ],
    text: `## Quan s'aplica
Cada final de mes, a cada obra en curs.

## Passos
1. El cap d'obra mesura la **producció** del mes.
2. Es prepara la **certificació** amb les partides executades.
3. L'arquitecte extern (**direcció facultativa**) la valida i la signa.
4. Administració emet la **factura**: import certificat + IGI 4,5%, menys la retenció del 5% si el contracte ho preveu.
5. Seguiment del cobrament.

## Regles
- Sense la signatura de la DF no es factura.
- IGI: 4,5% sobre l'import certificat.
- Retenció de garantia del 5% només si ho diu el contracte. Es cobra un any després d'acabar l'obra.
- En UTE, cada empresa factura el seu %: 33%, 50% o 51% segons l'acord.

## Excepcions
- Si la DF no signa abans de final de mes, la certificació passa al mes següent.`,
  },
  {
    id: "aprovacio-factures",
    titol: "Aprovació de factures de cost",
    area: "Administració",
    owner: "Benito",
    editat: "2026-11-02T12:00:00",
    usos: 64,
    fitxer: "skills/administracio/aprovacio-factures.md",
    pregunta: "Quines factures de cost estan pendents d'aprovar i a quin pas del circuit són?",
    versions: [
      v1(),
      { v: 2, autor: "Benito", data: "2026-10-25T12:00:00", canvi: "Els 4 passos, en ordre" },
      { v: 3, autor: "Marta Pujal", data: "2026-11-02T12:00:00", canvi: "Repartiment de factures transversals" },
    ],
    text: `## Quan s'aplica
Cada factura d'un proveïdor o industrial que entra a Pujal.

## Passos
1. **Administració** comprova els albarans i la registra.
2. El **cap d'obra** la valida.
3. **Administració** signa la conformitat.
4. **Benito** la signa i autoritza el pagament.

## Regles
- Cap factura es paga sense els 4 passos.
- Sense albarà, no s'entra.
- Factures transversals (ferreteria, material comú) es reparteixen entre obres per %.

## Excepcions
- Si la factura no quadra amb l'albarà, torna al proveïdor abans del pas 2.`,
  },
];

export const getSkill = (id: string) => skills.find((s) => s.id === id);
export const perArea = (a: Area) => skills.filter((s) => s.area === a);
