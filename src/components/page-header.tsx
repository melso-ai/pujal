import Link from "next/link";
import { Fragment } from "react";

import { AskButton } from "@/components/chat/ask-launchers";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

type Crumb = { label: string; href?: string };

export function PageHeader({
  crumbs,
  children,
}: {
  crumbs: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 bg-page-canvas/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1 text-muted-foreground" />
      <Breadcrumb>
        <BreadcrumbList className="text-label">
          {crumbs.map((c, i) => (
            <Fragment key={c.label}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {c.href ? (
                  <BreadcrumbLink render={<Link href={c.href} />}>
                    {c.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        {children}
        <AskButton />
      </div>
    </header>
  );
}
