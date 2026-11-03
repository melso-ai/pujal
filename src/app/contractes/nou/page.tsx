import { Suspense } from "react";

import { GeneradorContracte } from "@/components/contractes/generador-contracte";
import { PageHeader } from "@/components/page-header";

export default function NouContractePage(props: PageProps<"/contractes/nou">) {
  return (
    <>
      <PageHeader crumbs={[{ label: "Contractes", href: "/contractes" }, { label: "Nou contracte" }]} />
      <Suspense fallback={null}>
        <Generador searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

const text = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

async function Generador({ searchParams }: { searchParams: PageProps<"/contractes/nou">["searchParams"] }) {
  const sp = await searchParams;
  const tipus = text(sp.tipus);
  const obra = text(sp.obra);
  const industrial = text(sp.industrial);
  return (
    <GeneradorContracte
      key={`${tipus}-${obra}-${industrial}`}
      tipus={tipus === "client" || tipus === "industrial" ? tipus : undefined}
      obra={obra}
      industrial={industrial}
    />
  );
}
