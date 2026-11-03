"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CheckIcon, FileIcon, SearchIcon, UploadIcon } from "lucide-react";

import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { dadesNecessaries } from "@/lib/data";

const fonts = [
  { estat: "Disponible", href: "/pressupostos/pedrasses#documentacio", label: "Documents de Pedrasses" },
  { estat: "Disponible", href: "/pressupostos/pedrasses#partides", label: "Partides de Pedrasses" },
  { estat: "Mostra", href: "/preus", label: "Preus de referència" },
  { estat: "Mostra", href: "/industrials", label: "Directori d’industrials" },
  { estat: "Disponible", href: "/pressupostos/pedrasses#comparatiu", label: "Ofertes de Pedrasses" },
  { estat: "Mostra", href: "/pressupostos/placa-major#comparatiu", label: "Comparatiu d’exemple" },
  { estat: "Mostra", href: "/pressupostos/placa-major#tancament", label: "Full de tancament" },
  { estat: "Mostra", href: "/pressupostos/placa-major#oferta", label: "Oferta d’exemple" },
];

export function DadesBrowser() {
  const [cerca, setCerca] = useState("");
  const [filtre, setFiltre] = useState("");
  const [mostres, setMostres] = useState<Record<number, string>>({});
  const [actiu, setActiu] = useState<number | null>(null);
  const [fitxer, setFitxer] = useState<File | null>(null);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const [avis, setAvis] = useState("");
  const estat = (i: number) => mostres[i] ? "Per revisar" : fonts[i].estat;
  const items = dadesNecessaries.map((d, i) => ({ ...d, i })).filter((d) =>
    `${d.entitat} ${d.font} ${d.camps}`.toLocaleLowerCase("ca").includes(cerca.trim().toLocaleLowerCase("ca")) && (!filtre || estat(d.i) === filtre)
  );

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-caption text-muted-foreground">Fonts de dades</h1>
        <span className="font-mono text-5xl font-medium tabular-nums">3<span className="text-2xl text-muted-foreground"> / 8</span></span>
        <span className="text-caption text-muted-foreground">Fonts amb dades reals de Pedrasses</span>
      </div>
      <div className="flex flex-wrap gap-x-12 gap-y-4">
        <Stat label="Fonts d’exemple" value={5} />
        <Stat label="Mostres per revisar" value={Object.keys(mostres).length} />
        <Stat label="Connexió SQL" value="Pendent" />
      </div>
      {avis && <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-surface-inset p-4 text-label"><span className="flex items-center gap-2"><CheckIcon className="size-4 shrink-0 text-success" />{avis}</span><Button size="sm" variant="ghost" onClick={() => setAvis("")}>Tancar</Button></div>}
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-0 flex-1 basis-52">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={cerca} onChange={(e) => setCerca(e.target.value)} placeholder="Cerca una font o entitat…" aria-label="Cercar fonts" />
          </div>
          <select className="h-9 rounded-lg border bg-card px-3 text-label" value={filtre} onChange={(e) => setFiltre(e.target.value)} aria-label="Filtrar fonts per estat">
            <option value="">Tots els estats</option><option>Disponible</option><option>Mostra</option><option>Per revisar</option>
          </select>
        </div>
        <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
          {items.map((d) => <div key={d.entitat} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-body font-medium">{d.entitat}</h2><Badge variant="outline" className={estat(d.i) === "Disponible" ? "text-success" : estat(d.i) === "Per revisar" ? "text-warning" : "text-muted-foreground"}>{estat(d.i)}</Badge></div>
              <span className="text-caption text-muted-foreground">{d.camps}</span>
              <span className="text-caption text-muted-foreground">{mostres[d.i] ? `Mostra rebuda · ${mostres[d.i]}` : d.font}</span>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={fonts[d.i].href} />}>Veure dades</Button>
              <Button variant="outline" size="sm" onClick={() => { setActiu(d.i); setFitxer(null); setError(""); }}><UploadIcon data-icon="inline-start" />{mostres[d.i] ? "Canviar mostra" : "Adjuntar mostra"}</Button>
            </div>
          </div>)}
          {items.length === 0 && <div className="flex flex-col items-center gap-3 p-8 text-body"><span>Cap font amb aquests filtres</span><Button variant="outline" onClick={() => { setCerca(""); setFiltre(""); }}>Netejar filtres</Button></div>}
        </div>
      </section>
      <Dialog open={actiu !== null} onOpenChange={(open) => { if (!open) setActiu(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Adjuntar mostra</DialogTitle><DialogDescription>{actiu !== null ? dadesNecessaries[actiu].entitat : ""} · revisió local del prototip</DialogDescription></DialogHeader>
          <input ref={input} type="file" className="sr-only" tabIndex={-1} accept=".pdf,.csv,.xlsx,.xls,.bc3,.json,.dwg,.zip" onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            if (!/\.(pdf|csv|xlsx?|bc3|json|dwg|zip)$/i.test(f.name)) { setError("Tria un PDF, Excel, CSV, BC3, JSON, DWG o ZIP."); setFitxer(null); return; }
            if (f.size > 25 * 1024 * 1024 || f.size === 0) { setError("El fitxer ha de tenir contingut i ocupar menys de 25 MB."); setFitxer(null); return; }
            setError(""); setFitxer(f);
          }} />
          <button type="button" onClick={() => input.current?.click()} className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-card border border-dashed border-surface-border bg-surface-inset p-5 text-label hover:bg-surface-hover">
            {fitxer ? <FileIcon className="size-6 text-success" /> : <UploadIcon className="size-6 text-muted-foreground" />}
            <span className="max-w-full break-all text-center">{fitxer?.name ?? "Seleccionar fitxer"}</span>
            <span className="text-caption text-muted-foreground">{fitxer ? `${Math.ceil(fitxer.size / 1024)} KB · Canviar fitxer` : "PDF, Excel, CSV, BC3, JSON, DWG o ZIP · màx. 25 MB"}</span>
          </button>
          {error && <p role="alert" className="text-label text-destructive">{error}</p>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setActiu(null)}>Cancel·lar</Button><Button disabled={!fitxer} onClick={() => {
            if (actiu === null || !fitxer) return;
            setMostres((prev) => ({ ...prev, [actiu]: fitxer.name }));
            setAvis(`Mostra de ${dadesNecessaries[actiu].entitat.toLocaleLowerCase("ca")} desada per revisar.`); setActiu(null);
          }}>Desar mostra</Button></div>
        </DialogContent>
      </Dialog>
    </>
  );
}
