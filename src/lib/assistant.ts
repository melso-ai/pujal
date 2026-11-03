import {
  comparatiu,
  contractes,
  costDirecteEstudi,
  costPersonaMes,
  dadesNecessaries,
  despesesGenerals,
  discrepancies,
  estudis,
  etapesEstudi,
  factures,
  getEstudi,
  getObra,
  indirectesMensuals,
  obres,
  passosAprovacio,
} from "@/lib/data";
import { date, eur, eurPrecise, pct } from "@/lib/format";

export type Reply = {
  text: string;
  rows?: { label: string; value: string; hint?: string }[];
  links?: { label: string; href: string }[];
};

type Context = { obraId?: string; estudiId?: string };

export function contextFor(pathname: string): Context {
  const [, section, id] = pathname.split("/");
  if (section === "obres" && id) return { obraId: id };
  if (section === "pressupostos" && id) return { estudiId: id };
  return {};
}

export function suggestionsFor(pathname: string): string[] {
  const { obraId, estudiId } = contextFor(pathname);
  if (obraId)
    return [
      "Com va el marge d'aquesta obra?",
      "Quines factures falten per aprovar?",
      "Què queda per contractar?",
    ];
  if (estudiId)
    return [
      "Quines discrepàncies hi ha als amidaments?",
      "Quina és la millor oferta de cada partida?",
      "Quin preu dona un 3% net?",
    ];
  if (pathname.startsWith("/pressupostos"))
    return ["Quins estudis s'han de lliurar aviat?", "Quina és la millor oferta de cada partida?"];
  if (pathname.startsWith("/dades")) return ["Què ens falta per començar?"];
  return [
    "Quina obra té pitjor marge?",
    "Quant tenim pendent de cobrar?",
    "Quines factures falten per aprovar?",
  ];
}

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function answer(question: string, pathname: string): Reply {
  const q = normalize(question);
  const { obraId, estudiId } = contextFor(pathname);
  const obra = obraId ? getObra(obraId) : undefined;
  const estudi = getEstudi(estudiId ?? "placa-major");
  const has = (...words: string[]) => words.some((w) => q.includes(w));

  if (has("marge", "benefici")) {
    if (obra) {
      const delta = obra.margePrevist - obra.margeEstudi;
      return {
        text: `${obra.nom} preveu un marge del ${pct(obra.margePrevist)}, ${Math.abs(delta).toFixed(1)} punts ${delta < 0 ? "per sota" : "per sobre"} de l'estudi.`,
        rows: [
          { label: "Marge a l'estudi", value: pct(obra.margeEstudi) },
          { label: "Marge previst", value: pct(obra.margePrevist) },
          { label: "Certificat", value: pct(obra.certificat * 100, 0) },
          { label: "Pendent de contractar", value: eur(obra.pendentContractar) },
        ],
      };
    }
    const sorted = [...obres].sort((a, b) => a.margePrevist - b.margePrevist);
    return {
      text: `La que va pitjor és ${sorted[0].nom}, amb un ${pct(sorted[0].margePrevist)} previst.`,
      rows: sorted.map((o) => ({
        label: o.nom,
        value: pct(o.margePrevist),
        hint: `estudi ${pct(o.margeEstudi)}`,
      })),
      links: [{ label: `Obrir ${sorted[0].nom}`, href: `/obres/${sorted[0].id}` }],
    };
  }

  if (has("factur", "aprova")) {
    const pendents = factures.filter((f) => f.pas < passosAprovacio.length);
    return {
      text: `Hi ha ${pendents.length} factures pendents d'aprovar per ${eur(pendents.reduce((s, f) => s + f.import, 0))}.`,
      rows: pendents.map((f) => ({
        label: `${f.proveidor} · ${f.num}`,
        value: eur(f.import),
        hint: `falta ${passosAprovacio[f.pas]}`,
      })),
      links: obra ? undefined : [{ label: "Obrir Aixovall", href: "/obres/aixovall" }],
    };
  }

  if (has("cobra", "cobrar")) {
    const rows = obres
      .map((o) => ({ o, pendent: o.facturat - o.cobrat }))
      .filter((r) => r.pendent > 0)
      .sort((a, b) => b.pendent - a.pendent);
    return {
      text: `Tenim ${eur(rows.reduce((s, r) => s + r.pendent, 0))} facturats i pendents de cobrar.`,
      rows: rows.map(({ o, pendent }) => ({ label: o.nom, value: eur(pendent) })),
    };
  }

  if (has("contract")) {
    const pendents = contractes.filter((c) => !c.signat);
    return {
      text: obra
        ? `Queden ${eur(obra.pendentContractar)} per contractar a ${obra.nom}, i ${pendents.length} contractes sense signar.`
        : `Hi ha ${pendents.length} contractes sense signar.`,
      rows: pendents.map((c) => ({ label: c.industrial, value: eur(c.import), hint: c.familia })),
    };
  }

  if (has("oferta", "formigo", "millor", "compar", "industrial")) {
    return {
      text: `La millor oferta de cada partida a ${estudi?.nom ?? "l'estudi"}:`,
      rows: comparatiu.map((p) => {
        const best = [...p.ofertes].sort((a, b) => a.preu - b.preu)[0];
        return {
          label: `${p.descripcio} · ${best.industrial}`,
          value: `${eurPrecise(best.preu)}/${p.unitat}`,
          hint: best.nota ?? `ref. ${eurPrecise(p.preuRef)}`,
        };
      }),
      links: estudi ? [{ label: "Veure comparatiu", href: `/pressupostos/${estudi.id}` }] : undefined,
    };
  }

  if (has("discrep", "amidament", "planol", "error")) {
    return {
      text: `He trobat ${discrepancies.length} discrepàncies entre amidaments, plànols i memòria. Impacte total: ${eur(discrepancies.reduce((s, d) => s + d.impacte, 0))}.`,
      rows: discrepancies.map((d) => ({ label: d.partida, value: eur(d.impacte), hint: d.detall })),
    };
  }

  if (has("preu", "3%", "net", " k ", "tancament")) {
    const mesos = 14;
    const persones = 3;
    const indirectes =
      mesos * indirectesMensuals.reduce((s, i) => s + i.import, 0) +
      persones * mesos * costPersonaMes;
    const preu = (costDirecteEstudi + indirectes) / (1 - despesesGenerals - 0.03);
    return {
      text: `Per arribar a un 3% net, l'oferta hauria de ser de ${eur(preu)}.`,
      rows: [
        { label: "Cost directe", value: eur(costDirecteEstudi) },
        { label: "Indirectes", value: eur(indirectes), hint: `${mesos} mesos · ${persones} persones` },
        { label: "Despeses generals", value: pct(despesesGenerals * 100, 0) },
        { label: "K", value: (preu / costDirecteEstudi).toFixed(2) },
      ],
    };
  }

  if (has("estudi", "lliura", "venc", "aviat", "setmana")) {
    const sorted = [...estudis].sort((a, b) => a.lliurament.localeCompare(b.lliurament));
    return {
      text: `El proper lliurament és ${sorted[0].nom}, el ${date(sorted[0].lliurament)}.`,
      rows: sorted.slice(0, 4).map((e) => ({
        label: e.nom,
        value: date(e.lliurament),
        hint: etapesEstudi[e.etapa],
      })),
      links: [{ label: "Obrir pressupostos", href: "/pressupostos" }],
    };
  }

  if (has("dades", "falta", "comencar", "sql")) {
    const pendents = dadesNecessaries.filter((d) => d.estat === "Pendent");
    return {
      text: `Falten ${pendents.length} fonts de dades. La majoria depenen de l'accés de lectura a la base de dades SQL.`,
      rows: pendents.map((d) => ({ label: d.entitat, value: d.font, hint: d.accio })),
    };
  }

  return {
    text: "Encara sóc un prototip i només responc sobre les dades d'aquesta demo. Prova amb una d'aquestes preguntes:",
    rows: suggestionsFor(pathname).map((s) => ({ label: s, value: "" })),
  };
}
