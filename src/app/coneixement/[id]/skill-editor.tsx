"use client";

import { Check, FileText, Pencil } from "lucide-react";
import { useState } from "react";

import { Doc } from "./doc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type VersioFila = { v: number; autor: string; data: string; canvi: string };

export function SkillEditor({
  fitxer,
  text: inicial,
  versions,
  editor,
}: {
  fitxer: string;
  text: string;
  versions: VersioFila[];
  editor: string;
}) {
  const [text, setText] = useState(inicial);
  const [draft, setDraft] = useState(inicial);
  const [editant, setEditant] = useState(false);
  const [noves, setNoves] = useState<VersioFila[]>([]);

  const totes = [...noves, ...[...versions].reverse()];
  const actual = totes[0]?.v ?? 1;

  function editar() {
    setDraft(text);
    setEditant(true);
  }

  function desar() {
    setNoves((n) => [
      { v: actual + 1, autor: editor, data: "Ara", canvi: draft === text ? "Revisat sense canvis" : "Editat des de l'ERP" },
      ...n,
    ]);
    setText(draft);
    setEditant(false);
  }

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
          <div className="flex h-11 items-center gap-2 border-b border-surface-border bg-surface-inset pr-2 pl-4">
            <FileText className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-mono text-caption text-muted-foreground">{fitxer}</span>
            <span className="shrink-0 font-mono text-caption text-muted-foreground tabular-nums">v{actual}</span>
            {editant ? (
              <>
                <Button size="sm" variant="ghost" onClick={() => setEditant(false)}>
                  Cancel·lar
                </Button>
                <Button size="sm" onClick={desar}>
                  <Check data-icon="inline-start" />
                  Desar
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={editar}>
                <Pencil data-icon="inline-start" />
                Editar
              </Button>
            )}
          </div>
          {editant ? (
            <Textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              className="min-h-96 rounded-none border-0 bg-transparent px-4 py-4 font-mono leading-relaxed focus-visible:ring-0 md:px-6 dark:bg-transparent"
            />
          ) : (
            <div className="p-4 md:p-6">
              <Doc text={text} />
            </div>
          )}
        </div>
        {noves.length > 0 && !editant && (
          <span className={`flex items-center gap-1.5 text-label text-success`}>
            <Check className="size-3.5 shrink-0" />
            Desat · nova versió v{actual} · {editor}
          </span>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-title-sm font-semibold">Versions</h2>
        <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
          {totes.map((v, i) => (
            <div key={v.v} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`w-7 shrink-0 font-mono text-label tabular-nums ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}
              >
                v{v.v}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body font-medium">{v.autor}</span>
                <span className="truncate text-caption text-muted-foreground">{v.canvi}</span>
              </div>
              <span className="shrink-0 text-caption text-muted-foreground">{v.data}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
