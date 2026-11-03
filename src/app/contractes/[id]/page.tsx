import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ContracteDetall } from "@/components/contractes/contracte-detall";
import { PageHeader } from "@/components/page-header";
import { contractes, getContracte } from "@/lib/contractes";

export function generateStaticParams() {
  return contractes.map((c) => ({ id: c.id }));
}

export default function ContractePage(props: PageProps<"/contractes/[id]">) {
  return (
    <Suspense fallback={null}>
      <Contracte params={props.params} />
    </Suspense>
  );
}

async function Contracte({ params }: { params: PageProps<"/contractes/[id]">["params"] }) {
  const { id } = await params;
  const c = getContracte(id);
  if (!c) notFound();

  return (
    <>
      <PageHeader crumbs={[{ label: "Contractes", href: "/contractes" }, { label: c.num }]} />
      <ContracteDetall inicial={c} />
    </>
  );
}
