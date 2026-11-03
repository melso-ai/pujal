import { NouEstudi } from "@/components/estudi/nou-estudi";
import { PageHeader } from "@/components/page-header";

export default function NouEstudiPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Pressupostos", href: "/pressupostos" }, { label: "Nou estudi" }]}
      />
      <NouEstudi />
    </>
  );
}
