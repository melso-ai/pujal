import { DadesBrowser } from "@/components/dades/dades-browser";
import { PageHeader } from "@/components/page-header";

export default function DadesPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Dades" }]} />
      <div className="flex min-w-0 flex-col gap-8 p-4 md:p-8">
        <DadesBrowser />
      </div>
    </>
  );
}
