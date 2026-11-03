import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Negociador } from "@/components/estudi/negociador";
import { PageHeader } from "@/components/page-header";

export function generateStaticParams() {
  return [{ id: "pedrasses" }];
}

export default function NegociarPage(props: PageProps<"/pressupostos/[id]/negociar">) {
  return (
    <Suspense fallback={null}>
      <Negociar params={props.params} />
    </Suspense>
  );
}

async function Negociar({ params }: { params: PageProps<"/pressupostos/[id]/negociar">["params"] }) {
  const { id } = await params;
  if (id !== "pedrasses") notFound();

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Pressupostos", href: "/pressupostos" },
          { label: "Xalets Les Pedrasses", href: "/pressupostos/pedrasses#comparatiu" },
          { label: "Negociar" },
        ]}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-col p-4 md:p-8">
        <Negociador />
      </div>
    </>
  );
}
