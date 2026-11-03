import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ObraDetail } from "@/components/obres/obra-detail";
import { getObra, obres } from "@/lib/data";

export function generateStaticParams() {
  return obres.map((o) => ({ id: o.id }));
}

export default function ObraPage(props: PageProps<"/obres/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-body text-muted-foreground">
          Carregant obra…
        </div>
      }
    >
      <Obra params={props.params} />
    </Suspense>
  );
}

async function Obra({
  params,
}: {
  params: PageProps<"/obres/[id]">["params"];
}) {
  const { id } = await params;
  const obra = getObra(id);
  if (!obra) notFound();
  return <ObraDetail key={obra.id} obra={obra} />;
}
