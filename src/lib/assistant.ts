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
  getObra,
  indirectesMensuals,
  obres,
  passosAprovacio,
} from "@/lib/data";
import { date, eur, eurPrecise, pct } from "@/lib/format";
import { pctSigne, preu, resumElement, resumPreus, volumLabel } from "@/lib/preus";

// Tool results double as UI cards: the chat renders `rows` and `links` as-is.
export type Card = {
  title: string;
  rows: { label: string; value: string; hint?: string }[];
  links?: { label: string; href: string }[];
};

export function contextFor(pathname: string) {
  const [, section, id] = pathname.split("/");
  if (section === "obres" && id) return { obraId: id };
  if (section === "pressupostos" && id && id !== "nou") return { estudiId: id };
  if (section === "preus" && id) return { elementId: id };
  return {};
}

export function suggestionsFor(pathname: string): string[] {
  const { obraId, estudiId } = contextFor(pathname);
  if (obraId)
    return [
      "Com va el marge d'aquesta obra?",
      "Quines factures falten per aprovar?",
      "Redacta un correu a Clima Valira perquè signin el contracte",
    ];
  if (estudiId)
    return [
      "Quines discrepàncies hi ha als amidaments?",
      "Quina és la millor oferta de cada partida?",
      "Quin preu he de posar per treure un 3% net?",
    ];
  if (pathname.startsWith("/preus"))
    return ["A quant tanquem el formigó HA-25?", "On podem agrupar volum aquest trimestre?"];
  return [
    "Què tinc pendent avui?",
    "Quina obra té pitjor marge?",
    "Quant tenim pendent de cobrar?",
  ];
}

export function resumObres(): Card {
  const sorted = [...obres].sort((a, b) => a.margePrevist - b.margePrevist);
  return {
    title: "Obres per marge previst",
    rows: sorted.map((o) => ({
      label: o.nom,
      value: pct(o.margePrevist),
      hint: `${o.estat} · estudi ${pct(o.margeEstudi)} · ${pct(o.certificat * 100, 0)} certificat`,
    })),
    links: [{ label: `Obrir ${sorted[0].nom}`, href: `/obres/${sorted[0].id}` }],
  };
}

export function detallObra(id: string): Card | { error: string } {
  const o = getObra(id);
  if (!o) return { error: `No existeix l'obra ${id}. Obres: ${obres.map((x) => x.id).join(", ")}` };
  return {
    title: `${o.nom} · ${o.obs}`,
    rows: [
      { label: "Marge estudi → previst", value: `${pct(o.margeEstudi)} → ${pct(o.margePrevist)}` },
      { label: "Import", value: eur(o.importEstudi), hint: o.participacio < 100 ? `UTE ${o.participacio}%` : undefined },
      { label: "Certificat", value: pct(o.certificat * 100, 0) },
      { label: "Facturat / cobrat", value: `${eur(o.facturat)} / ${eur(o.cobrat)}` },
      { label: "Pendent de contractar", value: eur(o.pendentContractar) },
      { label: "Cap d'obra", value: o.capObra },
    ],
    links: [{ label: "Obrir obra", href: `/obres/${o.id}` }],
  };
}

export function facturesPendents(): Card {
  const pendents = factures.filter((f) => f.pas < passosAprovacio.length);
  return {
    title: `${pendents.length} factures per aprovar · ${eur(pendents.reduce((s, f) => s + f.import, 0))}`,
    rows: pendents.map((f) => ({
      label: `${f.proveidor} · ${f.num}`,
      value: eur(f.import),
      hint: `falta ${passosAprovacio[f.pas]} · ${f.albarans} albarans`,
    })),
    links: [{ label: "Anar a factures", href: "/obres/aixovall" }],
  };
}

export function pendentCobrar(): Card {
  const rows = obres
    .map((o) => ({ o, pendent: o.facturat - o.cobrat }))
    .filter((r) => r.pendent > 0)
    .sort((a, b) => b.pendent - a.pendent);
  return {
    title: `Pendent de cobrar · ${eur(rows.reduce((s, r) => s + r.pendent, 0))}`,
    rows: rows.map(({ o, pendent }) => ({ label: o.nom, value: eur(pendent) })),
  };
}

export function contractesPendents(): Card {
  const pendents = contractes.filter((c) => !c.signat);
  return {
    title: `${pendents.length} contractes sense signar`,
    rows: pendents.map((c) => ({
      label: c.industrial,
      value: eur(c.import),
      hint: `${c.familia} · ${c.pagament}${c.retencio ? " · retenció 5%" : ""}`,
    })),
  };
}

export function estudisEnCurs(): Card {
  const sorted = [...estudis].sort((a, b) => a.lliurament.localeCompare(b.lliurament));
  return {
    title: "Estudis per data de lliurament",
    rows: sorted.map((e) => ({
      label: e.nom,
      value: date(e.lliurament),
      hint: `${etapesEstudi[e.etapa]} · ${eur(e.importEstimat)}`,
    })),
    links: [{ label: "Obrir pressupostos", href: "/pressupostos" }],
  };
}

export function millorsOfertes(): Card {
  return {
    title: "Millor oferta per partida",
    rows: comparatiu.map((p) => {
      const best = [...p.ofertes].sort((a, b) => a.preu - b.preu)[0];
      const delta = ((best.preu - p.preuRef) / p.preuRef) * 100;
      return {
        label: `${p.descripcio} · ${best.industrial}`,
        value: `${eurPrecise(best.preu)}/${p.unitat}`,
        hint: `${delta > 0 ? "+" : ""}${delta.toFixed(1)}% vs referència${best.nota ? ` · ${best.nota}` : ""}`,
      };
    }),
    links: [{ label: "Veure comparatiu", href: "/pressupostos/placa-major" }],
  };
}

export function discrepanciesAmidaments(): Card {
  return {
    title: `${discrepancies.length} discrepàncies · ${eur(discrepancies.reduce((s, d) => s + d.impacte, 0))}`,
    rows: discrepancies.map((d) => ({ label: d.partida, value: eur(d.impacte), hint: d.detall })),
  };
}

export function calcularPreu({
  margeNet,
  mesos = 14,
  persones = 3,
}: {
  margeNet: number;
  mesos?: number;
  persones?: number;
}): Card {
  const indirectes =
    mesos * indirectesMensuals.reduce((s, i) => s + i.import, 0) + persones * mesos * costPersonaMes;
  const preu = (costDirecteEstudi + indirectes) / (1 - despesesGenerals - margeNet / 100);
  return {
    title: `Preu d'oferta per a un ${pct(margeNet)} net · ${eur(preu)}`,
    rows: [
      { label: "Cost directe", value: eur(costDirecteEstudi) },
      { label: "Indirectes", value: eur(indirectes), hint: `${mesos} mesos · ${persones} persones` },
      { label: "Despeses generals", value: pct(despesesGenerals * 100, 0) },
      { label: "K", value: (preu / costDirecteEstudi).toFixed(2) },
      { label: "Acompanyant (+10%)", value: eur(preu * 1.1) },
    ],
  };
}

export function dadesPendents(): Card {
  const pendents = dadesNecessaries.filter((d) => d.estat === "Pendent");
  return {
    title: `${pendents.length} fonts de dades pendents`,
    rows: pendents.map((d) => ({ label: d.entitat, value: d.font, hint: d.accio })),
  };
}

export function preuReferencia(id: string): Card | { error: string } {
  const r = resumElement(id);
  if (!r) return { error: `No existeix l'element ${id}` };
  return {
    title: `${r.nom} · referència ${preu(r.referencia)}/${r.unitat}`,
    rows: [
      { label: "Rang 6 mesos", value: `${preu(r.rang[0])} – ${preu(r.rang[1])}` },
      { label: "Últim tancat", value: preu(r.ultimPreu), hint: `${r.ultimIndustrial} · ${date(r.ultimaData)}` },
      { label: "Millor industrial", value: preu(r.millorPreu), hint: r.millorIndustrial },
      { label: "Pagat de més · 12 mesos", value: eur(r.sobrecost12) },
      {
        label: "Agrupant volum",
        value: `−${eur(r.agrupar.estalvi)}`,
        hint: `${r.agrupar.nObres} obres · ${volumLabel(r.agrupar.volum, r.unitat)} · ${pctSigne(-r.agrupar.descompte)}`,
      },
    ],
    links: [{ label: "Obrir preus", href: `/preus/${r.id}` }],
  };
}

export function oportunitatsVolum(): Card {
  const top = [...resumPreus].sort((a, b) => b.agrupar.estalvi - a.agrupar.estalvi).slice(0, 5);
  return {
    title: `Agrupar volum · ${eur(top.reduce((s, r) => s + r.agrupar.estalvi, 0))} d'estalvi`,
    rows: top.map((r) => ({
      label: r.nom,
      value: `−${eur(r.agrupar.estalvi)}`,
      hint: `${r.agrupar.nObres} obres · ${volumLabel(r.agrupar.volum, r.unitat)}`,
    })),
    links: [{ label: `Obrir ${top[0].nom}`, href: `/preus/${top[0].id}` }],
  };
}
