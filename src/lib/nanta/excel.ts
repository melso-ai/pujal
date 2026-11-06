// Builds the invitation workbooks in Pujal's Agudes format. The ExcelJS module is passed in, so it only loads on demand.
import type { Fase, Seccio } from "./model";

type WS = {
  getCell: (r: number, c: number) => { value: unknown; font: unknown; fill: unknown; alignment: unknown; numFmt: string; border: unknown };
  getRow: (r: number) => { height: number };
  getColumn: (c: number) => { width: number };
  views: unknown[];
  pageSetup: unknown;
};
type WB = { addWorksheet: (n: string) => unknown; views: unknown[]; xlsx: { writeBuffer: () => Promise<ArrayBuffer | Uint8Array> } };

const EUR = '_-* #,##0.00\\ "€"_-;\\-* #,##0.00\\ "€"_-;_-* "-"??\\ "€"_-;_-@_-';
const fill = (argb: string) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const CYAN = fill("FF00B0F0");
const BANDA = fill("FF3B0D11");
const SUB = fill("FFF2F2F2");
const font = (size: number, extra: object = {}) => ({ name: "Calibri", size, ...extra });

const alcada = (text: string, ample = 62) => {
  const n = text.split("\n").reduce((s, p) => s + Math.max(1, Math.ceil(p.length / ample)), 0);
  return Math.min(409, 15.8 * n + 2);
};

function full(ws: WS, titol: string, fase: Fase, secs: Seccio[], texts: string[], nota: string) {
  const fila = (r: number, f: object) => { for (let c = 1; c <= 7; c++) ws.getCell(r, c).fill = f; };
  const a1 = ws.getCell(1, 1); a1.value = nota; a1.font = font(10, { italic: true, color: { argb: "FF808080" } });
  const a2 = ws.getCell(2, 1); a2.value = titol; a2.font = font(16, { bold: true });
  ws.getRow(2).height = 21;
  ["Codi", "Ut", "Concepte", "Localització", "Quantitat", "Preu", "Import"].forEach((h, i) => {
    const c = ws.getCell(4, i + 1);
    c.value = h;
    c.font = font(14, { bold: true });
    c.alignment = { horizontal: i >= 4 ? "right" : undefined, vertical: "middle", wrapText: true };
    c.border = { bottom: { style: "medium" } };
  });
  ws.getRow(4).height = 30;
  [13, 6, 62, 30, 12, 13, 15].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  ws.views = [{ state: "frozen", ySplit: 4 }];
  ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: "4:4" };
  const top = { vertical: "top" };
  const totals: string[] = [];
  let r = 5;
  for (const s of secs) {
    fila(r, BANDA);
    const t = ws.getCell(r, 1); t.value = s.titol; t.font = font(12, { bold: true, color: { argb: "FFFFFFFF" } });
    r++;
    const primera = r;
    let cap = "", sub = "";
    for (const { r: p, idx, q, loc } of s.linies) {
      const k = p.src + p.ch;
      if (k !== cap) {
        cap = k; sub = "";
        fila(r, CYAN);
        const a = ws.getCell(r, 1); a.value = p.ch; a.font = font(12, { bold: true });
        const b = ws.getCell(r, 3); b.value = p.chn; b.font = font(12, { bold: true });
        r++;
      }
      if (p.sub && p.sub !== sub) {
        sub = p.sub;
        fila(r, SUB);
        const b = ws.getCell(r, 3); b.value = sub; b.font = font(12, { bold: true });
        r++;
      }
      const a = ws.getCell(r, 1); a.value = p.c; a.font = font(12); a.alignment = top;
      const u = ws.getCell(r, 2); u.value = p.u; u.font = font(12); u.alignment = top;
      const n = ws.getCell(r, 3); n.value = p.n; n.font = font(12, { bold: true }); n.alignment = { wrapText: true, vertical: "top" };
      const l = ws.getCell(r, 4); l.value = loc; l.font = font(10, { color: { argb: "FF595959" } }); l.alignment = { wrapText: true, vertical: "top" };
      const qt = ws.getCell(r, 5); qt.value = q; qt.font = font(12); qt.numFmt = q <= 0.01 ? "0.000" : "#,##0.00"; qt.alignment = top;
      const pr = ws.getCell(r, 6); pr.font = font(12); pr.numFmt = EUR; pr.alignment = top;
      const im = ws.getCell(r, 7); im.value = { formula: `ROUND(E${r}*F${r},2)` }; im.font = font(12); im.numFmt = EUR; im.alignment = top;
      ws.getRow(r).height = Math.max(alcada(p.n), alcada(loc, 32));
      r++;
      const text = texts[idx];
      if (text) {
        const d = ws.getCell(r, 3); d.value = text; d.font = font(10, { color: { argb: "FF404040" } }); d.alignment = { wrapText: true, vertical: "top" };
        ws.getRow(r).height = alcada(text, 96);
        r++;
      }
    }
    const lab = ws.getCell(r, 3); lab.value = "Total apartat"; lab.font = font(12, { bold: true });
    const tot = ws.getCell(r, 7); tot.value = { formula: `SUM(G${primera}:G${r - 1})` }; tot.font = font(12, { bold: true }); tot.numFmt = EUR;
    totals.push(`G${r}`);
    r += 2;
  }
  const lab = ws.getCell(r, 3); lab.value = `TOTAL FASE ${fase}`; lab.font = font(13, { bold: true });
  const tot = ws.getCell(r, 7); tot.value = totals.length ? { formula: totals.join("+") } : 0; tot.font = font(13, { bold: true }); tot.numFmt = EUR;
}

const nomFull = (f: string) => f.replace(/[[\]:*?/\\]/g, " ").slice(0, 31);

/** tots: the whole phase. fulls: one tab per family, in order. */
export async function llibre(ExcelJS: { Workbook: new () => WB }, fase: Fase, tots: Seccio[], fulls: { familia: string; secs: Seccio[] }[], texts: string[], nota: string) {
  const wb = new ExcelJS.Workbook();
  full(wb.addWorksheet("TOTS") as WS, `Nanta Alta · TOTS · Fase ${fase}`, fase, tots, texts, nota);
  for (const { familia, secs } of fulls) full(wb.addWorksheet(nomFull(familia)) as WS, `Nanta Alta · ${familia} · Fase ${fase}`, fase, secs, texts, nota);
  if (fulls.length === 1) wb.views = [{ activeTab: 1 }];
  return wb.xlsx.writeBuffer();
}

export const nomFitxer = (fase: Fase, familia?: string) => `Nanta Alta - ${familia ? familia.replace(/\./g, "").trim() : "INVITACIÓ"} - Fase ${fase}.xlsx`;
