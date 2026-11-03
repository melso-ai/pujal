import { Cloud, FileText, FolderGit2, Sparkles } from "lucide-react";
import Link from "next/link";

import { AskAction } from "@/components/chat/ask-action";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { arees, perArea, skills } from "@/lib/coneixement";
import { date, num } from "@/lib/format";

const propietat = [
  { icon: FolderGit2, label: "Codi al vostre repositori" },
  { icon: Cloud, label: "Dades al vostre núvol" },
  { icon: FileText, label: "Processos en fitxers editables" },
];

export default function ConeixementPage() {
  const usos = skills.reduce((s, k) => s + k.usos, 0);
  const versions = skills.reduce((s, k) => s + k.versions.length, 0);
  const darrer = skills.map((s) => s.editat).sort().at(-1)!;

  return (
    <>
      <PageHeader crumbs={[{ label: "Coneixement" }]} />
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-caption text-muted-foreground">Processos documentats</h1>
          <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">{skills.length}</span>
          <span className="text-caption text-muted-foreground">
            Vostre: codi, dades i coneixement · Google Cloud de Construccions Pujal
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {propietat.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-card bg-surface-inset px-3 py-2.5 ring-1 ring-surface-border"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-label font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            <Stat label="Usos de l'assistent · 30 dies" value={num(usos)} />
            <Stat label="Versions" value={versions} />
            <Stat label="Última edició" value={date(darrer)} />
          </div>
          <AskAction
            size="sm"
            variant="outline"
            className="rounded-full"
            prompt="Vull documentar un procés nou de Pujal. Fes-me les preguntes una a una per escriure'l amb aquestes seccions: Quan s'aplica, Passos, Regles i Excepcions."
          >
            <Sparkles data-icon="inline-start" />
            Documentar un procés
          </AskAction>
        </div>

        {arees.map((a) => {
          const llista = perArea(a);
          return (
            <section key={a} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-title-sm font-semibold">{a}</h2>
                <span className="font-mono text-caption text-muted-foreground tabular-nums">{llista.length}</span>
              </div>
              <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
                {llista.map((s) => (
                  <Link
                    key={s.id}
                    href={`/coneixement/${s.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-body font-medium">{s.titol}</span>
                      <span className="truncate text-caption text-muted-foreground">
                        {s.owner} · {date(s.editat)}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end">
                      <span className="font-mono text-body font-medium tabular-nums">{s.usos}</span>
                      <span className="text-caption text-muted-foreground">usos</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
