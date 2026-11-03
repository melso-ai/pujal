import { Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AskAction } from "@/components/chat/ask-action";
import { SkillEditor } from "./skill-editor";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { EDITOR, getSkill, skills } from "@/lib/coneixement";
import { date } from "@/lib/format";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return skills.map((s) => ({ id: s.id }));
}

export default function SkillPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={null}>
      <Fitxa params={params} />
    </Suspense>
  );
}

async function Fitxa({ params }: { params: Params }) {
  const { id } = await params;
  const s = getSkill(id);
  if (!s) notFound();

  return (
    <>
      <PageHeader crumbs={[{ label: "Coneixement", href: "/coneixement" }, { label: s.titol }]} />
      <div className="flex min-w-0 flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-3">
          <Badge variant="outline" className="w-fit">
            {s.area}
          </Badge>
          <div className="flex flex-col gap-1">
            <h1 className="text-display-sm font-semibold tracking-tight">{s.titol}</h1>
            <span className="text-label text-muted-foreground">Responsable · {s.owner}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <AskAction size="sm" className="rounded-full" prompt={s.pregunta}>
              <Sparkles data-icon="inline-start" />
              Preguntar a l&apos;assistent
            </AskAction>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Usos de l'assistent · 30 dies" value={s.usos} />
          <Stat label="Última edició" value={date(s.editat)} />
        </div>

        <SkillEditor
          key={s.id}
          fitxer={s.fitxer}
          text={s.text}
          editor={EDITOR}
          versions={s.versions.map((v) => ({ ...v, data: date(v.data) }))}
        />
      </div>
    </>
  );
}
