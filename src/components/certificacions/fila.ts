import { pp, type Fila } from "@/components/certificacions/estat";
import {
  AVUI,
  avancObra,
  dia,
  getObraCert,
  totals,
  type Certificacio,
  type ObraCert,
} from "@/lib/certificacions";
import { eur } from "@/lib/format";

const DIA = 86_400_000;

export function fa(iso: string) {
  const n = Math.round((new Date(AVUI).getTime() - new Date(iso).getTime()) / DIA);
  return n <= 0 ? "avui" : n === 1 ? "ahir" : `fa ${n} dies`;
}

export function estatLinia(c: Certificacio, o: ObraCert) {
  switch (c.estat) {
    case "Producció":
      return { linia: `Producció en curs · ${o.capObra}`, to: "text-muted-foreground" };
    case "Certificació":
      return { linia: `Llesta per enviar · ${o.capObra}`, to: "text-brand-text" };
    case "Arquitecte":
      return c.signada
        ? { linia: `Signada ${dia(c.signada)} · per facturar`, to: "text-brand-text" }
        : { linia: `Esperant ${o.signant} · ${fa(c.enviada ?? AVUI)}`, to: "text-warning" };
    case "Facturada":
      return { linia: `Per cobrar · ${c.factura}`, to: "text-muted-foreground" };
    case "Cobrada":
      return { linia: `Cobrada ${dia(c.cobrada ?? AVUI)}`, to: "text-success" };
  }
}

export function fila(c: Certificacio): Fila {
  const o = getObraCert(c.obraId)!;
  const a = avancObra(c);
  return {
    id: c.id,
    nom: o.nom,
    ute: o.participacio < 100 ? `UTE ${o.participacio}%` : undefined,
    estat: c.estat,
    ...estatLinia(c, o),
    import: eur(totals(c).pujal),
    mes: pp(a.mes * 100),
    anterior: a.anterior * 100,
    origen: a.origen * 100,
  };
}
